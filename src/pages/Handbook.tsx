import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { loadOrCreateHandbook, normalizeHandbook, saveHandbookColumn } from '../lib/handbook'
import { useFamily } from '../context/FamilyContext'
import type { CareHandbook, HandbookColumn } from '../types'
import SectionNav, { type SectionInfo } from '../components/handbook/SectionNav'
import PrintView from '../components/handbook/PrintView'
import PageIntro from '../components/PageIntro'
import AboutSection from '../components/handbook/AboutSection'
import ClinicalSection from '../components/handbook/ClinicalSection'
import EmergencySection from '../components/handbook/EmergencySection'
import CommunicationSection from '../components/handbook/CommunicationSection'
import PersonalCareSection from '../components/handbook/PersonalCareSection'
import MobilitySection from '../components/handbook/MobilitySection'
import WellbeingSection from '../components/handbook/WellbeingSection'
import SupportNetworkSection from '../components/handbook/SupportNetworkSection'
import FamilyFriendsSection from '../components/handbook/FamilyFriendsSection'
import SupportTeamSection from '../components/handbook/SupportTeamSection'
import NotesSection from '../components/handbook/NotesSection'

const SAVE_DEBOUNCE_MS = 700

const SECTIONS: SectionInfo[] = [
  { id: 'about', number: 1, label: 'About Me' },
  { id: 'clinical', number: 2, label: 'Clinical Care' },
  { id: 'emergency', number: 3, label: 'Emergency Details' },
  { id: 'communication', number: 4, label: 'Communication' },
  { id: 'personal_care', number: 5, label: 'Personal Care' },
  { id: 'mobility', number: 6, label: 'Mobility' },
  { id: 'wellbeing', number: 7, label: 'Wellbeing' },
  { id: 'support_network', number: 8, label: 'Support Network' },
  { id: 'family_friends', number: 9, label: 'Family & Friends' },
  { id: 'support_team', number: 10, label: 'Support Team' },
  { id: 'notes', number: 11, label: 'Additional Notes' },
]
type SectionId = (typeof SECTIONS)[number]['id']

const ACTIVE_SECTION_KEY = 'keeping-track:active-handbook-section'

function loadActiveSection(): SectionId {
  const stored = localStorage.getItem(ACTIVE_SECTION_KEY)
  return (SECTIONS.find((s) => s.id === stored)?.id as SectionId) ?? 'about'
}

