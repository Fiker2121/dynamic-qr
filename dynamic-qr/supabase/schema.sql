-- =============================================================================
-- Dynamic QR Code Generator with Analytics - database schema
-- Run this whole file in the Supabase SQL Editor. It is safe to re-run.
-- =============================================================================

create extension if not exists pgcrypto with schema extensions;

-- -----------------------------------------------------------------------------
-- Shared trigger: keep updated_at current
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- qr_codes: one row per dynamic QR code. The printed image only encodes `code`,
-- so destination_url can change without reprinting.
-- -----------------------------------------------------------------------------
create table if not exists public.qr_codes (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users (id) on delete cascade,
  code                text not null unique,
  name                text not null default 'Untitled QR',
  destination_url     text not null,
  foreground_color    text not null default '#111827',
  background_color    text not null default '#ffffff',
  dot_type            text not null default 'rounded',
  corner_square_type  text not null default 'extra-rounded',
  corner_dot_type     text not null default 'dot',
  logo_data           text,
  size                integer not null default 300,
  margin              integer not null default 12,
  error_correction    text not null default 'Q',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  constraint qr_codes_code_format check (code ~ '^[A-Za-z0-9]{6,12}$'),
  constraint qr_codes_name_length check (char_length(btrim(name)) between 1 and 80),
  constraint qr_codes_destination_http check (
    destination_url ~* '^https?://' and char_length(destination_url) <= 2048
  ),
  constraint qr_codes_foreground_hex check (foreground_color ~ '^#[0-9a-fA-F]{6}$'),
  constraint qr_codes_background_hex check (background_color ~ '^#[0-9a-fA-F]{6}$'),
  constraint qr_codes_dot_type check (
    dot_type in ('square', 'dots', 'rounded', 'classy', 'classy-rounded')
  ),
  constraint qr_codes_corner_square_type check (
    corner_square_type in ('square', 'dot', 'extra-rounded')
  ),
  constraint qr_codes_corner_dot_type check (corner_dot_type in ('square', 'dot')),
  constraint qr_codes_logo_data check (
    logo_data is null
    or (
      char_length(logo_data) <= 300000
      and logo_data ~ '^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$'
    )
  ),
  constraint qr_codes_size_range check (size between 128 and 1024),
  constraint qr_codes_margin_range check (margin between 0 and 64),
  constraint qr_codes_error_correction check (error_correction in ('L', 'M', 'Q', 'H'))
);

comment on table public.qr_codes is 'Dynamic QR code definitions. The image is regenerated from this configuration.';
comment on column public.qr_codes.code is 'Public short code used in /r/[code]. UNIQUE (the constraint also creates its lookup index).';
comment on column public.qr_codes.logo_data is 'Optional small PNG/JPEG/WebP data URL embedded in the QR image.';

drop trigger if exists qr_codes_set_updated_at on public.qr_codes;
create trigger qr_codes_set_updated_at
  before update on public.qr_codes
  for each row execute function public.set_updated_at();

create index if not exists qr_codes_user_id_idx on public.qr_codes (user_id);
create index if not exists qr_codes_created_at_idx on public.qr_codes (created_at desc);
create index if not exists qr_codes_user_created_idx on public.qr_codes (user_id, created_at desc);

-- -----------------------------------------------------------------------------
-- scans: one row per QR scan. No IP address or precise location is stored.
-- -----------------------------------------------------------------------------
create table if not exists public.scans (
  id                uuid primary key default gen_random_uuid(),
  qr_code_id        uuid not null references public.qr_codes (id) on delete cascade,
  scanned_at        timestamptz not null default now(),
  country           text not null default 'Unknown',
  device_type       text not null default 'unknown',
  browser           text,
  operating_system  text,
  referrer          text,

  constraint scans_device_type check (device_type in ('mobile', 'tablet', 'desktop', 'unknown')),
  constraint scans_country_length check (char_length(country) <= 64),
  constraint scans_referrer_length check (referrer is null or char_length(referrer) <= 255)
);

comment on table public.scans is 'Anonymous scan events written by the server-side redirect route.';

create index if not exists scans_qr_code_scanned_idx on public.scans (qr_code_id, scanned_at desc);
create index if not exists scans_qr_code_id_idx on public.scans (qr_code_id);
create index if not exists scans_scanned_at_idx on public.scans (scanned_at);
create index if not exists scans_country_idx on public.scans (country);
create index if not exists scans_device_type_idx on public.scans (device_type);

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.qr_codes enable row level security;
alter table public.scans enable row level security;

