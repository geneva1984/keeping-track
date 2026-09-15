-- Adds a shared appointments calendar, colour-coded by who's actioning each
-- appointment. Run this once in Supabase → SQL Editor, after the earlier migrations.

-- ─────────────────────────────────────────────────────────────
-- Give each family member a colour, auto-assigned in join order.
-- ─────────────────────────────────────────────────────────────

alter table family_members add column if not exists color text;

-- Backfill anyone who joined before this migration.
with ranked as (
  select id, row_number() over (partition by family_id order by joined_at) - 1 as rn
  from family_members
  where color is null
)
update family_members fm
set color = (array['#4C6B63', '#B8935A', '#B8543A', '#6B5B95', '#3A7CA5', '#8C6057', '#5C8A3A', '#A5527A'])[(r.rn % 8) + 1]
from ranked r
where fm.id = r.id;

alter table family_members alter column color set default '#4C6B63';
alter table family_members alter column color set not null;

create or replace function family_members_set_color()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_palette text[] := array['#4C6B63', '#B8935A', '#B8543A', '#6B5B95', '#3A7CA5', '#8C6057', '#5C8A3A', '#A5527A'];
begin
  select count(*) into v_count from family_members where family_id = new.family_id;
  new.color := v_palette[(v_count % array_length(v_palette, 1)) + 1];
  return new;
end;
$$;

drop trigger if exists trg_family_members_set_color on family_members;
create trigger trg_family_members_set_color
  before insert on family_members
  for each row execute function family_members_set_color();

-- ─────────────────────────────────────────────────────────────
-- Appointments
-- ─────────────────────────────────────────────────────────────

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  title text not null,
  location text,
  notes text,
  start_at timestamptz not null,
  end_at timestamptz,
  assigned_to uuid references auth.users(id),
  created_by uuid not null references auth.users(id),
  created_by_name text not null,
  updated_by uuid references auth.users(id),
  updated_by_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists appointments_family_id_idx on appointments (family_id, start_at);

alter table appointments enable row level security;

drop policy if exists "members can view appointments" on appointments;
create policy "members can view appointments"
  on appointments for select
  using (is_family_member(family_id));

drop policy if exists "members can insert appointments" on appointments;
create policy "members can insert appointments"
  on appointments for insert
  with check (is_family_member(family_id));

drop policy if exists "members can update appointments" on appointments;
create policy "members can update appointments"
  on appointments for update
  using (is_family_member(family_id))
  with check (is_family_member(family_id));

drop policy if exists "members can delete appointments" on appointments;
create policy "members can delete appointments"
  on appointments for delete
  using (is_family_member(family_id));

-- Same identity-enforcement pattern as entries.
create or replace function appointments_set_author()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.created_by := auth.uid();
  select display_name into new.created_by_name
  from family_members
  where family_id = new.family_id and user_id = auth.uid();
  new.updated_by := null;
  new.updated_by_name := null;
  new.created_at := now();
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_appointments_set_author on appointments;
create trigger trg_appointments_set_author
  before insert on appointments
  for each row execute function appointments_set_author();

create or replace function appointments_set_editor()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.created_by := old.created_by;
  new.created_by_name := old.created_by_name;
  new.created_at := old.created_at;
  new.updated_by := auth.uid();
  select display_name into new.updated_by_name
  from family_members
  where family_id = new.family_id and user_id = auth.uid();
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_appointments_set_editor on appointments;
create trigger trg_appointments_set_editor
  before update on appointments
  for each row execute function appointments_set_editor();

do $$ begin
  alter publication supabase_realtime add table appointments;
exception
  when duplicate_object then null;
end $$;
