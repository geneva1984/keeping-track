-- One-off script to populate "Bruce's care" with sample entries so you can see
-- what a full timeline looks like. Paste this into Supabase → SQL Editor → New
-- query, and run it once. Safe to delete/ignore afterwards — it's not part of
-- the app itself.

-- The insert trigger normally forces logged_by/logged_by_name from your live
-- session (auth.uid()), which doesn't exist inside the SQL editor — so we
-- disable it just for this script, and supply those fields ourselves instead.
alter table entries disable trigger trg_entries_set_author;

insert into entries (family_id, entry_date, category, contact, notes, reference_number, follow_up, follow_up_resolved, logged_by, logged_by_name)
select fm.family_id, v.entry_date, v.category, v.contact, v.notes, v.reference_number, v.follow_up, v.follow_up_resolved, fm.user_id, fm.display_name
from family_members fm
join auth.users u on u.id = fm.user_id
cross join (values
  ('2026-08-05'::date, 'Registration'::entry_category, 'My Aged Care', 'Completed initial registration over the phone. Confirmed eligibility for a Home Support assessment.', 'MAC-88213', null, false),
  ('2026-08-12'::date, 'Assessment'::entry_category, 'My Aged Care', 'Assessor called to schedule the home visit. Booked for 2 September, morning slot.', 'MAC-88213', null, false),
  ('2026-08-22'::date, 'Support at Home'::entry_category, 'Jane at HomeCare Plus', 'Discussed cleaning and meal prep options once the package is approved. Jane will send a quote.', null, 'Chase quote if not received by 29 Aug', false),
  ('2026-09-02'::date, 'Assessment'::entry_category, 'Home Support Assessor (Priya)', 'Home visit went well. Priya recommended Level 2 Home Care Package. Formal letter to follow in 2-3 weeks.', 'HSA-4471', 'Call if no letter received by 23 Sept', false),
  ('2026-09-05'::date, 'CHSP', 'CHSP Intake Line', 'Applied for interim CHSP support (transport and social support) while waiting on the full package.', 'CHSP-2290', null, true),
  ('2026-09-08'::date, 'Providers', 'Riverside Physio', 'Booked a home physio assessment for balance and fall risk. First visit 15 Sept, $0 out of pocket under the package.', null, null, false),
  ('2026-09-10'::date, 'Personal Care Notes', '(family note)', 'Mum mentioned she''s been dizzy in the mornings again — worth flagging to the GP and to the physio at the visit.', null, 'Mention to GP at next appointment', false),
  ('2026-08-28'::date, 'Other Admin', 'My Aged Care', 'Updated bank details and emergency contact on file after Dad''s number changed.', 'MAC-88213', null, false)
) as v(entry_date, category, contact, notes, reference_number, follow_up, follow_up_resolved)
where u.email = 'gascarf@gmail.com'
limit 8;

alter table entries enable trigger trg_entries_set_author;
