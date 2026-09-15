import type { HandbookCommunication } from '../../types'
import { Field, TextAreaField, SectionCard } from './fields'

interface Props {
  value: HandbookCommunication
  onChange: (value: HandbookCommunication) => void
}

export default function CommunicationSection({ value, onChange }: Props) {
  function set<K extends keyof HandbookCommunication>(key: K, v: HandbookCommunication[K]) {
    onChange({ ...value, [key]: v })
  }
  return (
    <SectionCard number={4} title="My Communication">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Other languages I speak" value={value.other_languages} onChange={(v) => set('other_languages', v)} />
        <Field label="Interpreter needed" value={value.interpreter_needed} onChange={(v) => set('interpreter_needed', v)} />
      </div>
      <Field label="How I communicate" value={value.how_i_communicate} onChange={(v) => set('how_i_communicate', v)} />
      <TextAreaField
        label="When communicating with me please..."
        value={value.preferences}
        onChange={(v) => set('preferences', v)}
        rows={3}
      />
      <TextAreaField
        label="I have difficulties with..."
        value={value.difficulties}
        onChange={(v) => set('difficulties', v)}
        rows={3}
      />
    </SectionCard>
  )
}
