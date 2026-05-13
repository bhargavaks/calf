'use client'
import React, { useState, useEffect, useRef } from 'react'
import { getSupabase } from '../lib/supabase'

const ANIMALS = [
  { id: 'panda', emoji: '🐼', name: 'Panda' },
  { id: 'fox', emoji: '🦊', name: 'Fox' },
  { id: 'cat', emoji: '🐱', name: 'Cat' },
  { id: 'dog', emoji: '🐶', name: 'Dog' },
  { id: 'bunny', emoji: '🐰', name: 'Bunny' },
  { id: 'bear', emoji: '🐻', name: 'Bear' },
]

const THEMES = [
  { id: 'sage', name: 'Sage', bg: '#e8f0e8', card: '#f4f7f4', accent: '#5a8a5a', text: '#2c4a2c', border: '#b8d4b8', taskBg: '#d4e8d4' },
  { id: 'parchment', name: 'Parchment', bg: '#f5f0e8', card: '#faf7f0', accent: '#8a6a2a', text: '#3a2c10', border: '#d4c4a0', taskBg: '#ede0c0' },
  { id: 'lavender', name: 'Lavender', bg: '#ede8f5', card: '#f5f2fa', accent: '#6a4a8a', text: '#2c1a3a', border: '#c8b8e0', taskBg: '#ddd0f0' },
  { id: 'rose', name: 'Rose', bg: '#f5e8ec', card: '#faf2f4', accent: '#8a3a4a', text: '#3a1a20', border: '#e0b8c0', taskBg: '#f0d0d8' },
  { id: 'sky', name: 'Sky', bg: '#e8f0f8', card: '#f2f6fc', accent: '#2a5a8a', text: '#1a2c3a', border: '#b0cce0', taskBg: '#cce0f4' },
  { id: 'amber', name: 'Amber', bg: '#f8f0e0', card: '#fdf8f0', accent: '#9a6a10', text: '#3a2a08', border: '#e0c880', taskBg: '#f4dea0' },
  { id: 'mint', name: 'Mint', bg: '#e4f5f0', card: '#f0faf8', accent: '#2a7a6a', text: '#0a2a24', border: '#a0d8cc', taskBg: '#c0ecdf' },
  { id: 'slate', name: 'Slate', bg: '#2c3440', card: '#38404e', accent: '#7eb8d4', text: '#d0dce8', border: '#4a5566', taskBg: '#444e5e' },
  { id: 'forest', name: 'Forest', bg: '#1e2c20', card: '#2a3c2c', accent: '#7abf70', text: '#d4ecd0', border: '#3a5240', taskBg: '#344838' },
  { id: 'midnight', name: 'Midnight', bg: '#14182e', card: '#1e2440', accent: '#7a80d4', text: '#c8cce8', border: '#2c3464', taskBg: '#242a4c' },
]

const MAX_DAILY_TASKS = 4
const WILT_DAYS = 2

const LEVELS = [
  { min: 0, name: 'Seedling', emoji: '🌱' },
  { min: 3, name: 'Sprout', emoji: '🌿' },
  { min: 7, name: 'Sapling', emoji: '🪴' },
  { min: 14, name: 'Bloom', emoji: '🌸' },
  { min: 21, name: 'Grove', emoji: '🌳' },
  { min: 30, name: 'Forest', emoji: '🌲' },
]

function getLevel(streak: number) {
  return [...LEVELS].reverse().find(l => streak >= l.min) || LEVELS[0]
}

function getPlantEmoji(streak: number, daysSinceLast: number) {
  if (daysSinceLast > WILT_DAYS + 1) return '🥀'
  if (daysSinceLast === WILT_DAYS + 1) return '🍂'
  if (daysSinceLast === WILT_DAYS) return '🌾'
  return getLevel(streak).emoji
}

