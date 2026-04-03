-- =====================================================================
-- WhatsBoard Auth Onboarding Bootstrap
-- Supports:
-- - Automatic business/profile/member provisioning on signup
-- - Backfill for existing auth users missing business linkage
-- - Immediate visibility of business info after signup/login
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Helper to generate a readable fallback business name from email.
-- ---------------------------------------------------------------------
create or replace function public.whatsboard_business_name_from_email(email text)
returns text
language plpgsql
stable
as $$
declare
  local_part text;
  cleaned text;
begin
  local_part := split_part(coalesce(email, ''), '@', 1);
  local_part := btrim(local_part);

  if local_part = '' then
    return 'WhatsBoard Business';
  end if;

  cleaned := regexp_replace(local_part, '[._-]+', ' ', 'g');
  cleaned := btrim(cleaned);

  if cleaned = '' then
    return 'WhatsBoard Business';
  end if;

  return initcap(cleaned) || ' Business';
end;
$$;

-- ---------------------------------------------------------------------
-- Core bootstrap function: ensure businesses, business_members, and
-- profiles are linked to a concrete auth user.
-- ---------------------------------------------------------------------
create or replace function public.whatsboard_bootstrap_business_for_user(
  p_user_id uuid,
  p_email text default null,
  p_business_name text default null,
  p_full_name text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_business_id uuid;
  v_business_name text;
  v_full_name text;
  v_email text;
begin
  v_business_name := nullif(btrim(coalesce(p_business_name, '')), '');
  v_full_name := nullif(btrim(coalesce(p_full_name, '')), '');
  v_email := nullif(lower(btrim(coalesce(p_email, ''))), '');

  if v_business_name is null then
    v_business_name := v_full_name;
  end if;
  if v_business_name is null then
    v_business_name := public.whatsboard_business_name_from_email(v_email);
  end if;

  select bm.business_id
    into v_business_id
  from public.business_members bm
  where bm.user_id = p_user_id
  limit 1;

  if v_business_id is null then
    select b.id
      into v_business_id
    from public.businesses b
    where b.owner_id = p_user_id
    limit 1;
  end if;

  if v_business_id is null then
    insert into public.businesses (
      owner_id,
      name,
      currency
    )
    values (
      p_user_id,
      v_business_name,
      'TZS'
    )
    returning id into v_business_id;
  elsif v_business_name is not null then
    update public.businesses
    set
      name = v_business_name,
      updated_at = now()
    where id = v_business_id
      and owner_id = p_user_id;
  end if;

  insert into public.business_members (
    business_id,
    user_id,
    role,
    invited_by
  )
  values (
    v_business_id,
    p_user_id,
    'owner',
    p_user_id
  )
  on conflict (user_id) do update
    set
      business_id = excluded.business_id,
      role = 'owner',
      invited_by = excluded.invited_by;

  insert into public.profiles (
    id,
    business_id,
    business_name,
    full_name,
    email,
    updated_at
  )
  values (
    p_user_id,
    v_business_id,
    v_business_name,
    v_full_name,
    v_email,
    now()
  )
  on conflict (id) do update
    set
      business_id = excluded.business_id,
      business_name = coalesce(excluded.business_name, public.profiles.business_name),
      full_name = coalesce(excluded.full_name, public.profiles.full_name),
      email = coalesce(excluded.email, public.profiles.email),
      updated_at = now();

  return v_business_id;
end;
$$;

grant execute on function public.whatsboard_bootstrap_business_for_user(uuid, text, text, text)
to authenticated, service_role;

-- ---------------------------------------------------------------------
-- Trigger: auto-bootstrap every new auth user at signup.
-- ---------------------------------------------------------------------
create or replace function public.whatsboard_on_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_business_name text;
  v_full_name text;
begin
  v_business_name := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'business_name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'businessName'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'company_name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'companyName'), '')
  );

  v_full_name := coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'fullName'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'name'), '')
  );

  perform public.whatsboard_bootstrap_business_for_user(
    new.id,
    new.email,
    v_business_name,
    v_full_name
  );

  return new;
end;
$$;

drop trigger if exists trg_whatsboard_auth_user_bootstrap on auth.users;
create trigger trg_whatsboard_auth_user_bootstrap
after insert on auth.users
for each row
execute function public.whatsboard_on_auth_user_created();

-- ---------------------------------------------------------------------
-- Backfill existing users so old accounts also get complete linkage.
-- ---------------------------------------------------------------------
do $$
declare
  rec record;
begin
  for rec in
    select
      u.id,
      u.email,
      coalesce(
        nullif(btrim(u.raw_user_meta_data ->> 'business_name'), ''),
        nullif(btrim(u.raw_user_meta_data ->> 'businessName'), ''),
        nullif(btrim(u.raw_user_meta_data ->> 'company_name'), ''),
        nullif(btrim(u.raw_user_meta_data ->> 'companyName'), '')
      ) as business_name,
      coalesce(
        nullif(btrim(u.raw_user_meta_data ->> 'full_name'), ''),
        nullif(btrim(u.raw_user_meta_data ->> 'fullName'), ''),
        nullif(btrim(u.raw_user_meta_data ->> 'name'), '')
      ) as full_name
    from auth.users u
  loop
    perform public.whatsboard_bootstrap_business_for_user(
      rec.id,
      rec.email,
      rec.business_name,
      rec.full_name
    );
  end loop;
end;
$$;
