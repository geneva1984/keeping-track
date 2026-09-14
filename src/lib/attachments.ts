import { supabase } from './supabase'

const BUCKET = 'attachments'

function randomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

export async function uploadAttachment(familyId: string, entryId: string, file: File) {
  const path = `${familyId}/${entryId}/${randomId()}-${sanitizeFileName(file.name)}`
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file)
  if (uploadError) throw uploadError

  const { error: insertError } = await supabase.from('attachments').insert({
    entry_id: entryId,
    family_id: familyId,
    storage_path: path,
    file_name: file.name,
    content_type: file.type || null,
  })
  if (insertError) {
    await supabase.storage.from(BUCKET).remove([path])
    throw insertError
  }
}

export async function deleteAttachment(attachmentId: string, storagePath: string) {
  const { error: storageError } = await supabase.storage.from(BUCKET).remove([storagePath])
  if (storageError) throw storageError
  const { error: dbError } = await supabase.from('attachments').delete().eq('id', attachmentId)
  if (dbError) throw dbError
}

export async function getSignedUrl(storagePath: string) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 3600)
  if (error) throw error
  return data.signedUrl
}
