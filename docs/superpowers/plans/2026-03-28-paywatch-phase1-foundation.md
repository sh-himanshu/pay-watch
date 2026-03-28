# PayWatch Phase 1: Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install all dependencies, set up Supabase clients, create the full database schema with RLS, and implement Google OAuth authentication.

**Architecture:** Supabase handles auth (Google OAuth) and data (Postgres + RLS). The Next.js middleware refreshes sessions on every request. Auth callback stores Gmail tokens in the `email_accounts` table for later use by the email sync service.

**Tech Stack:** Next.js 16 App Router, Supabase (`@supabase/supabase-js`, `@supabase/ssr`), Google OAuth, TypeScript

**Spec references:** `docs/superpowers/specs/paywatch/01-data-model.md`, `docs/superpowers/specs/paywatch/06-auth-api-routes.md`

**Prerequisites:** Create a Supabase project at supabase.com. Enable Google OAuth provider in Supabase Dashboard > Authentication > Providers. Configure Google Cloud Console OAuth credentials with the Supabase callback URL. Have all env var values ready before starting.

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime dependencies**

```bash
cd /Users/himan/Desktop/projects/pay-watch
pnpm add @supabase/supabase-js @supabase/ssr googleapis openai resend web-push lucide-react
```

- [ ] **Step 2: Install dev dependencies**

```bash
pnpm add -D @types/web-push vitest
```

- [ ] **Step 3: Verify installation**

```bash
pnpm ls --depth=0
```

Expected: All packages listed without errors.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: install supabase, googleapis, openai, resend, web-push, lucide-react, vitest"
```

---

### Task 2: Environment Variables & Vitest Config

**Files:**
- Create: `.env.local.example`
- Create: `vitest.config.ts`

- [ ] **Step 1: Create env template**

Create `.env.local.example`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google OAuth (configured in Supabase dashboard, not used directly in app)
# GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in Supabase dashboard

# OpenAI (LLM fallback parser)
OPENAI_API_KEY=sk-your-openai-key

# Resend (email digest)
RESEND_API_KEY=re_your-resend-key

# Web Push (generate with: npx web-push generate-vapid-keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key

# Cron security
CRON_SECRET=your-random-secret-string
```

- [ ] **Step 2: Create vitest config**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
	test: {
		globals: true,
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "."),
		},
	},
});
```

- [ ] **Step 3: Verify .env.local exists**

The implementer must create `.env.local` with real values from their Supabase project. This is NOT committed to git.

```bash
# Check .gitignore already contains .env.local (create-next-app includes it)
grep ".env.local" .gitignore
```

Expected: `.env*.local` or `.env.local` is listed.

- [ ] **Step 4: Commit**

```bash
git add .env.local.example vitest.config.ts
git commit -m "chore: add env var template and vitest config"
```

---

### Task 3: Shared TypeScript Types

**Files:**
- Create: `lib/types.ts`

- [ ] **Step 1: Create shared types**

Create `lib/types.ts`:

```typescript
export type User = {
	id: string;
	email: string;
	display_name: string;
	avatar_url: string | null;
	created_at: string;
	updated_at: string;
};

export type EmailAccount = {
	id: string;
	user_id: string;
	provider: "gmail";
	email_address: string;
	access_token: string;
	refresh_token: string;
	token_expires_at: string;
	last_synced_at: string | null;
	sync_status: "active" | "error" | "disconnected";
	created_at: string;
};

export type BillerCategory =
	| "subscription"
	| "utility"
	| "credit_card"
	| "insurance"
	| "other";

export type Biller = {
	id: string;
	user_id: string;
	name: string;
	category: BillerCategory;
	typical_amount: number | null;
	billing_frequency: "monthly" | "quarterly" | "annual" | "irregular";
	first_seen_at: string;
	created_at: string;
};

export type BillStatus = "upcoming" | "due_soon" | "overdue" | "paid";

export type Bill = {
	id: string;
	user_id: string;
	biller_id: string;
	email_account_id: string;
	amount: number;
	due_date: string;
	status: BillStatus;
	source_email_id: string;
	source_email_subject: string;
	source_email_date: string;
	parsed_by: "rules" | "llm";
	confidence: number;
	created_at: string;
};

export type AlertType =
	| "price_increase"
	| "unexpected_charge"
	| "new_biller";

export type AlertSeverity = "urgent" | "warning" | "info";

