-- One-off script to populate the Care Handbook with realistic sample data so
-- you can preview what the PDF export looks like. Paste into Supabase →
-- SQL Editor → New query, and run it once. Safe to overwrite afterwards —
-- just edit the fields from inside the app, or re-run this script.

with target_family as (
  select fm.family_id, f.parent_name
  from family_members fm
  join auth.users u on u.id = fm.user_id
  join families f on f.id = fm.family_id
  where u.email = 'gascarf@gmail.com'
  limit 1
)
insert into care_handbooks (
  family_id, about, clinical, medications, emergency, communication,
  personal_care, mobility, wellbeing, support_network, family_friends,
  support_team, additional_notes
)
select
  tf.family_id,
  jsonb_build_object(
    'first_name', coalesce(tf.parent_name, 'Margaret'),
    'last_name', 'Sample',
    'known_as', 'Peg',
    'name_pronounced', '',
    'date_of_birth', '1944-03-12',
    'gender_identity', 'Woman',
    'preferred_language', 'English',
    'religious_cultural', 'Catholic — likes a priest to visit around Easter and Christmas',
    'important_info', 'Gets anxious in unfamiliar places. Always introduce yourself by name before helping her with anything.'
  ),
  jsonb_build_object(
    'blood_type', 'O+',
    'allergies', 'Penicillin (rash), sulfa drugs',
    'health_history', 'Type 2 diabetes (2016), mild osteoarthritis in both knees, cataract surgery (2021, both eyes)',
    'other_info', 'Sees Dr Patel every 3 months for diabetes review'
  ),
  jsonb_build_object(
    'items', jsonb_build_array(
      jsonb_build_object('name', 'Metformin', 'dosage', '500mg', 'frequency', 'Twice daily', 'time_of_day', 'Morning and evening with food', 'instructions', 'Take with breakfast and dinner'),
      jsonb_build_object('name', 'Atorvastatin', 'dosage', '20mg', 'frequency', 'Once daily', 'time_of_day', 'Night', 'instructions', ''),
      jsonb_build_object('name', 'Panadol Osteo', 'dosage', '665mg', 'frequency', 'As needed, max 6/day', 'time_of_day', 'With meals', 'instructions', 'For knee pain')
    ),
    'pharmacy', 'Chemist Warehouse, 12 High St',
    'last_updated', to_char(current_date, 'YYYY-MM-DD')
  ),
  jsonb_build_object(
    'next_of_kin', jsonb_build_object('name', 'Sam Sample', 'phone', '0412 345 678', 'relationship', 'Daughter'),
    'alternative_contact', jsonb_build_object('name', 'Jordan Sample', 'phone', '0498 765 432', 'relationship', 'Son'),
    'instructions', jsonb_build_array(
      'Call Sam first — she holds medical power of attorney',
      'Mention the penicillin allergy immediately to any new provider',
      'Her diabetes kit (insulin pen and glucose tablets) is in the kitchen, top drawer'
    )
  ),
  jsonb_build_object(
    'other_languages', '',
    'interpreter_needed', 'No',
    'how_i_communicate', 'Speaks clearly but is hard of hearing in her left ear — approach from the right',
    'preferences', 'Speak slowly and face her when talking. She lip-reads a little.',
    'difficulties', 'Sometimes forgets recent conversations — repeating things patiently helps'
  ),
  jsonb_build_object(
    'can_manage', 'Feeding herself, brushing teeth, getting dressed with clothes laid out',
    'need_help_with', 'Showering (fall risk), washing hair, putting on compression stockings',
    'products', 'Sensitive-skin soap only (Sorbolene), no strong perfumes',
    'continence_care', 'Wears daytime pads, changes independently if reminded'
  ),
  jsonb_build_object(
    'aids', jsonb_build_array('Walker'),
    'aids_other', '',
    'higher_risk_when', 'Getting up from bed at night, or on wet bathroom floors',
    'if_fall', 'Do not try to lift her — call 000 if she cannot get up herself, then call Sam',
    'assist_by', 'Offering an arm on stairs, and slowing down — she sets the pace',
    'remind_to', 'Use the walker even for short trips to the bathroom'
  ),
  jsonb_build_object(
    'interests', 'Gardening (tomatoes especially), jigsaw puzzles, ABC radio in the mornings',
    'spend_day', 'Up around 7am, tends the garden while it''s cool, afternoon nap, loves visitors after 3pm',
    'eat_drink', 'Low-sugar diet for diabetes. Loves a weak black tea. No fizzy drinks.',
    'upset_if', 'Rushed, or spoken about rather than to in front of others',
    'other_info', 'Keep the radio on ABC — she finds silence unsettling'
  ),
  jsonb_build_object(
    'inner', 'Sam (daughter, primary carer), Jordan (son, weekends)',
    'middle', 'Next-door neighbour Pat checks in most days; parish visitor on Thursdays',
    'outer', 'HomeCare Plus (cleaning, fortnightly), Riverside Physio (home visits), My Aged Care case manager',
    'notes', 'Sam and Jordan alternate weekends — check the shared calendar before assuming who''s visiting',
    'last_updated', to_char(current_date, 'YYYY-MM-DD')
  ),
  jsonb_build_object(
    'consult', jsonb_build_array(
      jsonb_build_object('name', 'Sam Sample', 'when_to_consult', 'Any medical or financial decision'),
      jsonb_build_object('name', 'Jordan Sample', 'when_to_consult', 'If Sam is unreachable')
    ),
    'important_people', jsonb_build_array(
      jsonb_build_object('name', 'Sam (daughter)', 'photo_path', null),
      jsonb_build_object('name', 'Jordan (son)', 'photo_path', null),
      jsonb_build_object('name', 'Pat (neighbour)', 'photo_path', null)
    )
  ),
  jsonb_build_object(
    'gp', jsonb_build_object('name', 'Dr Anjali Patel', 'phone', '(03) 9555 1234', 'address', 'Riverside Medical Centre, 5 Church St', 'email', 'reception@riversidemedical.example'),
    'practitioners', jsonb_build_array(
      jsonb_build_object('name', 'Tom Reyes', 'phone', '0400 111 222', 'specialty', 'Physiotherapist'),
      jsonb_build_object('name', 'Dr Lin Chen', 'phone', '(03) 9555 5678', 'specialty', 'Endocrinologist')
    )
  ),
  'Prefers her curtains open during the day. The back door sticks — lift the handle slightly when locking it.'
from target_family tf
on conflict (family_id) do update set
  about = excluded.about,
  clinical = excluded.clinical,
  medications = excluded.medications,
  emergency = excluded.emergency,
  communication = excluded.communication,
  personal_care = excluded.personal_care,
  mobility = excluded.mobility,
  wellbeing = excluded.wellbeing,
  support_network = excluded.support_network,
  family_friends = excluded.family_friends,
  support_team = excluded.support_team,
  additional_notes = excluded.additional_notes;
