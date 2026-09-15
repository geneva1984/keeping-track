import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useFamily } from '../context/FamilyContext'

export default function Header() {
  const { activeFamily, memberships, setActiveFamilyId } = useFamily()
  const [showCode, setShowCode] = useState(false)
  const [switcherOpen, setSwitcherOpen] = useState(false)

  if (!activeFamily) return null

  return (
    <header className="border-b border-line bg-panel">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 shrink-0 rounded-lg bg-accent flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="none">
              <path d="M6 12.5 L10 16.5 L18 7.5" stroke="#F6F3EC" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="min-w-0 relative">
            <button
              className="font-serif font-semibold text-ink leading-tight truncate block text-left"
              onClick={() => memberships.length > 1 && setSwitcherOpen((v) => !v)}
            >
              {activeFamily.familyName}
              {memberships.length > 1 && <span className="text-ink-soft text-xs ml-1">▾</span>}
            </button>
            <p className="text-[10px] tracking-wide text-ink-soft/70 uppercase truncate">CareCrew by Third Act Exchange</p>
            {switcherOpen && memberships.length > 1 && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-line rounded-lg shadow-md py-1 min-w-[180px] z-20">
                {memberships.map((m) => (
                  <button
                    key={m.familyId}
                    onClick={() => {
                      setActiveFamilyId(m.familyId)
                      setSwitcherOpen(false)
                    }}
                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-accent-soft ${
                      m.familyId === activeFamily.familyId ? 'text-accent font-medium' : 'text-ink'
                    }`}
                  >
                    {m.familyName}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setShowCode(true)}
            className="text-xs font-medium text-accent border border-accent/30 bg-accent-soft rounded-full px-3 py-1.5 hover:bg-accent/15 transition-colors"
          >
            Invite
          </button>
          <a href="#privacy" className="text-xs text-ink-soft hover:text-ink px-1 py-1.5">
            Privacy
          </a>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-xs text-ink-soft hover:text-ink px-2 py-1.5"
          >
            Sign out
          </button>
        </div>
      </div>

      {showCode && (
        <div
          className="fixed inset-0 bg-ink/30 flex items-center justify-center px-6 z-30"
          onClick={() => setShowCode(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-xs w-full text-center shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif font-semibold text-lg mb-1">Invite family</h2>
            <p className="text-sm text-ink-soft mb-4">Share this code so they can join {activeFamily.familyName}'s care log.</p>
            <p className="font-serif text-3xl font-semibold tracking-wide text-accent mb-5">
              {activeFamily.joinCode}
            </p>
            <button
              onClick={() => setShowCode(false)}
              className="w-full rounded-lg bg-accent text-white text-sm font-medium py-2.5 hover:bg-accent-dark transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