export type Alert = {
	id: string;
	user_id: string;
	bill_id: string | null;
	biller_id: string;
	type: AlertType;
	severity: AlertSeverity;
	title: string;
	description: string;
	metadata: Record<string, unknown>;
	is_read: boolean;
	is_dismissed: boolean;
	created_at: string;
};

export type NotificationPreferences = {
	id: string;
	user_id: string;
	push_enabled: boolean;
	push_subscription: Record<string, unknown> | null;
	email_digest_enabled: boolean;
	email_digest_frequency: "daily" | "weekly";
	quiet_hours_start: string | null;
	quiet_hours_end: string | null;
	alert_price_increase: boolean;
	alert_unexpected_charge: boolean;
	alert_new_biller: boolean;
	alert_due_reminder: boolean;
	reminder_days_before: number;
	created_at: string;
};
```

- [ ] **Step 2: Commit**

```bash
git add lib/types.ts
git commit -m "feat: add shared TypeScript types for all database tables"
```

---

### Task 4: Supabase Client Setup

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/admin.ts`

- [ ] **Step 1: Create browser client**

Create `lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
	return createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
	);
}
```

- [ ] **Step 2: Create server client**

Create `lib/supabase/server.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
	const cookieStore = await cookies();

	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return cookieStore.getAll();
				},
				setAll(cookiesToSet) {
					for (const { name, value, options } of cookiesToSet) {
						cookieStore.set(name, value, options);
					}
				},
			},
		},
	);
}
```

- [ ] **Step 3: Create admin client (service-role for cron jobs)**

Create `lib/supabase/admin.ts`:

```typescript
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
	return createSupabaseClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!,
	);
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/
git commit -m "feat: add Supabase client helpers (browser, server, admin)"
```

---

### Task 5: Database Migration

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Create migration file**

Create `supabase/migrations/001_initial_schema.sql`:

```sql
-- PayWatch: Initial Schema
-- 6 tables with RLS scoped to auth.uid()

-- 1. users (synced from Supabase auth.users via trigger)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can read own profile"
  on public.users for select
  using (id = auth.uid());

create policy "Users can update own profile"
  on public.users for update
  using (id = auth.uid());

-- Auto-update updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at
  before update on public.users
  for each row execute function public.handle_updated_at();

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', null)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. email_accounts
create table public.email_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  provider text not null default 'gmail',
  email_address text not null,
  access_token text not null,
  refresh_token text not null,
  token_expires_at timestamptz not null,
  last_synced_at timestamptz,
  sync_status text not null default 'active'
    check (sync_status in ('active', 'error', 'disconnected')),
  created_at timestamptz not null default now()
);

alter table public.email_accounts enable row level security;

create policy "Users can read own email accounts"
  on public.email_accounts for select
  using (user_id = auth.uid());

create policy "Users can insert own email accounts"
  on public.email_accounts for insert
  with check (user_id = auth.uid());

create policy "Users can update own email accounts"
  on public.email_accounts for update
  using (user_id = auth.uid());

-- 3. billers
create table public.billers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  category text not null default 'other'
    check (category in ('subscription', 'utility', 'credit_card', 'insurance', 'other')),
  typical_amount numeric(10,2),
  billing_frequency text not null default 'monthly'
    check (billing_frequency in ('monthly', 'quarterly', 'annual', 'irregular')),
  first_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.billers enable row level security;

create policy "Users can read own billers"
  on public.billers for select
  using (user_id = auth.uid());

create policy "Users can insert own billers"
  on public.billers for insert
  with check (user_id = auth.uid());

create policy "Users can update own billers"
  on public.billers for update
  using (user_id = auth.uid());

-- 4. bills
create table public.bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  biller_id uuid not null references public.billers(id) on delete cascade,
  email_account_id uuid not null references public.email_accounts(id) on delete cascade,
  amount numeric(10,2) not null,
  due_date date not null,
  status text not null default 'upcoming'
    check (status in ('upcoming', 'due_soon', 'overdue', 'paid')),
  source_email_id text not null,
  source_email_subject text not null default '',
  source_email_date timestamptz not null,
  parsed_by text not null check (parsed_by in ('rules', 'llm')),
  confidence numeric(3,2) not null default 0.00,
  created_at timestamptz not null default now(),
  unique (user_id, biller_id, source_email_id)
);

alter table public.bills enable row level security;

create policy "Users can read own bills"
  on public.bills for select
  using (user_id = auth.uid());

create policy "Users can insert own bills"
  on public.bills for insert
  with check (user_id = auth.uid());

create policy "Users can update own bills"
  on public.bills for update
  using (user_id = auth.uid());

-- 5. alerts
create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  bill_id uuid references public.bills(id) on delete set null,
  biller_id uuid not null references public.billers(id) on delete cascade,
  type text not null
    check (type in ('price_increase', 'unexpected_charge', 'new_biller')),
  severity text not null
    check (severity in ('urgent', 'warning', 'info')),
  title text not null,
  description text not null default '',
  metadata jsonb not null default '{}',
  is_read boolean not null default false,
  is_dismissed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.alerts enable row level security;

create policy "Users can read own alerts"
  on public.alerts for select
  using (user_id = auth.uid());

create policy "Users can update own alerts"
  on public.alerts for update
  using (user_id = auth.uid());

-- 6. notification_preferences
create table public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade unique,
  push_enabled boolean not null default true,
  push_subscription jsonb,
  email_digest_enabled boolean not null default true,
  email_digest_frequency text not null default 'daily'
    check (email_digest_frequency in ('daily', 'weekly')),
  quiet_hours_start time,
  quiet_hours_end time,
  alert_price_increase boolean not null default true,
  alert_unexpected_charge boolean not null default true,
  alert_new_biller boolean not null default true,
  alert_due_reminder boolean not null default true,
  reminder_days_before integer not null default 3,
  created_at timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;

create policy "Users can read own notification preferences"
  on public.notification_preferences for select
  using (user_id = auth.uid());

create policy "Users can insert own notification preferences"
  on public.notification_preferences for insert
  with check (user_id = auth.uid());

create policy "Users can update own notification preferences"
  on public.notification_preferences for update
  using (user_id = auth.uid());

-- Auto-create notification preferences on user creation
create or replace function public.handle_new_user_preferences()
returns trigger as $$
begin
  insert into public.notification_preferences (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_user_created_preferences
  after insert on public.users
  for each row execute function public.handle_new_user_preferences();
```