export default function Dashboard() {
  const supabase = getSupabase()
  const [user, setUser] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [animal, setAnimal] = useState('panda')
  const [themeId, setThemeId] = useState('sage')
  const [streak, setStreak] = useState(0)
  const [totalDays, setTotalDays] = useState(0)
  const [lastVisit, setLastVisit] = useState<string | null>(null)
  const [completedToday, setCompletedToday] = useState(0)
  const [showLimitCelebration, setShowLimitCelebration] = useState(false)
  const [journalInputs, setJournalInputs] = useState<Record<string, string>>({})
  const [journalErrors, setJournalErrors] = useState<Record<string, boolean>>({})
  const [unlocking, setUnlocking] = useState<string | null>(null)

  const theme = THEMES.find(t => t.id === themeId) || THEMES[0]
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user)
        loadUserData(data.user.id)
      }
    })
  }, [])

  async function loadUserData(uid: string) {
    // Load profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single()

    if (profile) {
      setAnimal(profile.animal || 'panda')
      setThemeId(profile.theme || 'sage')
    }

    // Load streak/visit data
    const { data: visitData } = await supabase
      .from('user_visits')
      .select('*')
      .eq('user_id', uid)
      .single()

    if (visitData) {
      const last = visitData.last_visit
      const daysSinceLast = Math.floor(
        (new Date(today).getTime() - new Date(last).getTime()) / 86400000
      )

      let newStreak = visitData.streak || 0
      let newTotal = visitData.total_days || 0

      if (last !== today) {
        if (daysSinceLast <= WILT_DAYS + 1) {
          newStreak = daysSinceLast === 1 ? newStreak + 1 : Math.max(0, newStreak - (daysSinceLast - 1))
        } else {
          newStreak = 0
        }
        newTotal = newTotal + 1

        await supabase.from('user_visits').update({
          streak: newStreak,
          total_days: newTotal,
          last_visit: today
        }).eq('user_id', uid)
      }

      setStreak(newStreak)
      setTotalDays(newTotal)
      setLastVisit(last)
    } else {
      await supabase.from('user_visits').insert({
        user_id: uid,
        streak: 1,
        total_days: 1,
        last_visit: today
      })
      setStreak(1)
      setTotalDays(1)
    }

    // Load tasks
    const { data: taskData } = await supabase
      .from('recovery_tasks')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: true })

    if (taskData) {
      setTasks(taskData)
      const doneToday = taskData.filter(
        t => t.completed && t.completed_date === today
      ).length
      setCompletedToday(doneToday)
    }
  }

  async function handleCompleteTask(taskId: string) {
    const journal = journalInputs[taskId]?.trim()
    if (!journal || journal.length < 10) {
      setJournalErrors(prev => ({ ...prev, [taskId]: true }))
      return
    }
    if (completedToday >= MAX_DAILY_TASKS) return

    setUnlocking(taskId)
    setTimeout(async () => {
      const { error } = await supabase
        .from('recovery_tasks')
        .update({
          completed: true,
          completed_date: today,
          journal_entry: journal
        })
        .eq('id', taskId)

      if (!error) {
        const newCount = completedToday + 1
        setCompletedToday(newCount)
        setTasks(prev =>
          prev.map(t => t.id === taskId
            ? { ...t, completed: true, completed_date: today, journal_entry: journal }
            : t
          )
        )
        if (newCount >= MAX_DAILY_TASKS) setShowLimitCelebration(true)
      }
      setUnlocking(null)
    }, 600)
  }

  async function saveTheme(newThemeId: string) {
    setThemeId(newThemeId)
    if (user) {
      await supabase.from('profiles').update({ theme: newThemeId }).eq('id', user.id)
    }
  }

  async function saveAnimal(newAnimal: string) {
    setAnimal(newAnimal)
    if (user) {
      await supabase.from('profiles').update({ animal: newAnimal }).eq('id', user.id)
    }
  }

  const daysSinceLast = lastVisit
    ? Math.floor((new Date(today).getTime() - new Date(lastVisit).getTime()) / 86400000)
    : 0

  const plantEmoji = getPlantEmoji(streak, daysSinceLast)
  const level = getLevel(streak)
  const animalObj = ANIMALS.find(a => a.id === animal) || ANIMALS[0]
  const remainingTasks = MAX_DAILY_TASKS - completedToday

  const activeTasks = tasks.filter(t => !t.completed || t.completed_date !== today)
  const completedTodayTasks = tasks.filter(t => t.completed && t.completed_date === today)
  const isLimited = completedToday >= MAX_DAILY_TASKS

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.bg,
      color: theme.text,
      fontFamily: "'Georgia', serif",
      transition: 'background 0.5s ease, color 0.5s ease',
      padding: '0',
    }}>
      {/* Celebration Overlay */}
      {showLimitCelebration && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            background: theme.card,
            borderRadius: '24px',
            padding: '48px',
            textAlign: 'center',
            border: `2px solid ${theme.accent}`,
            maxWidth: '400px',
            boxShadow: `0 0 60px ${theme.accent}40`
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: theme.accent }}>
              Daily Goal Complete!
            </h2>
            <p style={{ opacity: 0.8, marginBottom: '8px', lineHeight: 1.6 }}>
              You've done {MAX_DAILY_TASKS} tasks today. Rest now — recovery is about quality, not quantity.
            </p>
            <p style={{ fontSize: '14px', opacity: 0.6, marginBottom: '24px' }}>
              Come back tomorrow to continue your streak! 🌱
            </p>
            <div style={{
              background: theme.taskBg,
              borderRadius: '12px',
              padding: '12px 20px',
              marginBottom: '24px',
              fontSize: '14px',
              color: theme.accent,
              fontWeight: 'bold'
            }}>
              Streak: {streak} days {plantEmoji} · Level: {level.name}
            </div>
            <button
              onClick={() => setShowLimitCelebration(false)}
              style={{
                background: theme.accent,
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 32px',
                fontSize: '16px',
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              Got it ✓
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        background: theme.card,
        borderBottom: `2px solid ${theme.border}`,
        padding: '20px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'background 0.5s ease, border-color 0.5s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '32px' }}>{animalObj.emoji}</span>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
              {user?.email?.split('@')[0] || 'Friend'}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.65 }}>
              {level.emoji} {level.name} · Day {totalDays} on Calf
            </div>
          </div>
        </div>

        {/* Streak display */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '20px'
        }}>
          <div style={{
            background: theme.taskBg,
            border: `1.5px solid ${theme.border}`,
            borderRadius: '16px',
            padding: '10px 20px',
            textAlign: 'center',
            transition: 'background 0.5s, border-color 0.5s',
          }}>
            <div style={{ fontSize: '28px' }}>{plantEmoji}</div>
            <div style={{ fontWeight: 'bold', fontSize: '15px', color: theme.accent }}>{streak} day streak</div>
            {daysSinceLast === WILT_DAYS && (
              <div style={{ fontSize: '11px', color: '#c0392b', marginTop: '2px' }}>⚠️ Wilting — come back tomorrow!</div>
            )}
          </div>

          <div style={{
            background: theme.taskBg,
            border: `1.5px solid ${theme.border}`,
            borderRadius: '16px',
            padding: '10px 20px',
            textAlign: 'center',
            minWidth: '100px',
            transition: 'background 0.5s, border-color 0.5s',
          }}>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: theme.accent }}>
              {completedToday}/{MAX_DAILY_TASKS}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>tasks today</div>
            {isLimited && <div style={{ fontSize: '11px', color: theme.accent, marginTop: '2px' }}>✅ Done!</div>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Theme Picker — full color blocks */}
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.6, marginBottom: '14px' }}>
            Theme
          </h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => saveTheme(t.id)}
                title={t.name}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  border: themeId === t.id ? `3px solid ${theme.text}` : `3px solid transparent`,
                  background: t.bg,
                  cursor: 'pointer',
                  boxShadow: themeId === t.id
                    ? `0 0 0 3px ${t.accent}, 0 4px 14px ${t.accent}60`
                    : `0 2px 6px rgba(0,0,0,0.15)`,
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  transform: themeId === t.id ? 'scale(1.18)' : 'scale(1)',
                }}
              >
                <div style={{
                  position: 'absolute', inset: '4px',
                  borderRadius: '50%',
                  background: t.accent,
                  opacity: 0.7
                }} />
              </button>
            ))}
          </div>
          <div style={{ marginTop: '8px', fontSize: '13px', opacity: 0.7 }}>
            Active: <strong>{THEMES.find(t => t.id === themeId)?.name}</strong>
          </div>
        </section>

        {/* Avatar Picker */}
        <section style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.6, marginBottom: '14px' }}>
            Your Avatar
          </h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {ANIMALS.map(a => (
              <button
                key={a.id}
                onClick={() => saveAnimal(a.id)}
                style={{
                  fontSize: '28px',
                  padding: '10px 14px',
                  borderRadius: '14px',
                  border: animal === a.id
                    ? `2.5px solid ${theme.accent}`
                    : `2px solid ${theme.border}`,
                  background: animal === a.id ? theme.taskBg : theme.card,
                  cursor: 'pointer',
                  transform: animal === a.id ? 'scale(1.2)' : 'scale(1)',
                  boxShadow: animal === a.id ? `0 4px 16px ${theme.accent}40` : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {a.emoji}
              </button>
            ))}
          </div>
        </section>

        {/* Daily limit banner */}
        {isLimited && (
          <div style={{
            background: theme.taskBg,
            border: `2px solid ${theme.accent}`,
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '28px',
            textAlign: 'center',
            color: theme.accent,
            fontWeight: 'bold',
            fontSize: '15px',
          }}>
            🌟 You've completed your tasks for today. Rest, and come back tomorrow!
            <div style={{ fontWeight: 'normal', fontSize: '13px', marginTop: '6px', opacity: 0.75 }}>
              Consistency beats intensity. See you tomorrow {animalObj.emoji}
            </div>
          </div>
        )}

        {/* Tasks */}
        <section>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold' }}>Today's Recovery Tasks</h2>
            {!isLimited && (
              <span style={{ fontSize: '13px', opacity: 0.65 }}>
                {remainingTasks} task{remainingTasks !== 1 ? 's' : ''} remaining today
              </span>
            )}
          </div>

          {completedTodayTasks.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.5, marginBottom: '10px' }}>
                Completed today ✓
              </div>
              {completedTodayTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  theme={theme}
                  done={true}
                  journalValue={task.journal_entry || ''}
                  onJournalChange={() => {}}
                  onComplete={() => {}}
                  hasError={false}
                  isUnlocking={false}
                  isLimited={true}
                />
              ))}
            </div>
          )}

          {activeTasks.length === 0 && !isLimited && (
            <div style={{
              textAlign: 'center', padding: '48px',
              opacity: 0.5, fontSize: '15px'
            }}>
              No more tasks assigned. You're all caught up! 🌸
            </div>
          )}

          {activeTasks.map((task, i) => (
            <TaskCard
              key={task.id}
              task={task}
              theme={theme}
              done={false}
              journalValue={journalInputs[task.id] || ''}
              onJournalChange={(val) => {
                setJournalInputs(prev => ({ ...prev, [task.id]: val }))
                if (journalErrors[task.id]) {
                  setJournalErrors(prev => ({ ...prev, [task.id]: false }))
                }
              }}
              onComplete={() => handleCompleteTask(task.id)}
              hasError={journalErrors[task.id] || false}
              isUnlocking={unlocking === task.id}
              isLimited={isLimited}
              index={i}
            />
          ))}
        </section>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes checkPop { 0% { transform: scale(0) } 70% { transform: scale(1.2) } 100% { transform: scale(1) } }
        @keyframes wiltShake { 0%,100% { transform: translateX(0) } 20%,60% { transform: translateX(-4px) } 40%,80% { transform: translateX(4px) } }
      `}</style>
    </div>
  )
}

function TaskCard({
  task, theme, done, journalValue, onJournalChange,
  onComplete, hasError, isUnlocking, isLimited, index = 0
}: any) {
  const journalOk = journalValue.trim().length >= 10

  return (
    <div style={{
      background: done ? `${theme.taskBg}80` : theme.card,
      border: `1.5px solid ${done ? theme.border : (hasError ? '#e74c3c' : theme.border)}`,
      borderRadius: '16px',
      padding: '22px 24px',
      marginBottom: '14px',
      opacity: done ? 0.7 : (isLimited && !done ? 0.45 : 1),
      transition: 'all 0.4s ease',
      animation: `slideUp 0.3s ease ${index * 0.05}s both`,
      boxShadow: done ? 'none' : `0 2px 12px ${theme.accent}15`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        {/* Checkbox */}
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px',
          border: `2px solid ${done ? theme.accent : theme.border}`,
          background: done ? theme.accent : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, marginTop: '2px',
          transition: 'all 0.3s ease',
          animation: isUnlocking ? 'checkPop 0.5s ease' : 'none',
        }}>
          {done && <span style={{ color: '#fff', fontSize: '16px' }}>✓</span>}
          {isUnlocking && !done && <span style={{ fontSize: '14px', animation: 'spin 0.5s linear' }}>⟳</span>}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{
            fontWeight: 'bold', fontSize: '16px', marginBottom: '4px',
            textDecoration: done ? 'line-through' : 'none',
            opacity: done ? 0.7 : 1,
          }}>
            {task.title}
          </div>
          {task.description && (
            <div style={{ fontSize: '14px', opacity: 0.65, marginBottom: '12px', lineHeight: 1.5 }}>
              {task.description}
            </div>
          )}

          {/* Journal area — required before completing */}
          {!done && !isLimited && (
            <div style={{ marginTop: '12px' }}>
              <div style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                marginBottom: '8px',
                color: hasError ? '#e74c3c' : theme.accent,
                fontWeight: 'bold',
              }}>
                {hasError ? '⚠ Write a reflection first (min. 10 chars)' : '✍ Reflect before completing'}
              </div>
              <textarea
                value={journalValue}
                onChange={e => onJournalChange(e.target.value)}
                placeholder="How are you feeling about this task? What came up for you?"
                rows={3}
                style={{
                  width: '100%',
                  border: `1.5px solid ${hasError ? '#e74c3c' : theme.border}`,
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  background: theme.bg,
                  color: theme.text,
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = theme.accent}
                onBlur={e => e.target.style.borderColor = hasError ? '#e74c3c' : theme.border}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <span style={{ fontSize: '12px', opacity: 0.5 }}>
                  {journalValue.trim().length}/10 min characters
                </span>
                <button
                  onClick={onComplete}
                  disabled={!journalOk || isUnlocking}
                  style={{
                    background: journalOk ? theme.accent : theme.border,
                    color: journalOk ? '#fff' : theme.text,
                    border: 'none',
                    borderRadius: '10px',
                    padding: '9px 22px',
                    fontSize: '14px',
                    cursor: journalOk ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit',
                    fontWeight: 'bold',
                    transition: 'all 0.2s',
                    opacity: isUnlocking ? 0.6 : 1,
                  }}
                >
                  {isUnlocking ? 'Saving...' : 'Mark Complete ✓'}
                </button>
              </div>
            </div>
          )}

          {done && task.journal_entry && (
            <div style={{
              marginTop: '10px',
              padding: '10px 14px',
              background: theme.bg,
              borderRadius: '10px',
              fontSize: '13px',
              fontStyle: 'italic',
              opacity: 0.7,
              lineHeight: 1.6,
              borderLeft: `3px solid ${theme.accent}`,
            }}>
              "{task.journal_entry}"
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
