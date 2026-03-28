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

-- Unique constraint for upsert in auth callback
create unique index email_accounts_user_email_idx
  on public.email_accounts (user_id, email_address);

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

-- Unique constraint for upsert in email sync
create unique index billers_user_name_idx
  on public.billers (user_id, name);

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
