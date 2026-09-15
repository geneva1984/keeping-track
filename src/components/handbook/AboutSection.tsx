import type { HandbookAbout } from '../../types'
import { Field, TextAreaField, SectionCard } from './fields'

interface Props {
  value: HandbookAbout
  onChange: (value: HandbookAbout) => void
}

export default function AboutSection({ value, onChange }: Props) {
  function set<K extends keyof HandbookAbout>(key: K, v: HandbookAbout[K]) {
    onChange({ ...value, [key]: v })
  }
  return (
    <SectionCard number={1} title="About Me">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="First name" value={value.first_name} onChange={(v) => set('first_name', v)} />
        <Field label="Last name" value={value.last_name} onChange={(v) => set('last_name', v)} />
        <Field label="I like to be known as" value={value.known_as} onChange={(v) => set('known_as', v)} />
        <Field label="My name is pronounced" value={value.name_pronounced} onChange={(v) => set('name_pronounced', v)} />
        <Field label="Date of birth" type="date" value={value.date_of_birth} onChange={(v) => set('date_of_birth', v)} />
        <Field label="Gender identity" value={value.gender_identity} onChange={(v) => set('gender_identity', v)} />
        <Field label="Preferred language" value={value.preferred_language} onChange={(v) => set('preferred_language', v)} />
        <Field
          label="Religious or cultural preferences"
          value={value.religious_cultural}
          onChange={(v) => set('religious_cultural', v)}
        />
      </div>
      <TextAreaField
        label="The most important information to know about me is"
        value={value.important_info}
        onChange={(v) => set('important_info', v)}
        rows={4}
      />
    </SectionCard>
  )
}
