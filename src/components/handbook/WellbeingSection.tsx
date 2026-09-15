import type { HandbookWellbeing } from '../../types'
import { TextAreaField, SectionCard } from './fields'

interface Props {
  value: HandbookWellbeing
  onChange: (value: HandbookWellbeing) => void
}

export default function WellbeingSection({ value, onChange }: Props) {
  function set<K extends keyof HandbookWellbeing>(key: K, v: HandbookWellbeing[K]) {
    onChange({ ...value, [key]: v })
  }
  return (
    <SectionCard number={7} title="My Wellbeing">
      <TextAreaField label="My interests" value={value.interests} onChange={(v) => set('interests', v)} rows={3} />
      <TextAreaField label="I like to spend my day..." value={value.spend_day} onChange={(v) => set('spend_day', v)} rows={3} />
      <TextAreaField label="I prefer to eat and drink..." value={value.eat_drink} onChange={(v) => set('eat_drink', v)} rows={3} />
      <TextAreaField label="I may get upset or anxious if..." value={value.upset_if} onChange={(v) => set('upset_if', v)} rows={3} />
      <TextAreaField
        label="Other information you should know about me"
        value={value.other_info}
        onChange={(v) => set('other_info', v)}
        rows={3}
      />
    </SectionCard>
  )
}
