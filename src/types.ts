export const CATEGORIES = [
  'Registration',
  'Assessment',
  'Support at Home',
  'CHSP',
  'Providers',
  'Personal Care Notes',
  'Other Admin',
] as const

export type Category = (typeof CATEGORIES)[number]

export interface FamilyMembership {
  familyId: string
  familyName: string
  parentName: string | null
  joinCode: string
  displayName: string
}

export interface FamilyMemberInfo {
  userId: string
  displayName: string
  color: string
}

export interface Appointment {
  id: string
  family_id: string
  title: string
  location: string | null
  notes: string | null
  start_at: string
  end_at: string | null
  assigned_to: string | null
  created_by_name: string
  updated_by_name: string | null
  created_at: string
  updated_at: string
}

export type AppointmentDraft = {
  title: string
  location: string
  notes: string
  date: string
  start_time: string
  end_time: string
  assigned_to: string
}

export interface Todo {
  id: string
  family_id: string
  title: string
  notes: string | null
  due_date: string | null
  assigned_to: string | null
  done: boolean
  created_by_name: string
  updated_by_name: string | null
  created_at: string
  updated_at: string
}

export type TodoDraft = {
  title: string
  notes: string
  due_date: string
  assigned_to: string
}

export interface OpenFollowUp {
  id: string
  entry_date: string
  category: string
  contact: string
  follow_up: string
  assigned_to: string | null
}

export interface Attachment {
  id: string
  entry_id: string
  family_id: string
  storage_path: string
  file_name: string
  content_type: string | null
  uploaded_by: string
  uploaded_by_name: string
  created_at: string
}

export interface Entry {
  id: string
  family_id: string
  entry_date: string
  category: Category
  contact: string
  notes: string
  reference_number: string | null
  follow_up: string | null
  follow_up_resolved: boolean
  assigned_to: string | null
  logged_by: string
  logged_by_name: string
  updated_by_name: string | null
  created_at: string
  updated_at: string
  attachments: Attachment[]
}

export type EntryDraft = {
  entry_date: string
  category: Category
  contact: string
  notes: string
  reference_number: string
  follow_up: string
  assigned_to: string
}

// ─────────────────────────────────────────────────────────────
// Care Handbook — one shared document per family.
// ─────────────────────────────────────────────────────────────

export interface HandbookAbout {
  first_name: string
  last_name: string
  known_as: string
  name_pronounced: string
  date_of_birth: string
  gender_identity: string
  preferred_language: string
  religious_cultural: string
  important_info: string
}

export interface HandbookClinical {
  blood_type: string
  allergies: string
  health_history: string
  other_info: string
}

export interface MedicationItem {
  name: string
  dosage: string
  frequency: string
  time_of_day: string
  instructions: string
}

export interface HandbookMedications {
  items: MedicationItem[]
  pharmacy: string
  last_updated: string
}

export interface EmergencyContact {
  name: string
  phone: string
  relationship: string
}

export interface HandbookEmergency {
  next_of_kin: EmergencyContact
  alternative_contact: EmergencyContact
  instructions: string[]
}

export interface HandbookCommunication {
  other_languages: string
  interpreter_needed: string
  how_i_communicate: string
  preferences: string
  difficulties: string
}

export interface HandbookPersonalCare {
  can_manage: string
  need_help_with: string
  products: string
  continence_care: string
}

export const MOBILITY_AIDS = ['No aid', 'Cane', 'Walker', 'Wheelchair', 'Scooter', 'Other'] as const

export interface HandbookMobility {
  aids: string[]
  aids_other: string
  higher_risk_when: string
  if_fall: string
  assist_by: string
  remind_to: string
}

export interface HandbookWellbeing {
  interests: string
  spend_day: string
  eat_drink: string
  upset_if: string
  other_info: string
}

export interface HandbookSupportNetwork {
  inner: string
  middle: string
  outer: string
  notes: string
  last_updated: string
}

export interface ConsultPerson {
  name: string
  when_to_consult: string
}

export interface ImportantPerson {
  name: string
  photo_path: string | null
}

export interface HandbookFamilyFriends {
  consult: ConsultPerson[]
  important_people: ImportantPerson[]
}

export interface Practitioner {
  name: string
  phone: string
  specialty: string
}

export interface HandbookSupportTeam {
  gp: { name: string; phone: string; address: string; email: string }
  practitioners: Practitioner[]
}

export interface CareHandbook {
  id: string
  family_id: string
  about: HandbookAbout
  clinical: HandbookClinical
  medications: HandbookMedications
  emergency: HandbookEmergency
  communication: HandbookCommunication
  personal_care: HandbookPersonalCare
  mobility: HandbookMobility
  wellbeing: HandbookWellbeing
  support_network: HandbookSupportNetwork
  family_friends: HandbookFamilyFriends
  support_team: HandbookSupportTeam
  additional_notes: string
  updated_by_name: string | null
  updated_at: string
}

export type HandbookColumn = Exclude<keyof CareHandbook, 'id' | 'family_id' | 'updated_by_name' | 'updated_at'>
