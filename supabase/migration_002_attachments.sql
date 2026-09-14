-- Adds photo/document attachments to entries.
-- Run this once in Supabase → SQL Editor, after schema.sql.

-- Private storage bucket for attachment files. Not public — access is only
-- ever granted through the storage policies below, which mirror the same
-- family-membership check used everywhere else in the app.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'attachments',
  'attachments',
  false,
  10485760, -- 10MB per file
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Files are stored at "<family_id>/<entry_id>/<random>-<filename>" — the
-- policies below check membership of the family_id encoded in that path.
drop policy if exists "members can view attachment files" on storage.objects;
create policy "members can view attachment files"
  on storage.objects for select
  using (bucket_id = 'attachments' and is_family_member((storage.foldername(name))[1]::uuid));

drop policy if exists "members can upload attachment files" on storage.objects;
create policy "members can upload attachment files"
  on storage.objects for insert
  with check (bucket_id = 'attachments' and is_family_member((storage.foldername(name))[1]::uuid));

drop policy if exists "members can delete attachment files" on storage.objects;
create policy "members can delete attachment files"
  on storage.objects for delete
  using (bucket_id = 'attachments' and is_family_member((storage.foldername(name))[1]::uuid));

-- Metadata table — one row per uploaded file, linked to an entry.
create table if not exists attachments (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references entries(id) on delete cascade,
  family_id uuid not null references families(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  content_type text,
  uploaded_by uuid not null references auth.users(id),
  uploaded_by_name text not null,
  created_at timestamptz not null default now()
);

create index if not exists attachments_entry_id_idx on attachments (entry_id);

alter table attachments enable row level security;

drop policy if exists "members can view attachments" on attachments;
create policy "members can view attachments"
  on attachments for select
  using (is_family_member(family_id));

drop policy if exists "members can insert attachments" on attachments;
create policy "members can insert attachments"
  on attachments for insert
  with check (is_family_member(family_id));

drop policy if exists "members can delete attachments" on attachments;
create policy "members can delete attachments"
  on attachments for delete
  using (is_family_member(family_id));

-- Same identity enforcement pattern as entries: who uploaded it is set from
-- the live session server-side, never trusted from the client.
create or replace function attachments_set_uploader()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.uploaded_by := auth.uid();
  select display_name into new.uploaded_by_name
  from family_members
  where family_id = new.family_id and user_id = auth.uid();
  new.created_at := now();
  return new;
end;
$$;

drop trigger if exists trg_attachments_set_uploader on attachments;
create trigger trg_attachments_set_uploader
  before insert on attachments
  for each row execute function attachments_set_uploader();
