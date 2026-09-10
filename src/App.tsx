import { AuthProvider, useAuth } from './context/AuthContext'
import { FamilyProvider, useFamily } from './context/FamilyContext'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Timeline from './pages/Timeline'

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

  if (loading) return <FullScreenLoader />
  if (!activeFamily) return <Onboarding />
  return <Timeline />
}

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-ink-soft">Loading…</p>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}
