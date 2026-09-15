import type { FamilyMemberInfo } from '../../types'

interface Props {
  members: FamilyMemberInfo[]
  value: string | 'All' | 'Unassigned'
  onChange: (value: string | 'All' | 'Unassigned') => void
}

export default function AssigneeFilter({ members, value, onChange }: Props) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
      <button
        onClick={() => onChange('All')}
        className={`shrink-0 text-xs font-medium rounded-full px-3 py-1.5 border transition-colors ${
          value === 'All' ? 'bg-accent text-white border-accent' : 'bg-panel text-ink-soft border-line hover:border-accent/40'
        }`}
      >
        All
      </button>
      {members.map((m) => (
        <button
          key={m.userId}
          onClick={() => onChange(m.userId)}
          className={`shrink-0 flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 border transition-colors ${
            value === m.userId ? 'text-white border-transparent' : 'bg-panel text-ink-soft border-line hover:border-accent/40'
          }`}
          style={value === m.userId ? { backgroundColor: m.color } : undefined}
        >
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
          {m.displayName}
        </button>
      ))}
      <button
        onClick={() => onChange('Unassigned')}
        className={`shrink-0 text-xs font-medium rounded-full px-3 py-1.5 border transition-colors ${
          value === 'Unassigned' ? 'bg-accent text-white border-accent' : 'bg-panel text-ink-soft border-line hover:border-accent/40'
        }`}
      >
        Unassigned
      </button>
    </div>
  )
}
