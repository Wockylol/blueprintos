import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
  role: "coach" | "client";
  workspaceName?: string;
}

interface SignupResponse {
  success: boolean;
  userId?: string;
  workspaceId?: string;
  profileId?: string;
  error?: string;
  errorCode?: string;
  step?: string;
}

function generateSubdomainFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 63) + "-" + Math.random().toString(36).substring(2, 6);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log("[signup-coach] Request received");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing Supabase configuration");
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const body: SignupRequest = await req.json();
    const { email, password, fullName, role, workspaceName } = body;

    console.log(`[signup-coach] Starting signup for ${email} as ${role}`);

    if (!email || !password || !fullName || !role) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields",
          errorCode: "MISSING_FIELDS",
        } as SignupResponse),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (role === "coach" && (!workspaceName || !workspaceName.trim())) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Workspace name required for coach accounts",
          errorCode: "MISSING_WORKSPACE_NAME",
          step: "validation",
        } as SignupResponse),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // STEP 1: Create auth user
    console.log("[signup-coach] Step 1: Creating auth user");
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role,
      },
    });

    if (authError || !authData.user) {
      console.error("[signup-coach] Auth user creation failed:", authError);
      return new Response(
        JSON.stringify({
          success: false,
          error: authError?.message || "Failed to create user",
          errorCode: "AUTH_CREATION_FAILED",
          step: "auth_user",
        } as SignupResponse),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userId = authData.user.id;
    console.log(`[signup-coach] Auth user created: ${userId}`);

    let workspaceId: string | null = null;
    let profileId: string | null = null;

    try {
      // STEP 2: Create workspace for coaches
      if (role === "coach") {
        console.log("[signup-coach] Step 2: Creating workspace");
        const subdomain = generateSubdomainFromName(workspaceName!);
        
        const { data: workspaceData, error: workspaceError } = await adminClient
          .from("workspaces")
          .insert({
            name: workspaceName,
            subdomain,
            owner_id: userId,
            is_active: true,
          })
          .select()
          .single();

        if (workspaceError || !workspaceData) {
          throw new Error(`Workspace creation failed: ${workspaceError?.message}`);
        }

        workspaceId = workspaceData.id;
        console.log(`[signup-coach] Workspace created: ${workspaceId}`);

        // STEP 3: Create workspace subscription
        console.log("[signup-coach] Step 3: Creating workspace subscription");
        const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
        
        const { error: subError } = await adminClient
          .from("workspace_subscriptions")
          .insert({
            workspace_id: workspaceId,
            plan_tier: "starter",
            status: "trialing",
            trial_ends_at: trialEndsAt,
          });

        if (subError) {
          console.error("[signup-coach] Subscription creation error:", subError);
        }

        // STEP 4: Create workspace features
        console.log("[signup-coach] Step 4: Creating workspace features");
        const { error: featuresError } = await adminClient
          .from("workspace_features")
          .insert({
            workspace_id: workspaceId,
            max_clients: 10,
            custom_domain_enabled: false,
            white_label_enabled: false,
            api_access_enabled: false,
            team_members_enabled: false,
            ai_generation_credits: 10,
          });

        if (featuresError) {
          console.error("[signup-coach] Features creation error:", featuresError);
        }
      }

      // STEP 5: Create profile
      console.log("[signup-coach] Step 5: Creating profile");
      const { data: profileData, error: profileError } = await adminClient
        .from("profiles")
        .insert({
          id: userId,
          role,
          full_name: fullName,
          workspace_id: workspaceId,
          onboarding_completed: role === "client",
        })
        .select()
        .single();

      if (profileError || !profileData) {
        throw new Error(`Profile creation failed: ${profileError?.message}`);
      }

      profileId = profileData.id;
      console.log(`[signup-coach] Profile created: ${profileId}`);

      // SUCCESS!
      console.log(`[signup-coach] Signup complete for ${email}`);
      return new Response(
        JSON.stringify({
          success: true,
          userId,
          workspaceId,
          profileId,
        } as SignupResponse),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (setupError) {
      // ROLLBACK: Delete the auth user if workspace/profile creation failed
      console.error("[signup-coach] Setup error, attempting rollback:", setupError);
      
      try {
        await adminClient.auth.admin.deleteUser(userId);
        console.log(`[signup-coach] Rolled back user: ${userId}`);
      } catch (rollbackError) {
        console.error("[signup-coach] Rollback failed:", rollbackError);
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: setupError instanceof Error ? setupError.message : "Account setup failed",
          errorCode: "SETUP_FAILED",
          step: workspaceId ? "profile" : "workspace",
        } as SignupResponse),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("[signup-coach] Unexpected error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        errorCode: "INTERNAL_ERROR",
      } as SignupResponse),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});