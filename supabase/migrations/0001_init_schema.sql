-- Angetic Essence: initial schema
-- Tables: profiles (public mirror of auth.users), subscriptions, license_keys
-- All tables have RLS enabled. Writes to subscriptions/license_keys happen only via
-- the service-role key (Stripe webhook); end users get read-only access to their own rows.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- users: Supabase manages credentials in auth.users. We keep a public profile
-- row per user so the app can join against it (and so RLS-safe reads are easy).
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  created_at  timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "users: read own row"
  on public.users for select
  using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  -- every account starts on the Free tier
  insert into public.subscriptions (user_id, tier, status) values (new.id, 'free', 'active')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- subscriptions: one row per user, mirrors Stripe state.
-- ---------------------------------------------------------------------------
create type public.subscription_tier as enum ('free', 'pro');
create type public.billing_plan      as enum ('monthly', 'lifetime');

create table if not exists public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null unique references public.users (id) on delete cascade,
  tier                    public.subscription_tier not null default 'free',
  plan                    public.billing_plan,                 -- null for free
  status                  text not null default 'active',      -- Stripe status (active, past_due, canceled, ...)
  stripe_customer_id      text unique,
  stripe_subscription_id  text unique,                         -- null for lifetime one-off purchases
  current_period_end      timestamptz,                         -- null for lifetime
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index if not exists subscriptions_customer_idx on public.subscriptions (stripe_customer_id);

alter table public.subscriptions enable row level security;

create policy "subscriptions: read own row"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- trigger is created after subscriptions exists
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- license_keys: cryptographically random, unique, human-friendly keys.
-- Format: AE-XXXX-XXXX-XXXX-XXXX (base32 alphabet, no ambiguous chars).
-- ---------------------------------------------------------------------------
create or replace function public.generate_license_key()
returns text
language plpgsql
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- 32 chars, no I/O/0/1
  bytes    bytea := gen_random_bytes(16);
  out      text  := 'AE';
  i        int;
begin
  for i in 0..15 loop
    if i % 4 = 0 then out := out || '-'; end if;
    out := out || substr(alphabet, (get_byte(bytes, i) % 32) + 1, 1);
  end loop;
  return out;
end;
$$;

create table if not exists public.license_keys (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users (id) on delete cascade,
  license_key   text not null unique default public.generate_license_key(),
  hardware_id   text,                      -- bound on first successful /api/verify
  revoked       boolean not null default false,
  created_at    timestamptz not null default now(),
  last_verified_at timestamptz
);

create index if not exists license_keys_user_idx on public.license_keys (user_id);

alter table public.license_keys enable row level security;

create policy "license_keys: read own rows"
  on public.license_keys for select
  using (auth.uid() = user_id);

-- No insert/update/delete policies: only the service role (which bypasses RLS) may write.

-- ---------------------------------------------------------------------------
-- Keep updated_at fresh
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists subscriptions_touch on public.subscriptions;
create trigger subscriptions_touch
  before update on public.subscriptions
  for each row execute function public.touch_updated_at();
