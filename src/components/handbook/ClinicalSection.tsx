import type { HandbookClinical, HandbookMedications, MedicationItem } from '../../types'
import { Field, TextAreaField, SectionCard, RepeatingList } from './fields'

interface Props {
  clinical: HandbookClinical
  medications: HandbookMedications
  onChangeClinical: (value: HandbookClinical) => void
  onChangeMedications: (value: HandbookMedications) => void
}

const emptyMedication = (): MedicationItem => ({
  name: '',
  dosage: '',
  frequency: '',
  time_of_day: '',
  instructions: '',
})

export default function ClinicalSection({ clinical, medications, onChangeClinical, onChangeMedications }: Props) {
  function setClinical<K extends keyof HandbookClinical>(key: K, v: HandbookClinical[K]) {
    onChangeClinical({ ...clinical, [key]: v })
  }
  function setMedField<K extends keyof HandbookMedications>(key: K, v: HandbookMedications[K]) {
    onChangeMedications({ ...medications, [key]: v })
  }

  return (
    <SectionCard number={2} title="My Clinical Care">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Blood type" value={clinical.blood_type} onChange={(v) => setClinical('blood_type', v)} />
      </div>
      <TextAreaField label="I am allergic to" value={clinical.allergies} onChange={(v) => setClinical('allergies', v)} rows={3} />
      <TextAreaField
        label="My health history"
        value={clinical.health_history}
        onChange={(v) => setClinical('health_history', v)}
        rows={5}
      />
      <TextAreaField
        label="Other information about my clinical care"
        value={clinical.other_info}
        onChange={(v) => setClinical('other_info', v)}
        rows={4}
      />

      <div className="border-t border-line pt-4 mt-2">
        <h3 className="font-serif font-semibold mb-3">Medication Chart</h3>
        <RepeatingList
          items={medications.items}
          onChange={(items) => setMedField('items', items)}
          makeEmpty={emptyMedication}
          addLabel="Add medication"
          renderItem={(item, i, update) => (
            <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <Field label="Medication" value={item.name} onChange={(v) => update({ name: v })} />
              <Field label="Dosage" value={item.dosage} onChange={(v) => update({ dosage: v })} />
              <Field label="Frequency" value={item.frequency} onChange={(v) => update({ frequency: v })} />
              <Field label="Time of day" value={item.time_of_day} onChange={(v) => update({ time_of_day: v })} />
              <Field label="Special instructions" value={item.instructions} onChange={(v) => update({ instructions: v })} />
            </div>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Field label="Pharmacy" value={medications.pharmacy} onChange={(v) => setMedField('pharmacy', v)} />
          <Field label="Last updated" type="date" value={medications.last_updated} onChange={(v) => setMedField('last_updated', v)} />
        </div>
      </div>
    </SectionCard>
  )
}
