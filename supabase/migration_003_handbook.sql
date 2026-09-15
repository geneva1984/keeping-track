-- Adds the shared Care Handbook — one living document per family, editable by
-- any member, mirroring "My Care Handbook" (Third Act Exchange paper template).
-- Run this once in Supabase → SQL Editor, after schema.sql and migration_002_attachments.sql.

create table if not exists care_handbooks (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null unique references families(id) on delete cascade,
  about jsonb not null default '{}'::jsonb,
  clinical jsonb not null default '{}'::jsonb,
  medications jsonb not null default '{}'::jsonb,
  emergency jsonb not null default '{}'::jsonb,
  communication jsonb not null default '{}'::jsonb,
  personal_care jsonb not null default '{}'::jsonb,
  mobility jsonb not null default '{}'::jsonb,
  wellbeing jsonb not null default '{}'::jsonb,
  support_network jsonb not null default '{}'::jsonb,
  family_friends jsonb not null default '{}'::jsonb,
  support_team jsonb not null default '{}'::jsonb,
  additional_notes text not null default '',
  updated_by uuid references auth.users(id),
  updated_by_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table care_handbooks enable row level security;

drop policy if exists "members can view handbook" on care_handbooks;
create policy "members can view handbook"
  on care_handbooks for select
  using (is_family_member(family_id));

drop policy if exists "members can insert handbook" on care_handbooks;
create policy "members can insert handbook"
  on care_handbooks for insert
  with check (is_family_member(family_id));

drop policy if exists "members can update handbook" on care_handbooks;
create policy "members can update handbook"
  on care_handbooks for update
  using (is_family_member(family_id))
  with check (is_family_member(family_id));

-- Same identity-enforcement pattern as entries — who last edited the handbook
-- is set from the live session server-side, never trusted from the client.
create or replace function care_handbooks_set_editor()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_by := auth.uid();
  select display_name into new.updated_by_name
  from family_members
  where family_id = new.family_id and user_id = auth.uid();
  new.updated_at := now();
  if tg_op = 'INSERT' then
    new.created_at := now();
  else
    new.created_at := old.created_at;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_care_handbooks_set_editor on care_handbooks;
create trigger trg_care_handbooks_set_editor
  before insert or update on care_handbooks
  for each row execute function care_handbooks_set_editor();

do $$ begin
  alter publication supabase_realtime add table care_handbooks;
exception
  when duplicate_object then null;
end $$;

-- ─────────────────────────────────────────────────────────────
-- Private storage bucket for the handbook's "People important to me" photos.
-- Same per-family isolation pattern as the attachments bucket.
-- ─────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'handbook-photos',
  'handbook-photos',
  false,
  5242880, -- 5MB per file
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Files are stored at "<family_id>/<random>-<filename>".
drop policy if exists "members can view handbook photos" on storage.objects;
create policy "members can view handbook photos"
  on storage.objects for select
  using (bucket_id = 'handbook-photos' and is_family_member((storage.foldername(name))[1]::uuid));

drop policy if exists "members can upload handbook photos" on storage.objects;
create policy "members can upload handbook photos"
  on storage.objects for insert
  with check (bucket_id = 'handbook-photos' and is_family_member((storage.foldername(name))[1]::uuid));

drop policy if exists "members can delete handbook photos" on storage.objects;
create policy "members can delete handbook photos"
  on storage.objects for delete
  using (bucket_id = 'handbook-photos' and is_family_member((storage.foldername(name))[1]::uuid));
