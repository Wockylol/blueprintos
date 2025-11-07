import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RecoveryRequest {
  userId: string;
}

interface RecoveryResponse {
  success: boolean;
  message: string;
  profileCreated?: boolean;
  workspaceCreated?: boolean;
  profileId?: string;
  workspaceId?: string;
  error?: string;
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
    console.log("[admin-create-profile] Request received");

    // SECURITY: Only allow in development/staging
    const isDev = Deno.env.get("ENVIRONMENT") === "development" || 
                  Deno.env.get("ENVIRONMENT") === "staging" ||
                  !Deno.env.get("ENVIRONMENT"); // Default to allowing if not set (for local dev)

    if (!isDev) {
      console.warn("[admin-create-profile] Rejected: production environment");
      return new Response(
        JSON.stringify({
          success: false,
          message: "This endpoint is only available in development/staging",
          error: "PRODUCTION_DISABLED",
        } as RecoveryResponse),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

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

    const body: RecoveryRequest = await req.json();
    const { userId } = body;

    if (!userId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Missing userId",
          error: "MISSING_USER_ID",
        } as RecoveryResponse),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[admin-create-profile] Recovery request for user: ${userId}`);

    // Check if user exists in auth.users
    const { data: authUser, error: authError } = await adminClient.auth.admin.getUserById(userId);

    if (authError || !authUser) {
      console.error("[admin-create-profile] Auth user not found:", authError);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Auth user not found",
          error: "USER_NOT_FOUND",
        } as RecoveryResponse),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[admin-create-profile] Auth user found: ${authUser.user.email}`);

    // Check if profile already exists
    const { data: existingProfile } = await adminClient
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (existingProfile) {
      console.log("[admin-create-profile] Profile already exists");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Profile already exists",
          profileCreated: false,
          profileId: existingProfile.id,
          workspaceId: existingProfile.workspace_id,
        } as RecoveryResponse),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Extract user info
    const fullName = authUser.user.user_metadata?.full_name || authUser.user.email?.split('@')[0] || "User";
    const role = authUser.user.user_metadata?.role || "coach"; // Default to coach

    console.log(`[admin-create-profile] Creating profile for ${fullName} as ${role}`);

    let workspaceId: string | null = null;
    let workspaceCreated = false;

    // Create workspace for coaches
    if (role === "coach") {
      console.log("[admin-create-profile] Creating workspace for coach");
      const workspaceName = `${fullName}'s Workspace`;
      const subdomain = generateSubdomainFromName(workspaceName);

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

      if (workspaceError) {
        console.error("[admin-create-profile] Workspace creation failed:", workspaceError);
        throw new Error(`Workspace creation failed: ${workspaceError.message}`);
      }

      workspaceId = workspaceData.id;
      workspaceCreated = true;
      console.log(`[admin-create-profile] Workspace created: ${workspaceId}`);

      // Create workspace subscription
      await adminClient.from("workspace_subscriptions").insert({
        workspace_id: workspaceId,
        plan_tier: "starter",
        status: "trialing",
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      });

      // Create workspace features
      await adminClient.from("workspace_features").insert({
        workspace_id: workspaceId,
        max_clients: 10,
        custom_domain_enabled: false,
        white_label_enabled: false,
        api_access_enabled: false,
        team_members_enabled: false,
        ai_generation_credits: 10,
      });
    }

    // Create profile
    console.log("[admin-create-profile] Creating profile");
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

    if (profileError) {
      console.error("[admin-create-profile] Profile creation failed:", profileError);
      throw new Error(`Profile creation failed: ${profileError.message}`);
    }

    console.log(`[admin-create-profile] Profile created successfully: ${profileData.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Profile created successfully",
        profileCreated: true,
        workspaceCreated,
        profileId: profileData.id,
        workspaceId,
      } as RecoveryResponse),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[admin-create-profile] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
        error: "INTERNAL_ERROR",
      } as RecoveryResponse),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});