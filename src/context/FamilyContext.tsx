import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import type { FamilyMembership } from '../types'

const ACTIVE_FAMILY_KEY = 'keeping-track:active-family-id'

interface FamilyRow {
  family_id: string
  display_name: string
  families: { name: string; parent_name: string | null; join_code: string } | null
}

interface FamilyContextValue {
  loading: boolean
  memberships: FamilyMembership[]
  activeFamily: FamilyMembership | null
  setActiveFamilyId: (id: string) => void
  refresh: () => Promise<void>
  createFamily: (name: string, parentName: string, displayName: string) => Promise<void>
  joinFamily: (joinCode: string, displayName: string) => Promise<void>
}

const FamilyContext = createContext<FamilyContextValue | null>(null)

export function FamilyProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [memberships, setMemberships] = useState<FamilyMembership[]>([])
  const [activeFamilyId, setActiveFamilyIdState] = useState<string | null>(
    () => localStorage.getItem(ACTIVE_FAMILY_KEY),
  )
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!session) {
      setMemberships([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('family_members')
      .select('family_id, display_name, families(name, parent_name, join_code)')
      .eq('user_id', session.user.id)
      .returns<FamilyRow[]>()

    if (error) {
      console.error('Failed to load families', error)
      setMemberships([])
      setLoading(false)
      return
    }

    const rows: FamilyMembership[] = (data ?? [])
      .filter((r) => r.families)
      .map((r) => ({
        familyId: r.family_id,
        familyName: r.families!.name,
        parentName: r.families!.parent_name,
        joinCode: r.families!.join_code,
        displayName: r.display_name,
      }))
    setMemberships(rows)
    setLoading(false)
  }, [session])

  useEffect(() => {
    refresh()
  }, [refresh])

  const setActiveFamilyId = useCallback((id: string) => {
    localStorage.setItem(ACTIVE_FAMILY_KEY, id)
    setActiveFamilyIdState(id)
  }, [])

  const createFamily = useCallback(
    async (name: string, parentName: string, displayName: string) => {
      const { data, error } = await supabase
        .rpc('create_family', {
          p_name: name,
          p_parent_name: parentName || null,
          p_display_name: displayName,
        })
        .single<{ id: string; join_code: string }>()
      if (error) throw error
      await refresh()
      setActiveFamilyId(data.id)
    },
    [refresh, setActiveFamilyId],
  )

  const joinFamily = useCallback(
    async (joinCode: string, displayName: string) => {
      const { data, error } = await supabase.rpc('join_family', {
        p_join_code: joinCode,
        p_display_name: displayName,
      })
      if (error) throw error
      await refresh()
      setActiveFamilyId(data as string)
    },
    [refresh, setActiveFamilyId],
  )

  const activeFamily = useMemo(() => {
    if (memberships.length === 0) return null
    return memberships.find((m) => m.familyId === activeFamilyId) ?? memberships[0]
  }, [memberships, activeFamilyId])

  const value = useMemo(
    () => ({ loading, memberships, activeFamily, setActiveFamilyId, refresh, createFamily, joinFamily }),
    [loading, memberships, activeFamily, setActiveFamilyId, refresh, createFamily, joinFamily],
  )

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>
}

export function useFamily() {
  const ctx = useContext(FamilyContext)
  if (!ctx) throw new Error('useFamily must be used within FamilyProvider')
  return ctx
}
