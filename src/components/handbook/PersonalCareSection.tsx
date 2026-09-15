import type { HandbookPersonalCare } from '../../types'
import { TextAreaField, SectionCard } from './fields'

interface Props {
  value: HandbookPersonalCare
  onChange: (value: HandbookPersonalCare) => void
}

export default function PersonalCareSection({ value, onChange }: Props) {
  function set<K extends keyof HandbookPersonalCare>(key: K, v: HandbookPersonalCare[K]) {
    onChange({ ...value, [key]: v })
  }
  return (
    <SectionCard number={5} title="My Personal Care">
      <TextAreaField label="Activities I can manage" value={value.can_manage} onChange={(v) => set('can_manage', v)} rows={3} />
      <TextAreaField label="Activities I need help with" value={value.need_help_with} onChange={(v) => set('need_help_with', v)} rows={3} />
      <TextAreaField label="Personal care products" value={value.products} onChange={(v) => set('products', v)} rows={3} />
      <TextAreaField label="Continence care" value={value.continence_care} onChange={(v) => set('continence_care', v)} rows={3} />
    </SectionCard>
  )
}
