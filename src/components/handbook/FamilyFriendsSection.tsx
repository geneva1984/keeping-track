import { useEffect, useState, type ChangeEvent } from 'react'
import type { ConsultPerson, HandbookFamilyFriends, ImportantPerson } from '../../types'
import { deleteHandbookPhoto, getHandbookPhotoUrl, uploadHandbookPhoto } from '../../lib/handbookPhotos'
import { Field, SectionCard, RepeatingList } from './fields'

interface Props {
  familyId: string
  value: HandbookFamilyFriends
  onChange: (value: HandbookFamilyFriends) => void
}

const emptyConsult = (): ConsultPerson => ({ name: '', when_to_consult: '' })

function PhotoSlot({
  familyId,
  person,
  onChange,
}: {
  familyId: string
  person: ImportantPerson
  onChange: (next: ImportantPerson) => void
}) {
  const [url, setUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!person.photo_path) {
      setUrl(null)
      return
    }
    getHandbookPhotoUrl(person.photo_path)
      .then((signed) => {
        if (!cancelled) setUrl(signed)
      })
      .catch((err) => console.error('Failed to load photo', err))
    return () => {
      cancelled = true
    }
  }, [person.photo_path])

  async function handlePick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo is over the 5MB limit')
      return
    }
    setError(null)
    setBusy(true)
    try {
      const oldPath = person.photo_path
      const newPath = await uploadHandbookPhoto(familyId, file)
      onChange({ ...person, photo_path: newPath })
      if (oldPath) await deleteHandbookPhoto(oldPath)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload photo')
    } finally {
      setBusy(false)
    }
  }

  async function handleRemovePhoto() {
    if (!person.photo_path) return
    setBusy(true)
    try {
      await deleteHandbookPhoto(person.photo_path)
      onChange({ ...person, photo_path: null })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove photo')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24 rounded-full border border-line bg-accent-soft overflow-hidden flex items-center justify-center">
        {url ? (
          <img src={url} alt={person.name || 'Photo'} className="w-full h-full object-cover" />
        ) : (
          <span className="text-ink-soft text-xs">No photo</span>
        )}
        {busy && <div className="absolute inset-0 bg-white/60 flex items-center justify-center text-xs">…</div>}
      </div>
      <div className="flex gap-2 text-xs">
        <label className="text-accent font-medium hover:text-accent-dark cursor-pointer">
          {person.photo_path ? 'Replace' : 'Add photo'}
          <input type="file" accept="image/*" onChange={handlePick} className="hidden" />
        </label>
        {person.photo_path && (
          <button type="button" onClick={handleRemovePhoto} className="text-ink-soft hover:text-warn">
            Remove
          </button>
        )}
      </div>
      <input
        value={person.name}
        onChange={(e) => onChange({ ...person, name: e.target.value })}
        placeholder="Name"
        className="w-full text-center rounded-lg border border-line px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent bg-white"
      />
      {error && <p className="text-xs text-warn text-center">{error}</p>}
    </div>
  )
}

export default function FamilyFriendsSection({ familyId, value, onChange }: Props) {
  function updatePerson(i: number, next: ImportantPerson) {
    onChange({ ...value, important_people: value.important_people.map((p, idx) => (idx === i ? next : p)) })
  }

  return (
    <SectionCard number={9} title="My Family and Friends">
      <div>
        <label className="block text-sm font-medium mb-2">People to consult in decisions</label>
        <RepeatingList
          items={value.consult}
          onChange={(consult) => onChange({ ...value, consult })}
          makeEmpty={emptyConsult}
          addLabel="Add person"
          renderItem={(item, i, update) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Field label="Name" value={item.name} onChange={(v) => update({ name: v })} />
              <Field label="When to consult" value={item.when_to_consult} onChange={(v) => update({ when_to_consult: v })} />
            </div>
          )}
        />
      </div>
      <div className="border-t border-line pt-4">
        <label className="block text-sm font-medium mb-3">People important to me</label>
        <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
          {value.important_people.map((person, i) => (
            <PhotoSlot key={i} familyId={familyId} person={person} onChange={(next) => updatePerson(i, next)} />
          ))}
        </div>
      </div>
    </SectionCard>
  )
}
