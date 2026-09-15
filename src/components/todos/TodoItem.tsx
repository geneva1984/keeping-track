import { useState } from 'react'
import type { FamilyMemberInfo, Todo } from '../../types'

interface Props {
  todo: Todo
  assignee: FamilyMemberInfo | null
  onToggleDone: () => void
  onEdit: () => void
  onDelete: () => void
}

function formatDueDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

export default function TodoItem({ todo, assignee, onToggleDone, onEdit, onDelete }: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const color = assignee?.color ?? '#9a968a'

  return (
    <div
      className="bg-panel border border-line rounded-xl pl-4 pr-4 sm:pr-5 py-3 flex gap-3"
      style={{ borderLeftColor: color, borderLeftWidth: 4 }}
    >
      <button
        type="button"
        onClick={onToggleDone}
        aria-label={todo.done ? 'Mark not done' : 'Mark done'}
        className={`shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          todo.done ? 'bg-accent border-accent' : 'border-line hover:border-accent/50'
        }`}
      >
        {todo.done && (
          <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none">
            <path d="M5 12.5 9 16.5 19 6.5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className={`text-sm font-medium ${todo.done ? 'text-ink-soft line-through decoration-ink-soft/40' : 'text-ink'}`}>
            {todo.title}
          </p>
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
        {todo.notes && <p className="text-sm text-ink-soft mt-1 whitespace-pre-wrap leading-relaxed">{todo.notes}</p>}
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {todo.due_date && <span className="text-xs text-ink-soft">Due {formatDueDate(todo.due_date)}</span>}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="text-xs text-ink-soft">{assignee ? assignee.displayName : 'Unassigned'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