- [ ] **Step 2: Apply migration**

Run this SQL in the Supabase Dashboard > SQL Editor, or via `supabase db push` if using Supabase CLI.

- [ ] **Step 3: Verify tables exist**

In Supabase Dashboard > Table Editor, confirm all 6 tables are visible: `users`, `email_accounts`, `billers`, `bills`, `alerts`, `notification_preferences`.

- [ ] **Step 4: Commit**

```bash
git add supabase/
git commit -m "feat: add database migration with 6 tables, RLS policies, and triggers"
```

---

### Task 6: Next.js Auth Middleware

**Files:**
- Create: `middleware.ts`

- [ ] **Step 1: Create middleware**

Create `middleware.ts` in the project root:

```typescript
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
	let response = NextResponse.next({ request });

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					for (const { name, value } of cookiesToSet) {
						request.cookies.set(name, value);
					}
					response = NextResponse.next({ request });
					for (const { name, value, options } of cookiesToSet) {
						response.cookies.set(name, value, options);
					}
				},
			},
		},
	);

	const {
		data: { user },
	} = await supabase.auth.getUser();

	// Protect dashboard routes — redirect to login if not authenticated
	if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
		const url = request.nextUrl.clone();
		url.pathname = "/login";
		return NextResponse.redirect(url);
	}

	// Redirect authenticated users away from login page
	if (user && request.nextUrl.pathname === "/login") {
		const url = request.nextUrl.clone();
		url.pathname = "/dashboard";
		return NextResponse.redirect(url);
	}

	return response;
}

export const config = {
	matcher: ["/dashboard/:path*", "/login"],
};
```

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat: add auth middleware to protect dashboard routes"
```

---

### Task 7: Auth Callback Route

**Files:**
- Create: `app/auth/callback/route.ts`

- [ ] **Step 1: Create callback handler**

Create `app/auth/callback/route.ts`:

```typescript
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url);
	const code = searchParams.get("code");

	if (code) {
		const supabase = await createClient();
		const { data, error } = await supabase.auth.exchangeCodeForSession(code);

		if (!error && data.session) {
			// Store Gmail tokens in email_accounts for later email sync
			const providerToken = data.session.provider_token;
			const providerRefreshToken = data.session.provider_refresh_token;
			const user = data.session.user;

			if (providerToken && user.email) {
				const { error: upsertError } = await supabase
					.from("email_accounts")
					.upsert(
						{
							user_id: user.id,
							provider: "gmail",
							email_address: user.email,
							access_token: providerToken,
							refresh_token: providerRefreshToken ?? "",
							token_expires_at: new Date(
								Date.now() + 3600 * 1000,
							).toISOString(),
							sync_status: "active",
						},
						{ onConflict: "user_id,email_address" },
					);

				if (upsertError) {
					console.error("Failed to store email account:", upsertError);
				}
			}

			return NextResponse.redirect(`${origin}/dashboard`);
		}
	}

	// Auth failed — redirect to login with error
	return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
