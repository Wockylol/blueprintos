# BlueprintOS - Multi-Tenant Coaching SaaS Platform

A white-label coaching platform that empowers coaches to launch their own branded coaching business with domain, landing page, modules, client dashboard, and transformation tools in minutes.

## Features

### For Platform Operators
- **Multi-tenant architecture** with workspace isolation
- **Superadmin dashboard** for monitoring all workspaces
- **Subscription management** with Stripe integration
- **Analytics and reporting** across all coaches

### For Coaches
- **AI-powered landing page builder** - Describe your coaching business and get a professional landing page
- **Custom branding** - Logo, colors, and subdomain customization
- **Client management** - Dashboard for tracking clients, sessions, and progress
- **Module creation** - Build and assign coaching content
- **Journal review** - Read and respond to client reflections
- **Pricing tiers** - Define custom coaching packages
- **Workspace onboarding wizard** - 6-step setup process

### For Clients
- **Personalized dashboard** with assigned modules and tasks
- **Progress tracking** with streaks and milestones
- **Session booking** with coaches
- **Journal entries** with audio/text support
- **Branded experience** with coach's custom theme

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI**: OpenAI GPT-4 (optional, for landing page generation)

## Multi-Tenant Architecture

### Database Schema
- `workspaces` - Each coach's isolated business environment
- `workspace_subscriptions` - SaaS subscription tracking
- `pricing_tiers` - Coach-defined client packages
- `landing_page_prompts` - AI generation history
- All existing tables extended with `workspace_id` for isolation

### Row Level Security (RLS)
- Workspace-scoped policies on all tables
- Coaches only see data within their workspace
- Clients only access data from their assigned workspace
- Superadmins have cross-workspace read access

### Workspace Resolution
- Subdomain-based routing (e.g., `coach1.blueprintos.com`)
- Custom domain support (future feature)
- Dynamic theme injection based on workspace branding

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- OpenAI API key (optional, for AI features)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

   Fill in your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENAI_API_KEY=your_openai_key (optional)
   ```

4. The database migrations are already applied. Verify tables exist in Supabase dashboard.

5. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production

```bash
npm run build
```

## User Flows

### Coach Signup Flow
1. Coach signs up with business name
2. Workspace is automatically created with subdomain
3. 14-day trial subscription is activated
4. Coach enters onboarding wizard:
   - Step 1: Business info (name, subdomain)
   - Step 2: Branding (logo, colors)
   - Step 3: AI landing page generation
   - Step 4: Pricing tiers setup
   - Step 5: Stripe Connect (optional)
   - Step 6: Review and launch
5. Coach dashboard becomes available

### Client Signup Flow
1. Client visits coach's subdomain (e.g., `coach1.blueprintos.com`)
2. Clicks "Get Started" on landing page
3. Signs up (automatically assigned to coach's workspace)
4. Client dashboard becomes available with assigned content

### Landing Page Customization
1. Coach navigates to "Landing Page" tab
2. Selects coaching niche and tone
3. Describes coaching business in natural language
4. AI generates hero section, about, how it works, etc.
5. Coach previews and publishes changes
6. Landing page updates instantly at subdomain

## AI Landing Page Generation

### How It Works
1. Coach provides a description of their coaching business
2. System sends prompt to OpenAI GPT-4 with structured output format
3. AI extracts headline, subheadline, CTAs, steps, and bullet points
4. Configuration is saved as JSON in `workspaces.landing_page_config`
5. Dynamic renderer displays content based on JSON structure

### Fallback Mode
If OpenAI API key is not configured, the system uses niche-specific templates:
- Fitness, Business, Mindset, Career, Relationships, Trauma, Spirituality, Life, Executive, Health

### Configuration Schema
```typescript
{
  hero: { headline, subheadline, cta_primary_text, cta_secondary_text },
  about: { title, description, bullet_points[] },
  how_it_works: { title, steps[] },
  testimonials: { layout, max_visible, rotation_enabled },
  pricing_display: { layout_style, show_comparison },
  theme: { primary_color, secondary_color, font_pairing },
  sections_enabled: string[]
}
```

## Database Migrations

All migrations are in `supabase/migrations/`:
- `20251106193926_create_initial_schema.sql` - Initial single-coach schema
- `add_multi_tenant_workspaces.sql` - Multi-tenant transformation

### Key Tables
- `workspaces` - Coach business environments
- `workspace_subscriptions` - SaaS subscription tracking
- `pricing_tiers` - Coach-defined packages
- `landing_page_prompts` - AI generation history
- `ai_generation_log` - Token usage tracking

## Workspace Branding

Coaches can customize:
- Logo (URL or upload)
- Primary color (hex)
- Secondary color (hex)
- Subdomain (auto-generated from business name)
- Landing page content (AI-generated or manual)
- Pricing tiers (name, price, duration, features)

Theme colors are injected as CSS variables:
```css
--workspace-primary: #3B82F6
--workspace-secondary: #8B5CF6
```

## Stripe Integration (Coming Soon)

### Dual Payment Flow
1. **Coaches pay platform**: Monthly SaaS subscription ($97-$997/mo)
2. **Clients pay coaches**: Via Stripe Connect for coaching packages

### Features
- Stripe Connect for coach payouts
- Subscription management
- Invoice generation
- Payment history
- Automated retry logic

## Roadmap

### MVP (Current)
- [x] Multi-tenant database schema
- [x] Workspace-scoped RLS policies
- [x] Coach onboarding wizard
- [x] AI landing page generation
- [x] Dynamic landing page renderer
- [x] Workspace branding and theming
- [x] Basic coach dashboard
- [x] Client dashboard structure

### V2 (Next)
- [ ] Superadmin dashboard
- [ ] Stripe Connect integration
- [ ] Custom domain support
- [ ] Module builder UI
- [ ] Journal review interface
- [ ] Session scheduling calendar
- [ ] Client invitation system

### V3 (Future)
- [ ] Team collaboration (co-coaches, assistants)
- [ ] Advanced analytics and reporting
- [ ] Mobile app (React Native)
- [ ] Webhook integrations
- [ ] White-label mobile apps
- [ ] Marketplace for modules and templates

## Contributing

This is a private project for internal use. For questions or suggestions, contact the platform team.

## License

Proprietary - All rights reserved
