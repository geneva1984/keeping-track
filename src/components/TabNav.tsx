export type View = 'timeline' | 'handbook' | 'calendar' | 'actions'

const TABS: { id: View; label: string }[] = [
  { id: 'handbook', label: 'Care Handbook' },
  { id: 'actions', label: 'To Do' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'timeline', label: 'Logbook' },
]

export const VIEWS: View[] = TABS.map((t) => t.id)

interface Props {
  value: View
  onChange: (view: View) => void
}

export default function TabNav({ value, onChange }: Props) {
  const tabs = TABS
  return (
    <div className="border-b border-line bg-panel">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 flex gap-5 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`shrink-0 whitespace-nowrap text-sm font-medium py-2.5 border-b-2 transition-colors ${
              value === tab.id ? 'border-accent text-accent' : 'border-transparent text-ink-soft hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
