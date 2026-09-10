-- Keeping Track — database schema
-- Run this once in your Supabase project's SQL editor (Dashboard → SQL Editor → New query).

create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────────────────────────

create table if not exists families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_name text,
  join_code text not null unique,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  joined_at timestamptz not null default now(),
  unique (family_id, user_id)
);

do $$ begin
  create type entry_category as enum (
    'Registration',
    'Assessment',
    'Support at Home',
    'CHSP',
    'Providers',
    'Personal Care Notes',
    'Other Admin'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  entry_date date not null,
  category entry_category not null,
  contact text not null,
  notes text not null,
  reference_number text,
  follow_up text,
  follow_up_resolved boolean not null default false,
  logged_by uuid not null references auth.users(id),
  logged_by_name text not null,
  updated_by uuid references auth.users(id),
  updated_by_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists entries_family_id_idx on entries (family_id, entry_date desc, created_at desc);
create index if not exists family_members_user_id_idx on family_members (user_id);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────

alter table families enable row level security;
alter table family_members enable row level security;
alter table entries enable row level security;

create or replace function is_family_member(fid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from family_members
    where family_id = fid and user_id = auth.uid()
  );
$$;

drop policy if exists "members can view their family" on families;
create policy "members can view their family"
  on families for select
  using (is_family_member(id));

drop policy if exists "members can view fellow members" on family_members;
create policy "members can view fellow members"
  on family_members for select
  using (is_family_member(family_id));

drop policy if exists "members can view entries" on entries;
create policy "members can view entries"
  on entries for select
  using (is_family_member(family_id));

drop policy if exists "members can insert entries" on entries;
create policy "members can insert entries"
  on entries for insert
  with check (is_family_member(family_id));

drop policy if exists "members can update entries" on entries;
create policy "members can update entries"
  on entries for update
  using (is_family_member(family_id))
  with check (is_family_member(family_id));

drop policy if exists "members can delete entries" on entries;
create policy "members can delete entries"
  on entries for delete
  using (is_family_member(family_id));

-- No direct insert/update/delete policies on families or family_members for regular
-- users — those tables are only ever written to via the security-definer functions
-- below, which run with elevated privilege but validate auth.uid() themselves.

-- ─────────────────────────────────────────────────────────────
-- Server-side identity enforcement for entries
-- Prevents a client from claiming to be a different family member than they are.
-- ─────────────────────────────────────────────────────────────

create or replace function entries_set_author()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.logged_by := auth.uid();
  select display_name into new.logged_by_name
  from family_members
  where family_id = new.family_id and user_id = auth.uid();
  new.updated_by := null;
  new.updated_by_name := null;
  new.created_at := now();
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_entries_set_author on entries;
create trigger trg_entries_set_author
  before insert on entries
  for each row execute function entries_set_author();

create or replace function entries_set_editor()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.logged_by := old.logged_by;
  new.logged_by_name := old.logged_by_name;
  new.created_at := old.created_at;
  new.updated_by := auth.uid();
  select display_name into new.updated_by_name
  from family_members
  where family_id = new.family_id and user_id = auth.uid();
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_entries_set_editor on entries;
create trigger trg_entries_set_editor
  before update on entries
  for each row execute function entries_set_editor();

-- ─────────────────────────────────────────────────────────────
-- Family creation / joining (security-definer RPCs)
-- Join codes are never guessable "URLs" — they're validated server-side and
-- only ever grant membership to an authenticated user, one family at a time.
-- ─────────────────────────────────────────────────────────────

create or replace function generate_join_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no 0/O/1/I ambiguity
  code text;
  code_exists boolean;
begin
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(chars, floor(random() * length(chars))::int + 1, 1);
    end loop;
    code := substr(code, 1, 3) || '-' || substr(code, 4, 3);
    select exists(select 1 from families where join_code = code) into code_exists;
    exit when not code_exists;
  end loop;
  return code;
end;
$$;

create or replace function create_family(p_name text, p_parent_name text, p_display_name text)
returns table(id uuid, join_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_code text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_display_name), '') = '' then
    raise exception 'Name is required';
  end if;

  v_code := generate_join_code();

  insert into families (name, parent_name, join_code, created_by)
  values (trim(p_name), nullif(trim(p_parent_name), ''), v_code, auth.uid())
  returning families.id into v_id;

  insert into family_members (family_id, user_id, display_name)
  values (v_id, auth.uid(), trim(p_display_name));

  return query select v_id, v_code;
end;
$$;

create or replace function join_family(p_join_code text, p_display_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_family_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if coalesce(trim(p_display_name), '') = '' then
    raise exception 'Name is required';
  end if;

  select id into v_family_id from families where join_code = upper(trim(p_join_code));
  if v_family_id is null then
    raise exception 'Invalid share code';
  end if;

  insert into family_members (family_id, user_id, display_name)
  values (v_family_id, auth.uid(), trim(p_display_name))
  on conflict (family_id, user_id) do update set display_name = excluded.display_name;

  return v_family_id;
end;
$$;

revoke all on function create_family(text, text, text) from public;
revoke all on function join_family(text, text) from public;
grant execute on function create_family(text, text, text) to authenticated;
grant execute on function join_family(text, text) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- Realtime (optional but used by the app for live timeline updates)
-- ─────────────────────────────────────────────────────────────

do $$ begin
  alter publication supabase_realtime add table entries;
exception
  when duplicate_object then null;
end $$;
