import type { HandbookEmergency } from '../../types'
import { Field, SectionCard } from './fields'

interface Props {
  value: HandbookEmergency
  onChange: (value: HandbookEmergency) => void
}

export default function EmergencySection({ value, onChange }: Props) {
  function setInstruction(i: number, text: string) {
    const next = [...value.instructions]
    next[i] = text
    onChange({ ...value, instructions: next })
  }
  function addInstruction() {
    onChange({ ...value, instructions: [...value.instructions, ''] })
  }
  function removeInstruction(i: number) {
    onChange({ ...value, instructions: value.instructions.filter((_, idx) => idx !== i) })
  }

  return (
    <SectionCard number={3} title="My Emergency Details">
      <div>
        <h3 className="font-semibold text-sm mb-2">Next of Kin</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field
            label="Name"
            value={value.next_of_kin.name}
            onChange={(v) => onChange({ ...value, next_of_kin: { ...value.next_of_kin, name: v } })}
          />
          <Field
            label="Phone"
            value={value.next_of_kin.phone}
            onChange={(v) => onChange({ ...value, next_of_kin: { ...value.next_of_kin, phone: v } })}
          />
          <Field
            label="Relationship"
            value={value.next_of_kin.relationship}
            onChange={(v) => onChange({ ...value, next_of_kin: { ...value.next_of_kin, relationship: v } })}
          />
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-sm mb-2">Alternative Emergency Contact</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field
            label="Name"
            value={value.alternative_contact.name}
            onChange={(v) => onChange({ ...value, alternative_contact: { ...value.alternative_contact, name: v } })}
          />
          <Field
            label="Phone"
            value={value.alternative_contact.phone}
            onChange={(v) => onChange({ ...value, alternative_contact: { ...value.alternative_contact, phone: v } })}
          />
          <Field
            label="Relationship"
            value={value.alternative_contact.relationship}
            onChange={(v) =>
              onChange({ ...value, alternative_contact: { ...value.alternative_contact, relationship: v } })
            }
          />
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-sm mb-2">In an emergency please make sure...</h3>
        <div className="space-y-2">
          {value.instructions.map((text, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-sm text-ink-soft w-5 shrink-0">{i + 1}.</span>
              <input
                value={text}
                onChange={(e) => setInstruction(i, e.target.value)}
                className="flex-1 rounded-lg border border-line px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent bg-white"
              />
              <button type="button" onClick={() => removeInstruction(i)} className="text-ink-soft hover:text-warn text-lg leading-none px-1">
                ×
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addInstruction} className="text-sm font-medium text-accent hover:text-accent-dark mt-2">
          + Add instruction
        </button>
      </div>
    </SectionCard>
  )
}
