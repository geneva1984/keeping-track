import { useState, type ChangeEvent, type FormEvent } from 'react'
import { CATEGORIES, type Attachment, type Entry, type EntryDraft } from '../types'
import AttachmentThumb from './AttachmentThumb'

interface Props {
  initial?: Entry
  onCancel: () => void
  onSave: (draft: EntryDraft, newFiles: File[]) => Promise<void>
  onDeleteAttachment?: (attachment: Attachment) => Promise<void>
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

const MAX_FILE_BYTES = 10 * 1024 * 1024

export default function EntryForm({ initial, onCancel, onSave, onDeleteAttachment }: Props) {
  const [entryDate, setEntryDate] = useState(initial?.entry_date ?? today())
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0])
  const [contact, setContact] = useState(initial?.contact ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [referenceNumber, setReferenceNumber] = useState(initial?.reference_number ?? '')
  const [followUp, setFollowUp] = useState(initial?.follow_up ?? '')
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [existingAttachments, setExistingAttachments] = useState(initial?.attachments ?? [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFilePick(e: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? [])
    e.target.value = ''
    const tooBig = picked.find((f) => f.size > MAX_FILE_BYTES)
    if (tooBig) {
      setError(`"${tooBig.name}" is over the 10MB limit`)
      return
    }
    setError(null)
    setNewFiles((prev) => [...prev, ...picked])
  }

  function removeNewFile(index: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleRemoveExisting(attachment: Attachment) {
    if (!onDeleteAttachment) return
    try {
      await onDeleteAttachment(attachment)
      setExistingAttachments((prev) => prev.filter((a) => a.id !== attachment.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove that file')
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await onSave(
        {
          entry_date: entryDate,
          category,
          contact: contact.trim(),
          notes: notes.trim(),
          reference_number: referenceNumber.trim(),
          follow_up: followUp.trim(),
        },
        newFiles,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this entry')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/30 flex items-end sm:items-center justify-center z-30 sm:px-6">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto shadow-lg">
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold">{initial ? 'Edit entry' : 'Log an interaction'}</h2>
            <button type="button" onClick={onCancel} className="text-ink-soft hover:text-ink text-xl leading-none px-1">
              ×
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                required
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full rounded-lg border border-line px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as typeof category)}
                className="w-full rounded-lg border border-line px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Who you spoke to</label>
            <input
              type="text"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="e.g. My Aged Care, or Jane at HomeCare Plus"
              className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">What was said</label>
            <textarea
              required
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes from the call or visit…"
              className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Reference number (optional)</label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Follow-up needed (optional)</label>
            <input
              type="text"
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              placeholder="e.g. Call back Thursday about assessment date"
              className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Photos or documents (optional)</label>
            <div className="flex flex-wrap gap-2">
              {existingAttachments.map((a) => (
                <AttachmentThumb key={a.id} attachment={a} onDelete={() => handleRemoveExisting(a)} />
              ))}
              {newFiles.map((file, i) => (
                <div key={i} className="relative shrink-0">
                  <div className="w-16 h-16 rounded-lg border border-line bg-accent-soft overflow-hidden flex items-center justify-center">
                    {file.type.startsWith('image/') ? (
                      <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-ink-soft px-1 text-center leading-tight">
                        {file.name.split('.').pop()?.toUpperCase() ?? 'FILE'}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeNewFile(i)}
                    className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-ink/70 text-white text-xs leading-none flex items-center justify-center hover:bg-warn"
                    aria-label={`Remove ${file.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="w-16 h-16 rounded-lg border border-dashed border-line flex items-center justify-center text-ink-soft hover:border-accent/50 hover:text-accent cursor-pointer transition-colors">
                <span className="text-2xl leading-none">+</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  onChange={handleFilePick}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-warn">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-lg border border-line text-sm font-medium py-2.5 hover:bg-accent-soft transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-accent text-white text-sm font-medium py-2.5 hover:bg-accent-dark transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving…' : initial ? 'Save changes' : 'Add entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