drop policy if exists "qr_codes_select_own" on public.qr_codes;
create policy "qr_codes_select_own" on public.qr_codes
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "qr_codes_insert_own" on public.qr_codes;
create policy "qr_codes_insert_own" on public.qr_codes
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "qr_codes_update_own" on public.qr_codes;
create policy "qr_codes_update_own" on public.qr_codes
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "qr_codes_delete_own" on public.qr_codes;
create policy "qr_codes_delete_own" on public.qr_codes
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Owners can read scans of their own QR codes. There is deliberately no INSERT/UPDATE/DELETE
-- policy: scans are written only by the redirect route with the service-role key.
drop policy if exists "scans_select_own" on public.scans;
create policy "scans_select_own" on public.scans
  for select to authenticated
  using (
    exists (
      select 1
      from public.qr_codes q
      where q.id = scans.qr_code_id
        and q.user_id = (select auth.uid())
    )
  );

-- Defense in depth on top of RLS: anonymous visitors never touch these tables directly.
revoke all on public.qr_codes from anon;
revoke all on public.scans from anon;
revoke insert, update, delete on public.scans from authenticated;

-- -----------------------------------------------------------------------------
-- Analytics aggregation functions (SECURITY INVOKER, so RLS limits every result to
-- the calling user's own QR codes). All day buckets use UTC.
-- -----------------------------------------------------------------------------
create or replace function public.analytics_scans_over_time(
  p_from timestamptz default null,
  p_qr_code_id uuid default null
)
returns table (day date, scans bigint)
language sql stable security invoker
set search_path = public
as $$
  select (s.scanned_at at time zone 'UTC')::date as day, count(*)::bigint as scans
  from public.scans s
  where (p_from is null or s.scanned_at >= p_from)
    and (p_qr_code_id is null or s.qr_code_id = p_qr_code_id)
  group by 1
  order by 1
$$;

create or replace function public.analytics_top_countries(
  p_from timestamptz default null,
  p_qr_code_id uuid default null,
  p_limit integer default 8
)
returns table (country text, scans bigint)
language sql stable security invoker
set search_path = public
as $$
  select s.country, count(*)::bigint as scans
  from public.scans s
  where (p_from is null or s.scanned_at >= p_from)
    and (p_qr_code_id is null or s.qr_code_id = p_qr_code_id)
  group by s.country
  order by scans desc, s.country asc
  limit greatest(p_limit, 1)
$$;

create or replace function public.analytics_device_distribution(
  p_from timestamptz default null,
  p_qr_code_id uuid default null
)
returns table (device_type text, scans bigint)
language sql stable security invoker
set search_path = public
as $$
  select s.device_type, count(*)::bigint as scans
  from public.scans s
  where (p_from is null or s.scanned_at >= p_from)
    and (p_qr_code_id is null or s.qr_code_id = p_qr_code_id)
  group by s.device_type
  order by scans desc
$$;

create or replace function public.analytics_active_qr_count(p_from timestamptz default null)
returns bigint
language sql stable security invoker
set search_path = public
as $$
  select count(distinct s.qr_code_id)::bigint
  from public.scans s
  where p_from is null or s.scanned_at >= p_from
$$;

create or replace function public.analytics_qr_scan_counts()
returns table (qr_code_id uuid, scans bigint)
language sql stable security invoker
set search_path = public
as $$
  select s.qr_code_id, count(*)::bigint as scans
  from public.scans s
  group by s.qr_code_id
$$;

revoke execute on function public.analytics_scans_over_time(timestamptz, uuid) from public, anon;
revoke execute on function public.analytics_top_countries(timestamptz, uuid, integer) from public, anon;
revoke execute on function public.analytics_device_distribution(timestamptz, uuid) from public, anon;
revoke execute on function public.analytics_active_qr_count(timestamptz) from public, anon;
revoke execute on function public.analytics_qr_scan_counts() from public, anon;

grant execute on function public.analytics_scans_over_time(timestamptz, uuid) to authenticated;
grant execute on function public.analytics_top_countries(timestamptz, uuid, integer) to authenticated;
grant execute on function public.analytics_device_distribution(timestamptz, uuid) to authenticated;
grant execute on function public.analytics_active_qr_count(timestamptz) to authenticated;
grant execute on function public.analytics_qr_scan_counts() to authenticated;
