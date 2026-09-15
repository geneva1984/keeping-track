import { useState } from 'react'
import type { Appointment, FamilyMemberInfo } from '../../types'

interface Props {
  appointment: Appointment
  assignee: FamilyMemberInfo | null
  onEdit: () => void
  onDelete: () => void
}

function formatTimeRange(startIso: string, endIso: string | null) {
  const start = new Date(startIso)
  const startStr = start.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' })
  if (!endIso) return startStr
  const end = new Date(endIso)
  return `${startStr} – ${end.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' })}`
}

export default function AppointmentCard({ appointment, assignee, onEdit, onDelete }: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const color = assignee?.color ?? '#9a968a'

  return (
    <div className="bg-panel border border-line rounded-xl pl-4 pr-4 sm:pr-5 py-3.5 flex gap-3" style={{ borderLeftColor: color, borderLeftWidth: 4 }}>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-ink">{appointment.title}</p>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onEdit} className="text-xs text-ink-soft hover:text-accent">
              Edit
            </button>
            {confirmingDelete ? (
              <div className="flex items-center gap-1.5">
                <button onClick={onDelete} className="text-xs text-warn font-medium">
                  Confirm
                </button>
                <button onClick={() => setConfirmingDelete(false)} className="text-xs text-ink-soft">
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmingDelete(true)} className="text-xs text-ink-soft hover:text-warn">
                Delete
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-ink-soft mt-0.5">{formatTimeRange(appointment.start_at, appointment.end_at)}</p>
        {appointment.location && <p className="text-xs text-ink-soft mt-0.5">{appointment.location}</p>}
        {appointment.notes && <p className="text-sm text-ink-soft mt-2 whitespace-pre-wrap leading-relaxed">{appointment.notes}</p>}
        <div className="flex items-center gap-1.5 mt-2.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <span className="text-xs text-ink-soft">{assignee ? assignee.displayName : 'Unassigned'}</span>
        </div>
      </div>
    </div>
  )
}
