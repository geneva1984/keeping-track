import { SectionCard } from './fields'

interface Props {
  value: string
  onChange: (value: string) => void
}

export default function NotesSection({ value, onChange }: Props) {
  return (
    <SectionCard number={11} title="Additional Notes">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        placeholder="Anything else worth recording..."
        className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent bg-white resize-none"
      />
    </SectionCard>
  )
}
