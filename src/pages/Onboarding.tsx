import { useState, type FormEvent } from 'react'
import { useFamily } from '../context/FamilyContext'
import { supabase } from '../lib/supabase'

type Mode = 'choose' | 'create' | 'join'

export default function Onboarding() {
  const { createFamily, joinFamily } = useFamily()
  const [mode, setMode] = useState<Mode>('choose')
  const [displayName, setDisplayName] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await createFamily(recipientName.trim(), recipientName.trim(), displayName.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await joinFamily(joinCode.trim(), displayName.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That code didn\'t match a family log')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="bg-panel border border-line rounded-2xl p-7 shadow-sm">
          {mode === 'choose' && (
            <>
              <h1 className="font-serif text-xl font-semibold mb-1">Get started</h1>
              <p className="text-sm text-ink-soft mb-6 leading-relaxed">
                Create a new family log, or join one your family already started.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => setMode('create')}
                  className="w-full rounded-lg bg-accent text-white text-sm font-medium py-2.5 hover:bg-accent-dark transition-colors"
                >
                  Create a new family log
                </button>
                <button
                  onClick={() => setMode('join')}
                  className="w-full rounded-lg border border-line bg-white text-ink text-sm font-medium py-2.5 hover:bg-accent-soft transition-colors"
                >
                  Join with a code
                </button>
              </div>
              <button
                className="mt-5 text-xs text-ink-soft underline underline-offset-2"
                onClick={() => supabase.auth.signOut()}
              >
                Sign out
              </button>
            </>
          )}

          {mode === 'create' && (
            <>
              <button onClick={() => setMode('choose')} className="text-xs text-ink-soft mb-4 hover:text-ink">
                ← Back
              </button>
              <h1 className="font-serif text-xl font-semibold mb-1">Create a family log</h1>
              <p className="text-sm text-ink-soft mb-4 leading-relaxed">
                You'll get a short code afterwards to invite the rest of the family.
              </p>
              <div className="rounded-lg bg-gold-soft border border-gold/30 px-3.5 py-3 mb-5">
                <p className="text-xs text-ink leading-relaxed">
                  <strong>This is an early test version of CareCrew.</strong> We're still finalising our data
                  security and privacy practices, so please use placeholder names and general descriptions rather
                  than real medical, financial, or identifying details about your parents for now — data may be
                  reset or removed as we continue building. By continuing, you understand this is a test build and
                  agree not to enter real sensitive information about your parents at this stage.
                </p>
              </div>
              <form onSubmit={handleCreate} className="space-y-3">
                <Field label="Your name" value={displayName} onChange={setDisplayName} placeholder="e.g. Sam" required />
                <Field
                  label="Who is this log for?"
                  value={recipientName}
                  onChange={setRecipientName}
                  placeholder="e.g. Margaret"
                  required
                />
                {error && <p className="text-sm text-warn">{error}</p>}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-lg bg-accent text-white text-sm font-medium py-2.5 hover:bg-accent-dark transition-colors disabled:opacity-60"
                >
                  {busy ? 'Creating…' : 'Create log'}
                </button>
              </form>
            </>
          )}

          {mode === 'join' && (
            <>
              <button onClick={() => setMode('choose')} className="text-xs text-ink-soft mb-4 hover:text-ink">
                ← Back
              </button>
              <h1 className="font-serif text-xl font-semibold mb-1">Join a family log</h1>
              <p className="text-sm text-ink-soft mb-5 leading-relaxed">
                Ask whoever set it up for the share code.
              </p>
              <form onSubmit={handleJoin} className="space-y-3">
                <Field label="Your name" value={displayName} onChange={setDisplayName} placeholder="e.g. Sam" required />
                <Field
                  label="Share code"
                  value={joinCode}
                  onChange={(v) => setJoinCode(v.toUpperCase())}
                  placeholder="ABC-123"
                  required
                />
                {error && <p className="text-sm text-warn">{error}</p>}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-lg bg-accent text-white text-sm font-medium py-2.5 hover:bg-accent-dark transition-colors disabled:opacity-60"
                >
                  {busy ? 'Joining…' : 'Join log'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1">{label}</label>
      <input
        type="text"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
      />
    </div>
  )
}
