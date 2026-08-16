create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create table private.crm_pin_config (
  singleton boolean primary key default true check (singleton),
  pin_hash text not null check (length(pin_hash) >= 20),
  auth_user_id uuid not null unique references auth.users(id) on delete restrict,
  updated_at timestamptz not null default now()
);

create table private.crm_pin_attempts (
  fingerprint_hash text primary key
    check (fingerprint_hash ~ '^[0-9a-f]{64}$'),
  failed_attempts smallint not null default 0
    check (failed_attempts between 0 and 5),
  window_started_at timestamptz not null default now(),
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

create index crm_pin_attempts_updated_at_idx
  on private.crm_pin_attempts(updated_at);

alter table private.crm_pin_config enable row level security;
alter table private.crm_pin_attempts enable row level security;

revoke all on table private.crm_pin_config
  from public, anon, authenticated, service_role;
revoke all on table private.crm_pin_attempts
  from public, anon, authenticated, service_role;

create or replace function public.verify_crm_pin(
  p_pin text,
  p_fingerprint_hash text
)
returns table (
  auth_user_id uuid,
  retry_after_seconds integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_fingerprint text := lower(btrim(p_fingerprint_hash));
  v_attempt private.crm_pin_attempts%rowtype;
  v_config private.crm_pin_config%rowtype;
  v_retry_after integer := 0;
begin
  if p_pin is null
    or p_pin !~ '^[0-9]{6}$'
    or v_fingerprint !~ '^[0-9a-f]{64}$'
  then
    return query select null::uuid, 0;
    return;
  end if;

  delete from private.crm_pin_attempts
  where updated_at < v_now - interval '7 days';

  insert into private.crm_pin_attempts (fingerprint_hash)
  values (v_fingerprint)
  on conflict (fingerprint_hash) do nothing;

  select attempts.*
  into v_attempt
  from private.crm_pin_attempts as attempts
  where attempts.fingerprint_hash = v_fingerprint
  for update;

  if v_attempt.locked_until is not null and v_attempt.locked_until > v_now then
    v_retry_after := greatest(
      1,
      ceil(extract(epoch from (v_attempt.locked_until - v_now)))::integer
    );
    return query select null::uuid, v_retry_after;
    return;
  end if;

  if v_attempt.window_started_at <= v_now - interval '15 minutes'
    or v_attempt.locked_until is not null
  then
    update private.crm_pin_attempts
    set failed_attempts = 0,
        window_started_at = v_now,
        locked_until = null,
        updated_at = v_now
    where fingerprint_hash = v_fingerprint;

    v_attempt.failed_attempts := 0;
    v_attempt.window_started_at := v_now;
    v_attempt.locked_until := null;
  end if;

  select config.*
  into v_config
  from private.crm_pin_config as config
  where config.singleton = true;

  if found
    and extensions.crypt(p_pin, v_config.pin_hash) = v_config.pin_hash
  then
    delete from private.crm_pin_attempts
    where fingerprint_hash = v_fingerprint;

    return query select v_config.auth_user_id, 0;
    return;
  end if;

  v_attempt.failed_attempts := least(v_attempt.failed_attempts + 1, 5);
  if v_attempt.failed_attempts >= 5 then
    v_attempt.locked_until := v_now + interval '15 minutes';
    v_retry_after := 900;
  end if;

  update private.crm_pin_attempts
  set failed_attempts = v_attempt.failed_attempts,
      locked_until = v_attempt.locked_until,
      updated_at = v_now
  where fingerprint_hash = v_fingerprint;

  return query select null::uuid, v_retry_after;
end;
$$;

revoke all on function public.verify_crm_pin(text, text)
  from public, anon, authenticated;
grant execute on function public.verify_crm_pin(text, text)
  to service_role;

comment on function public.verify_crm_pin(text, text) is
  'Validates the private CRM PIN for the server-side login broker with per-client lockout.';
