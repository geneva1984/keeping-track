import type { ReactNode } from 'react'

const inputClass =
  'w-full rounded-lg border border-line px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent bg-white'

interface FieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}

export function Field({ label, value, onChange, placeholder, type = 'text' }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  )
}

interface TextAreaFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}

export function TextAreaField({ label, value, onChange, placeholder, rows = 3 }: TextAreaFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`${inputClass} resize-none`}
      />
    </div>
  )
}

interface SectionCardProps {
  number: number
  title: string
  children: ReactNode
}

export function SectionCard({ number, title, children }: SectionCardProps) {
  return (
    <section className="bg-panel rounded-2xl border border-line overflow-hidden">
      <div className="px-5 sm:px-6 pt-5 pb-3 border-b border-line flex items-baseline gap-2">
        <span className="text-xs text-gold font-medium">{String(number).padStart(2, '0')}</span>
        <h2 className="font-serif text-lg font-semibold">{title}</h2>
      </div>
      <div className="px-5 sm:px-6 py-5 space-y-4">{children}</div>
    </section>
  )
}

interface RepeatingListProps<T> {
  items: T[]
  onChange: (items: T[]) => void
  makeEmpty: () => T
  renderItem: (item: T, index: number, update: (patch: Partial<T>) => void) => ReactNode
  addLabel: string
}

export function RepeatingList<T>({ items, onChange, makeEmpty, renderItem, addLabel }: RepeatingListProps<T>) {
  function update(index: number, patch: Partial<T>) {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }
  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index))
  }
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex-1 space-y-2">{renderItem(item, i, (patch) => update(i, patch))}</div>
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label="Remove"
            className="mt-2 text-ink-soft hover:text-warn text-lg leading-none px-1"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, makeEmpty()])}
        className="text-sm font-medium text-accent hover:text-accent-dark"
      >
        + {addLabel}
      </button>
    </div>
  )
}
