-- Angetic Essence: license activations + webhook idempotency

-- One active (non-revoked) license key per user. The Stripe webhook relies on this
-- (insert ... on conflict do nothing) so redelivered events can never mint a second key.
create unique index if not exists license_keys_one_active_per_user
  on public.license_keys (user_id) where (revoked = false);

-- Devices (desktop + mobile clients) bound to a license. /api/verify enforces a device cap.
create table if not exists public.license_activations (
  id              uuid primary key default gen_random_uuid(),
  license_key_id  uuid not null references public.license_keys (id) on delete cascade,
  hardware_id     text not null check (char_length(hardware_id) between 8 and 256),
  first_seen_at   timestamptz not null default now(),
  last_seen_at    timestamptz not null default now(),
  unique (license_key_id, hardware_id)
);

alter table public.license_activations enable row level security;

create policy "license_activations: read own rows"
  on public.license_activations for select
  using (exists (
    select 1 from public.license_keys k
    where k.id = license_key_id and k.user_id = auth.uid()
  ));
-- Writes: service role only.

-- Processed Stripe events (idempotency log).
create table if not exists public.stripe_events (
  id          text primary key,           -- evt_...
  type        text not null,
  received_at timestamptz not null default now()
);
alter table public.stripe_events enable row level security;  -- no policies: service role only

-- hardware_id on license_keys was a single-device design; activations supersede it.
alter table public.license_keys drop column if exists hardware_id;

-- Atomic activation: registers a device if under the cap, returns whether the device is allowed.
create or replace function public.activate_license_device(
  p_license_key_id uuid, p_hardware_id text, p_max_devices int default 3
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  existing boolean;
  cnt int;
begin
  -- serialize concurrent activations for the same key
  perform pg_advisory_xact_lock(hashtextextended(p_license_key_id::text, 0));

  select true into existing from license_activations
   where license_key_id = p_license_key_id and hardware_id = p_hardware_id;

  if existing then
    update license_activations set last_seen_at = now()
     where license_key_id = p_license_key_id and hardware_id = p_hardware_id;
    return true;
  end if;

  select count(*) into cnt from license_activations where license_key_id = p_license_key_id;
  if cnt >= p_max_devices then
    return false;
  end if;

  insert into license_activations (license_key_id, hardware_id) values (p_license_key_id, p_hardware_id);
  return true;
end;
$$;

revoke all on function public.activate_license_device(uuid, text, int) from public, anon, authenticated;
grant execute on function public.activate_license_device(uuid, text, int) to service_role;
