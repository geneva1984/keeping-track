import type { FamilyMemberInfo, OpenFollowUp } from '../../types'

interface Props {
  followUp: OpenFollowUp
  members: FamilyMemberInfo[]
  assignee: FamilyMemberInfo | null
  onResolve: () => void
  onAssign: (userId: string) => void
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

export default function FollowUpItem({ followUp, members, assignee, onResolve, onAssign }: Props) {
  const color = assignee?.color ?? '#9a968a'

  return (
    <div className="bg-gold-soft border border-gold/30 rounded-xl px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-gold font-medium">
            {followUp.category} · {followUp.contact} · {formatDate(followUp.entry_date)}
          </p>
          <p className="text-sm text-ink mt-1">{followUp.follow_up}</p>
        </div>
        <button
          onClick={onResolve}
          className="shrink-0 text-xs font-medium text-accent hover:text-accent-dark underline underline-offset-2 whitespace-nowrap"
        >
          Mark resolved
        </button>
      </div>
      <div className="flex items-center gap-1.5 mt-2.5">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <select
          value={followUp.assigned_to ?? ''}
          onChange={(e) => onAssign(e.target.value)}
          className="text-xs text-ink-soft bg-transparent border-none focus:outline-none focus:ring-0 -ml-1 py-0.5"
        >
          <option value="">Unassigned</option>
          {members.map((m) => (
            <option key={m.userId} value={m.userId}>
              {m.displayName}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
