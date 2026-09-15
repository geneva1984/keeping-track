-- Lets a Logbook entry (and therefore its follow-up) be assigned to a family
-- member, colour-coded the same way as the Calendar and To Do list.
-- Run this once in Supabase → SQL Editor, after the earlier migrations.

alter table entries add column if not exists assigned_to uuid references auth.users(id);