export default function Handbook() {
  const { activeFamily } = useFamily()
  const familyId = activeFamily?.familyId
  const [handbook, setHandbook] = useState<CareHandbook | null>(null)
  const [loading, setLoading] = useState(true)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [activeSection, setActiveSectionState] = useState<SectionId>(loadActiveSection)
  const timers = useRef<Partial<Record<HandbookColumn, ReturnType<typeof setTimeout>>>>({})

  function setActiveSection(id: SectionId) {
    localStorage.setItem(ACTIVE_SECTION_KEY, id)
    setActiveSectionState(id)
  }

  useEffect(() => {
    if (!familyId) return
    let cancelled = false
    setLoading(true)
    loadOrCreateHandbook(familyId)
      .then((data) => {
        if (!cancelled) setHandbook(data)
      })
      .catch((err) => console.error('Failed to load care handbook', err))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [familyId])

  useEffect(() => {
    if (!familyId) return
    const channel = supabase
      .channel(`care_handbook:${familyId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'care_handbooks', filter: `family_id=eq.${familyId}` },
        (payload) => {
          if (!payload.new) return
          const incoming = normalizeHandbook(payload.new as Record<string, unknown>)
          setHandbook((prev) => {
            if (!prev) return incoming
            // Don't clobber a field the user is mid-edit on (its debounce timer is still pending).
            const merged = { ...incoming } as unknown as Record<string, unknown>
            for (const column of Object.keys(timers.current) as HandbookColumn[]) {
              if (timers.current[column]) {
                merged[column] = (prev as unknown as Record<string, unknown>)[column]
              }
            }
            return merged as unknown as CareHandbook
          })
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [familyId])

  const updateColumn = useCallback(
    <K extends HandbookColumn>(column: K, value: CareHandbook[K]) => {
      setHandbook((prev) => (prev ? { ...prev, [column]: value } : prev))
      const id = handbook?.id
      if (!id) return
      const existingTimer = timers.current[column]
      if (existingTimer) clearTimeout(existingTimer)
      setSaveState('saving')
      timers.current[column] = setTimeout(async () => {
        delete timers.current[column]
        try {
          await saveHandbookColumn(id, column, value)
          setSaveState('saved')
        } catch (err) {
          console.error('Failed to save handbook section', err)
          setSaveState('error')
        }
      }, SAVE_DEBOUNCE_MS)
    },
    [handbook?.id],
  )

  if (loading || !handbook || !familyId) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <p className="text-sm text-ink-soft text-center">Loading handbook…</p>
      </main>
    )
  }

  const data = handbook

  function renderActiveSection() {
    switch (activeSection) {
      case 'about':
        return <AboutSection value={data.about} onChange={(v) => updateColumn('about', v)} />
      case 'clinical':
        return (
          <ClinicalSection
            clinical={data.clinical}
            medications={data.medications}
            onChangeClinical={(v) => updateColumn('clinical', v)}
            onChangeMedications={(v) => updateColumn('medications', v)}
          />
        )
      case 'emergency':
        return <EmergencySection value={data.emergency} onChange={(v) => updateColumn('emergency', v)} />
      case 'communication':
        return <CommunicationSection value={data.communication} onChange={(v) => updateColumn('communication', v)} />
      case 'personal_care':
        return <PersonalCareSection value={data.personal_care} onChange={(v) => updateColumn('personal_care', v)} />
      case 'mobility':
        return <MobilitySection value={data.mobility} onChange={(v) => updateColumn('mobility', v)} />
      case 'wellbeing':
        return <WellbeingSection value={data.wellbeing} onChange={(v) => updateColumn('wellbeing', v)} />
      case 'support_network':
        return <SupportNetworkSection value={data.support_network} onChange={(v) => updateColumn('support_network', v)} />
      case 'family_friends':
        return (
          <FamilyFriendsSection
            familyId={data.family_id}
            value={data.family_friends}
            onChange={(v) => updateColumn('family_friends', v)}
          />
        )
      case 'support_team':
        return <SupportTeamSection value={data.support_team} onChange={(v) => updateColumn('support_team', v)} />
      case 'notes':
        return <NotesSection value={data.additional_notes} onChange={(v) => updateColumn('additional_notes', v)} />
    }
  }

  return (
    <>
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-5 space-y-4 print:hidden">
        <PageIntro>
          Fill in as much as you can — every family member can view and edit any section here, and changes save
          automatically as you go.
        </PageIntro>

        <div className="flex items-center justify-between gap-3 px-1">
          <span className="text-xs text-ink-soft min-w-0 truncate">
            {handbook.updated_by_name ? `Last edited by ${handbook.updated_by_name}` : 'Nobody has edited this yet'}
          </span>
          <span className="text-xs text-ink-soft shrink-0">
            {saveState === 'saving' && 'Saving…'}
            {saveState === 'saved' && 'Saved'}
            {saveState === 'error' && <span className="text-warn">Couldn't save</span>}
          </span>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => window.print()}
            className="shrink-0 text-xs font-medium text-accent border border-accent/30 bg-accent-soft rounded-full px-3 py-1.5 hover:bg-accent/15 transition-colors"
          >
            Export PDF
          </button>
        </div>

        <SectionNav sections={SECTIONS} active={activeSection} onChange={(id) => setActiveSection(id)} />

        {renderActiveSection()}
      </main>

      <div className="hidden print:block">
        <PrintView data={data} />
      </div>
    </>
  )
}
