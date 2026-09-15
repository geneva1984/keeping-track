import { supabase } from './supabase'
import type { Appointment, AppointmentDraft } from '../types'

// Combines a plain "YYYY-MM-DD" date with a "HH:MM" time as the browser's
// local time, then converts to a UTC instant for the timestamptz column.
function toIso(date: string, time: string): string | null {
  if (!date || !time) return null
  const local = new Date(`${date}T${time}:00`)
  if (Number.isNaN(local.getTime())) return null
  return local.toISOString()
}

export function draftToPayload(familyId: string, draft: AppointmentDraft) {
  return {
    family_id: familyId,
    title: draft.title,
    location: draft.location || null,
    notes: draft.notes || null,
    start_at: toIso(draft.date, draft.start_time),
    end_at: draft.end_time ? toIso(draft.date, draft.end_time) : null,
    assigned_to: draft.assigned_to || null,
  }
}

export async function loadAppointments(familyId: string): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('family_id', familyId)
    .order('start_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as Appointment[]
}

export async function createAppointment(familyId: string, draft: AppointmentDraft) {
  const { error } = await supabase.from('appointments').insert(draftToPayload(familyId, draft))
  if (error) throw error
}

export async function updateAppointment(id: string, familyId: string, draft: AppointmentDraft) {
  const { error } = await supabase.from('appointments').update(draftToPayload(familyId, draft)).eq('id', id)
  if (error) throw error
}

export async function deleteAppointment(id: string) {
  const { error } = await supabase.from('appointments').delete().eq('id', id)
  if (error) throw error
}
