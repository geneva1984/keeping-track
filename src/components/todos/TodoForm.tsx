import { useState, type FormEvent } from 'react'
import type { FamilyMemberInfo, Todo, TodoDraft } from '../../types'

interface Props {
  members: FamilyMemberInfo[]
  initial?: Todo
  onCancel: () => void
  onSave: (draft: TodoDraft) => Promise<void>
}

const inputClass =
  'w-full rounded-lg border border-line px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent'

export default function TodoForm({ members, initial, onCancel, onSave }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [dueDate, setDueDate] = useState(initial?.due_date ?? '')
  const [assignedTo, setAssignedTo] = useState(initial?.assigned_to ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await onSave({ title: title.trim(), notes: notes.trim(), due_date: dueDate, assigned_to: assignedTo })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this item')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/30 flex items-end sm:items-center justify-center z-30 sm:px-6">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto shadow-lg">
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold">{initial ? 'Edit item' : 'New to do'}</h2>
            <button type="button" onClick={onCancel} className="text-ink-soft hover:text-ink text-xl leading-none px-1">
              ×
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">What needs doing</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Call the pharmacy about a repeat script"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Due date (optional)</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Assign to</label>
              <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className={`${inputClass} bg-white`}>
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.displayName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes (optional)</label>
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} resize-none`} />
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
              {saving ? 'Saving…' : initial ? 'Save changes' : 'Add to do'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
