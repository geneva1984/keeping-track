import { useState } from 'react'
import type { Entry, FamilyMemberInfo } from '../types'
import AttachmentThumb from './AttachmentThumb'

interface Props {
  entry: Entry
  assignee: FamilyMemberInfo | null
  onEdit: () => void
  onDelete: () => void
  onToggleFollowUp: () => void
}

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function EntryCard({ entry, assignee, onEdit, onDelete, onToggleFollowUp }: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const hasOpenFollowUp = !!entry.follow_up && !entry.follow_up_resolved

  return (
    <div
      className={`bg-panel border rounded-xl p-4 sm:p-5 ${
        hasOpenFollowUp ? 'border-gold/50' : 'border-line'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium bg-accent-soft text-accent-dark rounded-full px-2.5 py-1">
            {entry.category}
          </span>
          <span className="text-xs text-ink-soft">{formatDate(entry.entry_date)}</span>
        </div>
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

      <p className="text-sm font-medium text-ink mb-1">{entry.contact}</p>
      <p className="text-sm text-ink-soft whitespace-pre-wrap leading-relaxed">{entry.notes}</p>

      {entry.reference_number && (
        <p className="text-xs text-ink-soft mt-2">
          Reference: <span className="font-medium text-ink">{entry.reference_number}</span>
        </p>
      )}

      {entry.attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {entry.attachments.map((a) => (
            <AttachmentThumb key={a.id} attachment={a} />
          ))}
        </div>
      )}

      {entry.follow_up && (
        <div
          className={`mt-3 rounded-lg px-3 py-2.5 flex items-start justify-between gap-3 ${
            entry.follow_up_resolved ? 'bg-accent-soft/60' : 'bg-gold-soft'
          }`}
        >
          <div>
            <p className={`text-xs font-medium ${entry.follow_up_resolved ? 'text-accent-dark' : 'text-gold'}`}>
              {entry.follow_up_resolved ? 'Follow-up resolved' : 'Follow-up needed'}
            </p>
            <p
              className={`text-sm mt-0.5 ${
                entry.follow_up_resolved ? 'text-ink-soft line-through decoration-ink-soft/40' : 'text-ink'
              }`}
            >
              {entry.follow_up}
            </p>
            {assignee && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: assignee.color }} />
                <span className="text-xs text-ink-soft">{assignee.displayName}</span>
              </div>
            )}
          </div>
          <button
            onClick={onToggleFollowUp}
            className="shrink-0 text-xs font-medium text-accent hover:text-accent-dark underline underline-offset-2 whitespace-nowrap"
          >
            {entry.follow_up_resolved ? 'Reopen' : 'Mark resolved'}
          </button>
        </div>
      )}

      <p className="text-xs text-ink-soft/80 mt-3">
        Logged by {entry.logged_by_name}
        {entry.updated_by_name && entry.updated_by_name !== entry.logged_by_name && (
          <> · edited by {entry.updated_by_name}</>
        )}
      </p>
    </div>
  )
}
