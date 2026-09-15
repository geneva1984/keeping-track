import { supabase } from './supabase'
import type { OpenFollowUp } from '../types'

export async function loadOpenFollowUps(familyId: string): Promise<OpenFollowUp[]> {
  const { data, error } = await supabase
    .from('entries')
    .select('id, entry_date, category, contact, follow_up, assigned_to')
    .eq('family_id', familyId)
    .eq('follow_up_resolved', false)
    .not('follow_up', 'is', null)
    .order('entry_date', { ascending: false })
  if (error) throw error
  return (data ?? []) as OpenFollowUp[]
}

export async function resolveFollowUp(entryId: string) {
  const { error } = await supabase.from('entries').update({ follow_up_resolved: true }).eq('id', entryId)
  if (error) throw error
}

export async function assignFollowUp(entryId: string, userId: string | null) {
  const { error } = await supabase.from('entries').update({ assigned_to: userId }).eq('id', entryId)
  if (error) throw error
}
