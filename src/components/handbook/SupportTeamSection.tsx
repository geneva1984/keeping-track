import type { HandbookSupportTeam, Practitioner } from '../../types'
import { Field, SectionCard, RepeatingList } from './fields'

interface Props {
  value: HandbookSupportTeam
  onChange: (value: HandbookSupportTeam) => void
}

const emptyPractitioner = (): Practitioner => ({ name: '', phone: '', specialty: '' })

export default function SupportTeamSection({ value, onChange }: Props) {
  return (
    <SectionCard number={10} title="My Support Team">
      <div>
        <h3 className="font-semibold text-sm mb-2">GP</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Name" value={value.gp.name} onChange={(v) => onChange({ ...value, gp: { ...value.gp, name: v } })} />
          <Field label="Phone" value={value.gp.phone} onChange={(v) => onChange({ ...value, gp: { ...value.gp, phone: v } })} />
          <Field label="Address" value={value.gp.address} onChange={(v) => onChange({ ...value, gp: { ...value.gp, address: v } })} />
          <Field label="Email" value={value.gp.email} onChange={(v) => onChange({ ...value, gp: { ...value.gp, email: v } })} />
        </div>
      </div>
      <div className="border-t border-line pt-4">
        <h3 className="font-semibold text-sm mb-3">Other practitioners</h3>
        <RepeatingList
          items={value.practitioners}
          onChange={(practitioners) => onChange({ ...value, practitioners })}
          makeEmpty={emptyPractitioner}
          addLabel="Add practitioner"
          renderItem={(item, i, update) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Field label="Name" value={item.name} onChange={(v) => update({ name: v })} />
              <Field label="Phone" value={item.phone} onChange={(v) => update({ phone: v })} />
              <Field label="Specialty" value={item.specialty} onChange={(v) => update({ specialty: v })} />
            </div>
          )}
        />
      </div>
    </SectionCard>
  )
}
