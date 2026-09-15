-- Adds a shared To Do list — items family members create themselves,
-- colour-coded by assignee the same way the calendar is. Run this once in
-- Supabase → SQL Editor, after the earlier migrations.

create table if not exists todos (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  title text not null,
  notes text,
  due_date date,
  assigned_to uuid references auth.users(id),
  done boolean not null default false,
  created_by uuid not null references auth.users(id),
  created_by_name text not null,
  updated_by uuid references auth.users(id),
  updated_by_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists todos_family_id_idx on todos (family_id, done, due_date);

alter table todos enable row level security;

drop policy if exists "members can view todos" on todos;
create policy "members can view todos"
  on todos for select
  using (is_family_member(family_id));

drop policy if exists "members can insert todos" on todos;
create policy "members can insert todos"
  on todos for insert
  with check (is_family_member(family_id));

drop policy if exists "members can update todos" on todos;
create policy "members can update todos"
  on todos for update
  using (is_family_member(family_id))
  with check (is_family_member(family_id));

drop policy if exists "members can delete todos" on todos;
create policy "members can delete todos"
  on todos for delete
  using (is_family_member(family_id));

-- Same identity-enforcement pattern as entries and appointments.
create or replace function todos_set_author()
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

drop trigger if exists trg_todos_set_author on todos;
create trigger trg_todos_set_author
  before insert on todos
  for each row execute function todos_set_author();

create or replace function todos_set_editor()
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

drop trigger if exists trg_todos_set_editor on todos;
create trigger trg_todos_set_editor
  before update on todos
  for each row execute function todos_set_editor();

do $$ begin
  alter publication supabase_realtime add table todos;
exception
  when duplicate_object then null;
end $$;
