import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useFamily } from '../context/FamilyContext'
import type { Category, Entry, EntryDraft } from '../types'
import Header from '../components/Header'
import CategoryFilter from '../components/CategoryFilter'
import FollowUpBanner from '../components/FollowUpBanner'
import EntryCard from '../components/EntryCard'
import EntryForm from '../components/EntryForm'

export default function Timeline() {
  const { activeFamily } = useFamily()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All')
  const [followUpOnly, setFollowUpOnly] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)

  const familyId = activeFamily?.familyId

  const loadEntries = useCallback(async () => {
    if (!familyId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('family_id', familyId)
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Failed to load entries', error)
    } else {
      setEntries((data ?? []) as Entry[])
    }
    setLoading(false)
  }, [familyId])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  useEffect(() => {
    if (!familyId) return
    const channel = supabase
      .channel(`entries:${familyId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'entries', filter: `family_id=eq.${familyId}` },
        () => loadEntries(),
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [familyId, loadEntries])

  const openFollowUps = useMemo(() => entries.filter((e) => e.follow_up && !e.follow_up_resolved), [entries])

  const visibleEntries = useMemo(() => {
    let list = entries
    if (categoryFilter !== 'All') list = list.filter((e) => e.category === categoryFilter)
    if (followUpOnly) list = list.filter((e) => e.follow_up && !e.follow_up_resolved)
    return list
  }, [entries, categoryFilter, followUpOnly])

  async function handleSave(draft: EntryDraft) {
    if (!familyId) return
    const payload = {
      family_id: familyId,
      entry_date: draft.entry_date,
      category: draft.category,
      contact: draft.contact,
      notes: draft.notes,
      reference_number: draft.reference_number || null,
      follow_up: draft.follow_up || null,
    }
    if (editingEntry) {
      const { error } = await supabase.from('entries').update(payload).eq('id', editingEntry.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('entries').insert(payload)
      if (error) throw error
    }
    setFormOpen(false)
    setEditingEntry(null)
    await loadEntries()
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('entries').delete().eq('id', id)
    if (error) {
      console.error(error)
      return
    }
    await loadEntries()
  }

  async function handleToggleFollowUp(entry: Entry) {
    const { error } = await supabase
      .from('entries')
      .update({ follow_up_resolved: !entry.follow_up_resolved })
      .eq('id', entry.id)
    if (error) {
      console.error(error)
      return
    }
    await loadEntries()
  }

  return (
    <div className="min-h-screen pb-28">
      <Header />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-5 space-y-4">
        {openFollowUps.length > 0 && (
          <FollowUpBanner
            count={openFollowUps.length}
            active={followUpOnly}
            onToggle={() => setFollowUpOnly((v) => !v)}
          />
        )}

        <CategoryFilter value={categoryFilter} onChange={setCategoryFilter} />

        {loading ? (
          <p className="text-sm text-ink-soft text-center py-10">Loading…</p>
        ) : visibleEntries.length === 0 ? (
          <div className="text-center py-14">
            <p className="text-sm text-ink-soft">
              {entries.length === 0
                ? 'No entries yet. Log the first call or visit to get started.'
                : 'Nothing matches this filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleEntries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onEdit={() => {
                  setEditingEntry(entry)
                  setFormOpen(true)
                }}
                onDelete={() => handleDelete(entry.id)}
                onToggleFollowUp={() => handleToggleFollowUp(entry)}
              />
            ))}
          </div>
        )}
      </main>

      <button
        onClick={() => {
          setEditingEntry(null)
          setFormOpen(true)
        }}
        className="fixed bottom-6 right-6 sm:right-[calc(50%-21rem)] rounded-full bg-accent text-white shadow-lg w-14 h-14 flex items-center justify-center hover:bg-accent-dark transition-colors"
        aria-label="Log an interaction"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
          <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </button>

      {formOpen && (
        <EntryForm
          initial={editingEntry ?? undefined}
          onCancel={() => {
            setFormOpen(false)
            setEditingEntry(null)
          }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
