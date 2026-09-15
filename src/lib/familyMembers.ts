import { supabase } from './supabase'
import type { FamilyMemberInfo } from '../types'

export async function loadFamilyMembers(familyId: string): Promise<FamilyMemberInfo[]> {
  const { data, error } = await supabase
    .from('family_members')
    .select('user_id, display_name, color')
    .eq('family_id', familyId)
    .order('joined_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map((r) => ({ userId: r.user_id, displayName: r.display_name, color: r.color }))
}
