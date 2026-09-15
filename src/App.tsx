import { useEffect, useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { FamilyProvider, useFamily } from './context/FamilyContext'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Timeline from './pages/Timeline'
import Handbook from './pages/Handbook'
import CalendarPage from './pages/Calendar'
import Actions from './pages/Actions'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Header from './components/Header'
import TabNav, { VIEWS, type View } from './components/TabNav'

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

const ACTIVE_VIEW_KEY = 'keeping-track:active-view'

function loadActiveView(): View {
  const stored = localStorage.getItem(ACTIVE_VIEW_KEY)
  return (VIEWS.find((v) => v === stored) as View) ?? 'handbook'
}

function Gate() {
  const { session, loading: authLoading } = useAuth()

  if (authLoading) return <FullScreenLoader />
  if (!session) return <Login />

  return (
    <FamilyProvider>
      <FamilyGate />
    </FamilyProvider>
  )
}

function FamilyGate() {
  const { loading, activeFamily } = useFamily()
  const [view, setViewState] = useState<View>(loadActiveView)

  function setView(next: View) {
    localStorage.setItem(ACTIVE_VIEW_KEY, next)
    setViewState(next)
  }

  if (loading) return <FullScreenLoader />
  if (!activeFamily) return <Onboarding />

  return (
    <div className="min-h-screen">
      <div className="print:hidden">
        <Header />
        <TabNav value={view} onChange={setView} />
      </div>
      {view === 'timeline' && <Timeline />}
      {view === 'handbook' && <Handbook />}
      {view === 'calendar' && <CalendarPage />}
      {view === 'actions' && <Actions />}
    </div>
  )
}

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-ink-soft">Loading…</p>
    </div>
  )
}

export default function App() {
  const hash = useHashRoute()
  if (hash === '#privacy') return <PrivacyPolicy />

  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}
