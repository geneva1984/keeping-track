import { MOBILITY_AIDS, type HandbookMobility } from '../../types'
import { Field, TextAreaField, SectionCard } from './fields'

interface Props {
  value: HandbookMobility
  onChange: (value: HandbookMobility) => void
}

export default function MobilitySection({ value, onChange }: Props) {
  function set<K extends keyof HandbookMobility>(key: K, v: HandbookMobility[K]) {
    onChange({ ...value, [key]: v })
  }
  function toggleAid(aid: string) {
    const has = value.aids.includes(aid)
    set('aids', has ? value.aids.filter((a) => a !== aid) : [...value.aids, aid])
  }

  return (
    <SectionCard number={6} title="My Mobility">
      <div>
        <label className="block text-sm font-medium mb-2">Mobility aids I use</label>
        <div className="flex flex-wrap gap-2">
          {MOBILITY_AIDS.map((aid) => (
            <button
              key={aid}
              type="button"
              onClick={() => toggleAid(aid)}
              className={`text-sm rounded-full px-3.5 py-1.5 border transition-colors ${
                value.aids.includes(aid)
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white text-ink-soft border-line hover:border-accent/40'
              }`}
            >
              {aid}
            </button>
          ))}
        </div>
        {value.aids.includes('Other') && (
          <div className="mt-3">
            <Field label="Other aid" value={value.aids_other} onChange={(v) => set('aids_other', v)} />
          </div>
        )}
      </div>
      <TextAreaField label="Higher risk of falling when..." value={value.higher_risk_when} onChange={(v) => set('higher_risk_when', v)} rows={3} />
      <TextAreaField label="If I fall please..." value={value.if_fall} onChange={(v) => set('if_fall', v)} rows={3} />
      <TextAreaField label="Please assist me by..." value={value.assist_by} onChange={(v) => set('assist_by', v)} rows={3} />
      <TextAreaField
        label="When assisting me please remind me to..."
        value={value.remind_to}
        onChange={(v) => set('remind_to', v)}
        rows={3}
      />
    </SectionCard>
  )
}
