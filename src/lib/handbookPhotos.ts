import { supabase } from './supabase'

const BUCKET = 'handbook-photos'

function randomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

export async function uploadHandbookPhoto(familyId: string, file: File): Promise<string> {
  const path = `${familyId}/${randomId()}-${sanitizeFileName(file.name)}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file)
  if (error) throw error
  return path
}

export async function deleteHandbookPhoto(path: string) {
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw error
}

export async function getHandbookPhotoUrl(path: string) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600)
  if (error) throw error
  return data.signedUrl
}