```

- [ ] **Step 2: Add unique constraint for upsert**

The upsert above needs a unique constraint on `(user_id, email_address)`. Add to the migration file or run this SQL in Supabase:

```sql
create unique index email_accounts_user_email_idx
  on public.email_accounts (user_id, email_address);
```

- [ ] **Step 3: Commit**

```bash
git add app/auth/callback/
git commit -m "feat: add OAuth callback route that stores Gmail tokens"
```

---

### Task 8: Minimal Login Page (Placeholder)

**Files:**
- Create: `app/login/page.tsx`

This is a minimal functional login page. The full styled version is in Phase 3.

- [ ] **Step 1: Create login page**

Create `app/login/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LoginButton } from "./login-button";

export default async function LoginPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (user) {
		redirect("/dashboard");
	}

	return (
		<div className="flex min-h-screen items-center justify-center">
			<div className="w-full max-w-sm space-y-6 text-center">
				<h1 className="text-2xl font-bold">PayWatch</h1>
				<p className="text-sm text-foreground/60">
					Connect your Gmail to track bills and catch hidden fees.
				</p>
				<LoginButton />
			</div>
		</div>
	);
}
```

- [ ] **Step 2: Create login button (client component)**

Create `app/login/login-button.tsx`:

```tsx
"use client";

import { createClient } from "@/lib/supabase/client";

export function LoginButton() {
	const handleLogin = async () => {
		const supabase = createClient();
		await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: `${window.location.origin}/auth/callback`,
				scopes: "openid email profile https://www.googleapis.com/auth/gmail.readonly",
			},
		});
	};

	return (
		<button
			type="button"
			onClick={handleLogin}
			className="w-full rounded-lg bg-white px-4 py-3 text-sm font-medium text-black hover:bg-white/90"
		>
			Sign in with Google
		</button>
	);
}
```

- [ ] **Step 3: Commit**

```bash
git add app/login/
git commit -m "feat: add minimal login page with Google OAuth"
```

---

### Task 9: Minimal Dashboard Page (Placeholder)

**Files:**
- Create: `app/dashboard/page.tsx`
- Create: `app/dashboard/layout.tsx`

Minimal versions to verify auth flow works. Full styled versions are in Phase 3.

- [ ] **Step 1: Create dashboard layout**

Create `app/dashboard/layout.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/login");
	}

	return <div className="min-h-screen">{children}</div>;
}
```

- [ ] **Step 2: Create dashboard page**

Create `app/dashboard/page.tsx`:

```tsx
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	return (
		<div className="p-8">
			<h1 className="text-2xl font-bold">Dashboard</h1>
			<p className="mt-2 text-foreground/60">
				Welcome, {user?.user_metadata?.full_name ?? user?.email}
			</p>
			<p className="mt-4 text-sm text-foreground/40">
				Phase 1 complete. Dashboard UI coming in Phase 3.
			</p>
		</div>
	);
}
```

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/
git commit -m "feat: add minimal dashboard layout and page (placeholder)"
```

---

### Task 10: Verify Build

- [ ] **Step 1: Run the build**

```bash
pnpm build
```

Expected: Build succeeds with no errors. If there are type errors, fix them before proceeding.

- [ ] **Step 2: Run dev server and test auth flow manually**

```bash
pnpm dev
```

1. Open `http://localhost:3000/dashboard` — should redirect to `/login`
2. Click "Sign in with Google" — should redirect to Google OAuth
3. After sign-in — should redirect to `/dashboard` with your name shown
4. Check Supabase Dashboard > Table Editor > `users` — your profile should exist
5. Check `email_accounts` — your Gmail account should be listed with tokens
6. Check `notification_preferences` — a default row should exist for your user

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve build/auth issues from phase 1 verification"
```

(Skip this step if no fixes were needed.)
