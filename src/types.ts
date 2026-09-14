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
}
