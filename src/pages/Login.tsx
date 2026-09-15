import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSending(true)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    })
    setSending(false)
    if (error) {
      setError(error.message)
      return
    }
    setSent(true)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                <path d="M6 12.5 L10 16.5 L18 7.5" stroke="#F6F3EC" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-serif text-xl font-semibold text-ink">CareCrew</span>
          </div>
          <span className="text-[10px] tracking-wide text-ink-soft/70 uppercase">by Third Act Exchange</span>
        </div>

        <div className="bg-panel border border-line rounded-2xl p-7 shadow-sm">
          {sent ? (
            <div className="text-center">
              <h1 className="font-serif text-xl font-semibold mb-2">Check your email</h1>
              <p className="text-sm text-ink-soft leading-relaxed">
                We sent a sign-in link to <span className="font-medium text-ink">{email}</span>. Open it on this
                device to continue.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-5 text-sm text-accent hover:text-accent-dark underline underline-offset-2"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <h1 className="font-serif text-xl font-semibold mb-1">Welcome</h1>
              <p className="text-sm text-ink-soft mb-6 leading-relaxed">
                One running record of every call, email, and visit with My Aged Care and other providers — shared
                with your family.
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-ink mb-1">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                  />
                </div>
                {error && <p className="text-sm text-warn">{error}</p>}
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full rounded-lg bg-accent text-white text-sm font-medium py-2.5 hover:bg-accent-dark transition-colors disabled:opacity-60"
                >
                  {sending ? 'Sending link…' : 'Send me a sign-in link'}
                </button>
              </form>
              <p className="text-xs text-ink-soft mt-5 leading-relaxed">
                No password needed. We'll email you a secure link — click it on this device to sign in.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
