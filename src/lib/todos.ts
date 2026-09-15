import { supabase } from './supabase'
import type { Todo, TodoDraft } from '../types'

function draftToPayload(familyId: string, draft: TodoDraft) {
  return {
    family_id: familyId,
    title: draft.title,
    notes: draft.notes || null,
    due_date: draft.due_date || null,
    assigned_to: draft.assigned_to || null,
  }
}

export async function loadTodos(familyId: string): Promise<Todo[]> {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('family_id', familyId)
    .order('done', { ascending: true })
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Todo[]
}

export async function createTodo(familyId: string, draft: TodoDraft) {
  const { error } = await supabase.from('todos').insert(draftToPayload(familyId, draft))
  if (error) throw error
}

export async function updateTodo(id: string, familyId: string, draft: TodoDraft) {
  const { error } = await supabase.from('todos').update(draftToPayload(familyId, draft)).eq('id', id)
  if (error) throw error
}

export async function setTodoDone(id: string, done: boolean) {
  const { error } = await supabase.from('todos').update({ done }).eq('id', id)
  if (error) throw error
}

export async function deleteTodo(id: string) {
  const { error } = await supabase.from('todos').delete().eq('id', id)
  if (error) throw error
}
