export interface SectionInfo {
  id: string
  number: number
  label: string
}

interface Props {
  sections: SectionInfo[]
  active: string
  onChange: (id: string) => void
}

export default function SectionNav({ sections, active, onChange }: Props) {
  return (
    <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
      <div className="flex gap-1.5 pb-1 w-max sm:w-full sm:flex-wrap">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            className={`shrink-0 text-xs font-medium rounded-full px-3 py-1.5 border transition-colors ${
              active === s.id
                ? 'bg-accent text-white border-accent'
                : 'bg-panel text-ink-soft border-line hover:border-accent/40'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
