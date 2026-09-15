import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { createAppointment, deleteAppointment, loadAppointments, updateAppointment } from '../lib/appointments'
import { loadFamilyMembers } from '../lib/familyMembers'
import { useFamily } from '../context/FamilyContext'
import type { Appointment, AppointmentDraft, FamilyMemberInfo } from '../types'
import AssigneeFilter from '../components/calendar/AssigneeFilter'
import AppointmentCard from '../components/calendar/AppointmentCard'
import AppointmentForm from '../components/calendar/AppointmentForm'
import PageIntro from '../components/PageIntro'

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function dateKey(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDateHeading(iso: string) {
  const d = new Date(iso)
  const day = new Date(d)
  day.setHours(0, 0, 0, 0)
  const today = startOfToday()
  const diffDays = Math.round((day.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  return d.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function CalendarPage() {
  const { activeFamily } = useFamily()
  const familyId = activeFamily?.familyId
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [members, setMembers] = useState<FamilyMemberInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [assigneeFilter, setAssigneeFilter] = useState<string | 'All' | 'Unassigned'>('All')
  const [showPast, setShowPast] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)

  const memberByUserId = useMemo(() => {
    const map = new Map<string, FamilyMemberInfo>()
    for (const m of members) map.set(m.userId, m)
    return map
  }, [members])

  const loadAll = useCallback(async () => {
    if (!familyId) return
    setLoading(true)
    try {
      const [appts, mems] = await Promise.all([loadAppointments(familyId), loadFamilyMembers(familyId)])
      setAppointments(appts)
      setMembers(mems)
    } catch (err) {
      console.error('Failed to load calendar', err)
    } finally {
      setLoading(false)
    }
  }, [familyId])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  useEffect(() => {
    if (!familyId) return
    const channel = supabase
      .channel(`appointments:${familyId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments', filter: `family_id=eq.${familyId}` },
        () => loadAll(),
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [familyId, loadAll])

  const visibleAppointments = useMemo(() => {
    const cutoff = startOfToday().getTime()
    let list = appointments
    if (!showPast) list = list.filter((a) => new Date(a.start_at).getTime() >= cutoff)
    if (assigneeFilter === 'Unassigned') list = list.filter((a) => !a.assigned_to)
    else if (assigneeFilter !== 'All') list = list.filter((a) => a.assigned_to === assigneeFilter)
    return list
  }, [appointments, showPast, assigneeFilter])

  const groups = useMemo(() => {
    const map = new Map<string, Appointment[]>()
    for (const a of visibleAppointments) {
      const key = dateKey(a.start_at)
      const existing = map.get(key)
      if (existing) existing.push(a)
      else map.set(key, [a])
    }
    return Array.from(map.entries())
  }, [visibleAppointments])

  async function handleSave(draft: AppointmentDraft) {
    if (!familyId) return
    if (editingAppointment) {
      await updateAppointment(editingAppointment.id, familyId, draft)
    } else {
      await createAppointment(familyId, draft)
    }
    setFormOpen(false)
    setEditingAppointment(null)
    await loadAll()
  }

  async function handleDelete(id: string) {
    try {
      await deleteAppointment(id)
      await loadAll()
    } catch (err) {
      console.error('Failed to delete appointment', err)
    }
  }

  if (!familyId) return null

  return (
    <div className="pb-28">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-5 space-y-4">
        <PageIntro>
          Add appointments and assign whoever's taking the lead — everyone in the family sees the same
          colour-coded calendar.
        </PageIntro>

        <AssigneeFilter members={members} value={assigneeFilter} onChange={setAssigneeFilter} />

        <button
          onClick={() => setShowPast((v) => !v)}
          className="text-xs font-medium text-accent hover:text-accent-dark"
        >
          {showPast ? 'Hide past appointments' : 'Show past appointments'}
        </button>

        {loading ? (
          <p className="text-sm text-ink-soft text-center py-10">Loading…</p>
        ) : groups.length === 0 ? (
          <div className="text-center py-14">
            <p className="text-sm text-ink-soft">
              {appointments.length === 0 ? 'No appointments yet. Add the first one to get started.' : 'Nothing matches this filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {groups.map(([key, items]) => (
              <div key={key}>
                <h3 className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2 px-1">
                  {formatDateHeading(items[0].start_at)}
                </h3>
                <div className="space-y-2.5">
                  {items.map((a) => (
                    <AppointmentCard
                      key={a.id}
                      appointment={a}
                      assignee={a.assigned_to ? memberByUserId.get(a.assigned_to) ?? null : null}
                      onEdit={() => {
                        setEditingAppointment(a)
                        setFormOpen(true)
                      }}
                      onDelete={() => handleDelete(a.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <button
        onClick={() => {
          setEditingAppointment(null)
          setFormOpen(true)
        }}
        className="fixed bottom-6 right-6 sm:right-[calc(50%-21rem)] rounded-full bg-accent text-white shadow-lg w-14 h-14 flex items-center justify-center hover:bg-accent-dark transition-colors"
        aria-label="Add an appointment"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
          <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </button>

      {formOpen && (
        <AppointmentForm
          members={members}
          initial={editingAppointment ?? undefined}
          onCancel={() => {
            setFormOpen(false)
            setEditingAppointment(null)
          }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
