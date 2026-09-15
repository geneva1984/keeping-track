import { useState, type FormEvent } from 'react'
import type { Appointment, AppointmentDraft, FamilyMemberInfo } from '../../types'

interface Props {
  members: FamilyMemberInfo[]
  initial?: Appointment
  onCancel: () => void
  onSave: (draft: AppointmentDraft) => Promise<void>
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function toDateInput(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function toTimeInput(iso: string) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const inputClass =
  'w-full rounded-lg border border-line px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent'

export default function AppointmentForm({ members, initial, onCancel, onSave }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [date, setDate] = useState(initial ? toDateInput(initial.start_at) : today())
  const [startTime, setStartTime] = useState(initial ? toTimeInput(initial.start_at) : '09:00')
  const [endTime, setEndTime] = useState(initial?.end_at ? toTimeInput(initial.end_at) : '')
  const [location, setLocation] = useState(initial?.location ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [assignedTo, setAssignedTo] = useState(initial?.assigned_to ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await onSave({
        title: title.trim(),
        location: location.trim(),
        notes: notes.trim(),
        date,
        start_time: startTime,
        end_time: endTime,
        assigned_to: assignedTo,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this appointment')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/30 flex items-end sm:items-center justify-center z-30 sm:px-6">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto shadow-lg">
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold">{initial ? 'Edit appointment' : 'New appointment'}</h2>
            <button type="button" onClick={onCancel} className="text-ink-soft hover:text-ink text-xl leading-none px-1">
              ×
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. GP appointment, physio visit"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-sm font-medium mb-1">Date</label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End (optional)</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Who's actioning this</label>
            <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className={`${inputClass} bg-white`}>
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.displayName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location (optional)</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes (optional)</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`${inputClass} resize-none`}
            />
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
              {saving ? 'Saving…' : initial ? 'Save changes' : 'Add appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
