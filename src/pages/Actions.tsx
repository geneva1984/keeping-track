import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { assignFollowUp, loadOpenFollowUps, resolveFollowUp } from '../lib/followUps'
import { createTodo, deleteTodo, loadTodos, setTodoDone, updateTodo } from '../lib/todos'
import { loadFamilyMembers } from '../lib/familyMembers'
import { useFamily } from '../context/FamilyContext'
import type { FamilyMemberInfo, OpenFollowUp, Todo, TodoDraft } from '../types'
import AssigneeFilter from '../components/calendar/AssigneeFilter'
import FollowUpItem from '../components/todos/FollowUpItem'
import TodoItem from '../components/todos/TodoItem'
import TodoForm from '../components/todos/TodoForm'
import PageIntro from '../components/PageIntro'

export default function Actions() {
  const { activeFamily } = useFamily()
  const familyId = activeFamily?.familyId
  const [followUps, setFollowUps] = useState<OpenFollowUp[]>([])
  const [todos, setTodos] = useState<Todo[]>([])
  const [members, setMembers] = useState<FamilyMemberInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [assigneeFilter, setAssigneeFilter] = useState<string | 'All' | 'Unassigned'>('All')
  const [showCompleted, setShowCompleted] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)

  const memberByUserId = useMemo(() => {
    const map = new Map<string, FamilyMemberInfo>()
    for (const m of members) map.set(m.userId, m)
    return map
  }, [members])

  const loadAll = useCallback(async () => {
    if (!familyId) return
    setLoading(true)
    try {
      const [fu, td, mems] = await Promise.all([
        loadOpenFollowUps(familyId),
        loadTodos(familyId),
        loadFamilyMembers(familyId),
      ])
      setFollowUps(fu)
      setTodos(td)
      setMembers(mems)
    } catch (err) {
      console.error('Failed to load actions', err)
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
      .channel(`actions:${familyId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'entries', filter: `family_id=eq.${familyId}` }, () => loadAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos', filter: `family_id=eq.${familyId}` }, () => loadAll())
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [familyId, loadAll])

  const visibleTodos = useMemo(() => {
    let list = todos
    if (!showCompleted) list = list.filter((t) => !t.done)
    if (assigneeFilter === 'Unassigned') list = list.filter((t) => !t.assigned_to)
    else if (assigneeFilter !== 'All') list = list.filter((t) => t.assigned_to === assigneeFilter)
    return list
  }, [todos, showCompleted, assigneeFilter])

  async function handleResolveFollowUp(id: string) {
    try {
      await resolveFollowUp(id)
      setFollowUps((prev) => prev.filter((f) => f.id !== id))
    } catch (err) {
      console.error('Failed to resolve follow-up', err)
    }
  }

  async function handleAssignFollowUp(id: string, userId: string) {
    try {
      await assignFollowUp(id, userId || null)
      setFollowUps((prev) => prev.map((f) => (f.id === id ? { ...f, assigned_to: userId || null } : f)))
    } catch (err) {
      console.error('Failed to assign follow-up', err)
    }
  }

  async function handleSaveTodo(draft: TodoDraft) {
    if (!familyId) return
    if (editingTodo) {
      await updateTodo(editingTodo.id, familyId, draft)
    } else {
      await createTodo(familyId, draft)
    }
    setFormOpen(false)
    setEditingTodo(null)
    await loadAll()
  }

  async function handleToggleDone(todo: Todo) {
    try {
      await setTodoDone(todo.id, !todo.done)
      await loadAll()
    } catch (err) {
      console.error('Failed to update to do', err)
    }
  }

  async function handleDeleteTodo(id: string) {
    try {
      await deleteTodo(id)
      await loadAll()
    } catch (err) {
      console.error('Failed to delete to do', err)
    }
  }

  if (!familyId) return null

  return (
    <div className="pb-28">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-5 space-y-6">
        <PageIntro>
          Open follow-ups from the Logbook show up here automatically. Add your own to do items below and assign
          them to anyone in the family.
        </PageIntro>

        {loading ? (
          <p className="text-sm text-ink-soft text-center py-10">Loading…</p>
        ) : (
          <>
            {followUps.length > 0 && (
              <section className="space-y-2.5">
                <h2 className="font-serif text-lg font-semibold">Needs follow-up</h2>
                <p className="text-xs text-ink-soft -mt-1">Pulled automatically from the Logbook.</p>
                <div className="space-y-2.5">
                  {followUps.map((f) => (
                    <FollowUpItem
                      key={f.id}
                      followUp={f}
                      members={members}
                      assignee={f.assigned_to ? memberByUserId.get(f.assigned_to) ?? null : null}
                      onResolve={() => handleResolveFollowUp(f.id)}
                      onAssign={(userId) => handleAssignFollowUp(f.id, userId)}
                    />
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-3">
              <h2 className="font-serif text-lg font-semibold">To do</h2>
              <AssigneeFilter members={members} value={assigneeFilter} onChange={setAssigneeFilter} />
              <button
                onClick={() => setShowCompleted((v) => !v)}
                className="text-xs font-medium text-accent hover:text-accent-dark"
              >
                {showCompleted ? 'Hide completed' : 'Show completed'}
              </button>

              {visibleTodos.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm text-ink-soft">
                    {todos.length === 0 ? 'No to dos yet. Add the first one to get started.' : 'Nothing matches this filter.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {visibleTodos.map((t) => (
                    <TodoItem
                      key={t.id}
                      todo={t}
                      assignee={t.assigned_to ? memberByUserId.get(t.assigned_to) ?? null : null}
                      onToggleDone={() => handleToggleDone(t)}
                      onEdit={() => {
                        setEditingTodo(t)
                        setFormOpen(true)
                      }}
                      onDelete={() => handleDeleteTodo(t.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <button
        onClick={() => {
          setEditingTodo(null)
          setFormOpen(true)
        }}
        className="fixed bottom-6 right-6 sm:right-[calc(50%-21rem)] rounded-full bg-accent text-white shadow-lg w-14 h-14 flex items-center justify-center hover:bg-accent-dark transition-colors"
        aria-label="Add a to do"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
          <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </button>

      {formOpen && (
        <TodoForm
          members={members}
          initial={editingTodo ?? undefined}
          onCancel={() => {
            setFormOpen(false)
            setEditingTodo(null)
          }}
          onSave={handleSaveTodo}
        />
      )}
    </div>
  )
}
