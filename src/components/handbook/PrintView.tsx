import { useEffect, useState, type ReactNode } from 'react'
import type { CareHandbook, ImportantPerson } from '../../types'
import { getHandbookPhotoUrl } from '../../lib/handbookPhotos'

interface Props {
  data: CareHandbook
}

function isBlank(v: string | null | undefined) {
  return !v || !v.trim()
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (isBlank(value)) return null
  return (
    <div className="mb-2">
      <dt className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">{label}</dt>
      <dd className="text-sm text-neutral-900 whitespace-pre-wrap">{value}</dd>
    </div>
  )
}

function Section({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <section className="break-inside-avoid mb-6">
      <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-300 pb-1 mb-3">
        {String(number).padStart(2, '0')}. {title}
      </h2>
      <dl>{children}</dl>
    </section>
  )
}

function EmptyNote() {
  return <p className="text-sm text-neutral-400 italic">No information recorded.</p>
}

function PersonPhoto({ person }: { person: ImportantPerson }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    if (!person.photo_path) return
    getHandbookPhotoUrl(person.photo_path)
      .then((signed) => {
        if (!cancelled) setUrl(signed)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [person.photo_path])

  if (!person.name && !url) return null
  return (
    <div className="flex flex-col items-center gap-1 w-20">
      <div className="w-16 h-16 rounded-full border border-neutral-300 overflow-hidden bg-neutral-100 flex items-center justify-center">
        {url ? <img src={url} alt={person.name} className="w-full h-full object-cover" /> : null}
      </div>
      <span className="text-xs text-neutral-700 text-center">{person.name}</span>
    </div>
  )
}

export default function PrintView({ data }: Props) {
  const fullName = [data.about.first_name, data.about.last_name].filter(Boolean).join(' ')

  return (
    <div className="text-neutral-900 bg-white p-8 max-w-[210mm] mx-auto">
      <header className="mb-8 border-b-2 border-neutral-800 pb-4">
        <p className="text-[11px] tracking-widest uppercase text-neutral-500">CareCrew by Third Act Exchange</p>
        <h1 className="text-2xl font-bold mt-1">My Care Handbook</h1>
        {fullName && <p className="text-lg text-neutral-700 mt-1">{fullName}</p>}
        <p className="text-xs text-neutral-400 mt-2">Exported {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </header>

      <Section number={1} title="About Me">
        <Field label="First name" value={data.about.first_name} />
        <Field label="Last name" value={data.about.last_name} />
        <Field label="Likes to be known as" value={data.about.known_as} />
        <Field label="Name pronounced" value={data.about.name_pronounced} />
        <Field label="Date of birth" value={data.about.date_of_birth} />
        <Field label="Gender identity" value={data.about.gender_identity} />
        <Field label="Preferred language" value={data.about.preferred_language} />
        <Field label="Religious or cultural preferences" value={data.about.religious_cultural} />
        <Field label="Most important information" value={data.about.important_info} />
        {Object.values(data.about).every(isBlank) && <EmptyNote />}
      </Section>

      <Section number={2} title="Clinical Care">
        <Field label="Blood type" value={data.clinical.blood_type} />
        <Field label="Allergies" value={data.clinical.allergies} />
        <Field label="Health history" value={data.clinical.health_history} />
        <Field label="Other information" value={data.clinical.other_info} />
        {Object.values(data.clinical).every(isBlank) && <EmptyNote />}

        {data.medications.items.length > 0 && (
          <div className="mt-3">
            <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Medication chart</p>
            <table className="w-full text-xs border border-neutral-300 border-collapse">
              <thead>
                <tr className="bg-neutral-100">
                  <th className="border border-neutral-300 px-2 py-1 text-left">Medication</th>
                  <th className="border border-neutral-300 px-2 py-1 text-left">Dosage</th>
                  <th className="border border-neutral-300 px-2 py-1 text-left">Frequency</th>
                  <th className="border border-neutral-300 px-2 py-1 text-left">Time of day</th>
                  <th className="border border-neutral-300 px-2 py-1 text-left">Instructions</th>
                </tr>
              </thead>
              <tbody>
                {data.medications.items.map((m, i) => (
                  <tr key={i}>
                    <td className="border border-neutral-300 px-2 py-1">{m.name}</td>
                    <td className="border border-neutral-300 px-2 py-1">{m.dosage}</td>
                    <td className="border border-neutral-300 px-2 py-1">{m.frequency}</td>
                    <td className="border border-neutral-300 px-2 py-1">{m.time_of_day}</td>
                    <td className="border border-neutral-300 px-2 py-1">{m.instructions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(data.medications.pharmacy || data.medications.last_updated) && (
              <p className="text-xs text-neutral-500 mt-1">
                {data.medications.pharmacy && `Pharmacy: ${data.medications.pharmacy}`}
                {data.medications.pharmacy && data.medications.last_updated && ' · '}
                {data.medications.last_updated && `Last updated: ${data.medications.last_updated}`}
              </p>
            )}
          </div>
        )}
      </Section>

      <Section number={3} title="Emergency Details">
        {(data.emergency.next_of_kin.name || data.emergency.next_of_kin.phone) && (
          <div className="mb-2">
            <dt className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Next of kin</dt>
            <dd className="text-sm text-neutral-900">
              {[data.emergency.next_of_kin.name, data.emergency.next_of_kin.phone, data.emergency.next_of_kin.relationship]
                .filter(Boolean)
                .join(' · ')}
            </dd>
          </div>
        )}
        {(data.emergency.alternative_contact.name || data.emergency.alternative_contact.phone) && (
          <div className="mb-2">
            <dt className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Alternative emergency contact</dt>
            <dd className="text-sm text-neutral-900">
              {[
                data.emergency.alternative_contact.name,
                data.emergency.alternative_contact.phone,
                data.emergency.alternative_contact.relationship,
              ]
                .filter(Boolean)
                .join(' · ')}
            </dd>
          </div>
        )}
        {data.emergency.instructions.filter((i) => !isBlank(i)).length > 0 && (
          <div>
            <dt className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1">
              In an emergency please make sure
            </dt>
            <ol className="list-decimal list-inside text-sm text-neutral-900 space-y-0.5">
              {data.emergency.instructions.filter((i) => !isBlank(i)).map((i, idx) => (
                <li key={idx}>{i}</li>
              ))}
            </ol>
          </div>
        )}
        {isBlank(data.emergency.next_of_kin.name) &&
          isBlank(data.emergency.alternative_contact.name) &&
          data.emergency.instructions.every(isBlank) && <EmptyNote />}
      </Section>

      <Section number={4} title="Communication">
        <Field label="Other languages spoken" value={data.communication.other_languages} />
        <Field label="Interpreter needed" value={data.communication.interpreter_needed} />
        <Field label="How they communicate" value={data.communication.how_i_communicate} />
        <Field label="Communication preferences" value={data.communication.preferences} />
        <Field label="Difficulties" value={data.communication.difficulties} />
        {Object.values(data.communication).every(isBlank) && <EmptyNote />}
      </Section>

      <Section number={5} title="Personal Care">
        <Field label="Activities they can manage" value={data.personal_care.can_manage} />
        <Field label="Activities they need help with" value={data.personal_care.need_help_with} />
        <Field label="Personal care products" value={data.personal_care.products} />
        <Field label="Continence care" value={data.personal_care.continence_care} />
        {Object.values(data.personal_care).every(isBlank) && <EmptyNote />}
      </Section>

      <Section number={6} title="Mobility">
        {data.mobility.aids.length > 0 && (
          <Field
            label="Mobility aids used"
            value={data.mobility.aids.map((a) => (a === 'Other' && data.mobility.aids_other ? data.mobility.aids_other : a)).join(', ')}
          />
        )}
        <Field label="Higher risk of falling when" value={data.mobility.higher_risk_when} />
        <Field label="If they fall" value={data.mobility.if_fall} />
        <Field label="Please assist by" value={data.mobility.assist_by} />
        <Field label="When assisting, remind them to" value={data.mobility.remind_to} />
        {data.mobility.aids.length === 0 &&
          isBlank(data.mobility.higher_risk_when) &&
          isBlank(data.mobility.if_fall) &&
          isBlank(data.mobility.assist_by) &&
          isBlank(data.mobility.remind_to) && <EmptyNote />}
      </Section>

      <Section number={7} title="Wellbeing">
        <Field label="Interests" value={data.wellbeing.interests} />
        <Field label="How they like to spend the day" value={data.wellbeing.spend_day} />
        <Field label="Eating and drinking preferences" value={data.wellbeing.eat_drink} />
        <Field label="May get upset or anxious if" value={data.wellbeing.upset_if} />
        <Field label="Other information" value={data.wellbeing.other_info} />
        {Object.values(data.wellbeing).every(isBlank) && <EmptyNote />}
      </Section>

      <Section number={8} title="Support Network">
        <Field label="Inner circle — people relied on often" value={data.support_network.inner} />
        <Field label="Middle circle — people who help sometimes" value={data.support_network.middle} />
        <Field label="Outer circle — services and organisations" value={data.support_network.outer} />
        <Field label="Important things to know" value={data.support_network.notes} />
        {isBlank(data.support_network.inner) &&
          isBlank(data.support_network.middle) &&
          isBlank(data.support_network.outer) &&
          isBlank(data.support_network.notes) && <EmptyNote />}
      </Section>

      <Section number={9} title="Family and Friends">
        {data.family_friends.consult.filter((c) => !isBlank(c.name)).length > 0 && (
          <div className="mb-3">
            <dt className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1">
              People to consult in decisions
            </dt>
            <ul className="text-sm text-neutral-900 space-y-0.5">
              {data.family_friends.consult
                .filter((c) => !isBlank(c.name))
                .map((c, i) => (
                  <li key={i}>
                    {c.name}
                    {c.when_to_consult && ` — ${c.when_to_consult}`}
                  </li>
                ))}
            </ul>
          </div>
        )}
        {data.family_friends.important_people.some((p) => p.name || p.photo_path) && (
          <div>
            <dt className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-2">People important to them</dt>
            <div className="flex gap-4">
              {data.family_friends.important_people.map((p, i) => (
                <PersonPhoto key={i} person={p} />
              ))}
            </div>
          </div>
        )}
        {data.family_friends.consult.every((c) => isBlank(c.name)) &&
          data.family_friends.important_people.every((p) => !p.name && !p.photo_path) && <EmptyNote />}
      </Section>

      <Section number={10} title="Support Team">
        {(data.support_team.gp.name || data.support_team.gp.phone) && (
          <div className="mb-2">
            <dt className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">GP</dt>
            <dd className="text-sm text-neutral-900">
              {[data.support_team.gp.name, data.support_team.gp.phone, data.support_team.gp.address, data.support_team.gp.email]
                .filter(Boolean)
                .join(' · ')}
            </dd>
          </div>
        )}
        {data.support_team.practitioners.filter((p) => !isBlank(p.name)).length > 0 && (
          <div>
            <dt className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1">Other practitioners</dt>
            <ul className="text-sm text-neutral-900 space-y-0.5">
              {data.support_team.practitioners
                .filter((p) => !isBlank(p.name))
                .map((p, i) => (
                  <li key={i}>{[p.name, p.specialty, p.phone].filter(Boolean).join(' · ')}</li>
                ))}
            </ul>
          </div>
        )}
        {isBlank(data.support_team.gp.name) && data.support_team.practitioners.every((p) => isBlank(p.name)) && <EmptyNote />}
      </Section>

      <Section number={11} title="Additional Notes">
        {isBlank(data.additional_notes) ? <EmptyNote /> : <p className="text-sm whitespace-pre-wrap">{data.additional_notes}</p>}
      </Section>
    </div>
  )
}
