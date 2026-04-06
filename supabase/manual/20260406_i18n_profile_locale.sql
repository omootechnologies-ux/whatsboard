-- WhatsBoard i18n profile preference support
-- Safe to run on existing production databases.

begin;

alter table if exists public.profiles
  add column if not exists preferred_locale text;

alter table if exists public.profiles
  add column if not exists locale text;

alter table if exists public.profiles
  add column if not exists language text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'preferred_locale'
  ) then
    alter table public.profiles
      drop constraint if exists profiles_preferred_locale_check;

    alter table public.profiles
      add constraint profiles_preferred_locale_check
      check (preferred_locale is null or preferred_locale in ('en', 'sw'));
  end if;
end
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'locale'
  ) then
    alter table public.profiles
      drop constraint if exists profiles_locale_check;

    alter table public.profiles
      add constraint profiles_locale_check
      check (locale is null or locale in ('en', 'sw'));
  end if;
end
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'language'
  ) then
    alter table public.profiles
      drop constraint if exists profiles_language_check;

    alter table public.profiles
      add constraint profiles_language_check
      check (language is null or language in ('en', 'sw'));
  end if;
end
$$;

create index if not exists profiles_preferred_locale_idx
  on public.profiles (preferred_locale);

commit;
