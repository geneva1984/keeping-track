import { supabase } from './supabase'
import type {
  CareHandbook,
  HandbookAbout,
  HandbookClinical,
  HandbookCommunication,
  HandbookEmergency,
  HandbookFamilyFriends,
  HandbookMedications,
  HandbookMobility,
  HandbookPersonalCare,
  HandbookSupportNetwork,
  HandbookSupportTeam,
  HandbookWellbeing,
} from '../types'

const TABLE = 'care_handbooks'

function defaultAbout(): HandbookAbout {
  return {
    first_name: '',
    last_name: '',
    known_as: '',
    name_pronounced: '',
    date_of_birth: '',
    gender_identity: '',
    preferred_language: '',
    religious_cultural: '',
    important_info: '',
  }
}

function defaultClinical(): HandbookClinical {
  return { blood_type: '', allergies: '', health_history: '', other_info: '' }
}

function defaultMedications(): HandbookMedications {
  return { items: [], pharmacy: '', last_updated: '' }
}

function defaultEmergency(): HandbookEmergency {
  return {
    next_of_kin: { name: '', phone: '', relationship: '' },
    alternative_contact: { name: '', phone: '', relationship: '' },
    instructions: ['', '', ''],
  }
}

function defaultCommunication(): HandbookCommunication {
  return { other_languages: '', interpreter_needed: '', how_i_communicate: '', preferences: '', difficulties: '' }
}

function defaultPersonalCare(): HandbookPersonalCare {
  return { can_manage: '', need_help_with: '', products: '', continence_care: '' }
}

function defaultMobility(): HandbookMobility {
  return { aids: [], aids_other: '', higher_risk_when: '', if_fall: '', assist_by: '', remind_to: '' }
}

function defaultWellbeing(): HandbookWellbeing {
  return { interests: '', spend_day: '', eat_drink: '', upset_if: '', other_info: '' }
}

function defaultSupportNetwork(): HandbookSupportNetwork {
  return { inner: '', middle: '', outer: '', notes: '', last_updated: '' }
}

function defaultFamilyFriends(): HandbookFamilyFriends {
  return {
    consult: [],
    important_people: [
      { name: '', photo_path: null },
      { name: '', photo_path: null },
      { name: '', photo_path: null },
    ],
  }
}

function defaultSupportTeam(): HandbookSupportTeam {
  return { gp: { name: '', phone: '', address: '', email: '' }, practitioners: [] }
}

// Merges a possibly-partial row from the database on top of sane defaults, so
// older rows (or a fresh '{}'::jsonb column) never crash the UI on a missing key.
export function normalizeHandbook(row: Record<string, unknown>): CareHandbook {
  return {
    id: row.id as string,
    family_id: row.family_id as string,
    about: { ...defaultAbout(), ...(row.about as object) },
    clinical: { ...defaultClinical(), ...(row.clinical as object) },
    medications: { ...defaultMedications(), ...(row.medications as object) },
    emergency: { ...defaultEmergency(), ...(row.emergency as object) },
    communication: { ...defaultCommunication(), ...(row.communication as object) },
    personal_care: { ...defaultPersonalCare(), ...(row.personal_care as object) },
    mobility: { ...defaultMobility(), ...(row.mobility as object) },
    wellbeing: { ...defaultWellbeing(), ...(row.wellbeing as object) },
    support_network: { ...defaultSupportNetwork(), ...(row.support_network as object) },
    family_friends: { ...defaultFamilyFriends(), ...(row.family_friends as object) },
    support_team: { ...defaultSupportTeam(), ...(row.support_team as object) },
    additional_notes: (row.additional_notes as string) ?? '',
    updated_by_name: (row.updated_by_name as string | null) ?? null,
    updated_at: row.updated_at as string,
  }
}

export async function loadOrCreateHandbook(familyId: string): Promise<CareHandbook> {
  const { data, error } = await supabase.from(TABLE).select('*').eq('family_id', familyId).maybeSingle()
  if (error) throw error
  if (data) return normalizeHandbook(data)

  const { data: created, error: insertError } = await supabase
    .from(TABLE)
    .insert({ family_id: familyId })
    .select('*')
    .single()

  if (insertError) {
    // Another family member created it in the same instant — fetch theirs instead.
    if (insertError.code === '23505') {
      const { data: refetched, error: refetchError } = await supabase
        .from(TABLE)
        .select('*')
        .eq('family_id', familyId)
        .single()
      if (refetchError) throw refetchError
      return normalizeHandbook(refetched)
    }
    throw insertError
  }
  return normalizeHandbook(created)
}

export async function saveHandbookColumn(id: string, column: string, value: unknown) {
  const { error } = await supabase
    .from(TABLE)
    .update({ [column]: value })
    .eq('id', id)
  if (error) throw error
}
