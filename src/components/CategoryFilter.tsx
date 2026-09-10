import { CATEGORIES, type Category } from '../types'

interface Props {
  value: Category | 'All'
  onChange: (value: Category | 'All') => void
}

export default function CategoryFilter({ value, onChange }: Props) {
  const options: (Category | 'All')[] = ['All', ...CATEGORIES]

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`shrink-0 text-xs font-medium rounded-full px-3 py-1.5 border transition-colors ${
            value === opt
              ? 'bg-accent text-white border-accent'
              : 'bg-panel text-ink-soft border-line hover:border-accent/40'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
