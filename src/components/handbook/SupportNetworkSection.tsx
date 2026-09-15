import type { HandbookSupportNetwork } from '../../types'
import { Field, TextAreaField, SectionCard } from './fields'

interface Props {
  value: HandbookSupportNetwork
  onChange: (value: HandbookSupportNetwork) => void
}

export default function SupportNetworkSection({ value, onChange }: Props) {
  function set<K extends keyof HandbookSupportNetwork>(key: K, v: HandbookSupportNetwork[K]) {
    onChange({ ...value, [key]: v })
  }
  return (
    <SectionCard number={8} title="My Support Network">
      <p className="text-sm text-ink-soft">Who's around, from the people relied on daily to the wider services that help.</p>
      <TextAreaField
        label="Inner circle — people I rely on often"
        value={value.inner}
        onChange={(v) => set('inner', v)}
        rows={3}
      />
      <TextAreaField
        label="Middle circle — people who help sometimes"
        value={value.middle}
        onChange={(v) => set('middle', v)}
        rows={3}
      />
      <TextAreaField
        label="Outer circle — services and organisations that support me"
        value={value.outer}
        onChange={(v) => set('outer', v)}
        rows={3}
      />
      <TextAreaField
        label="Important things to know about my support network"
        value={value.notes}
        onChange={(v) => set('notes', v)}
        rows={3}
      />
      <Field label="Last updated" type="date" value={value.last_updated} onChange={(v) => set('last_updated', v)} />
    </SectionCard>
  )
}
