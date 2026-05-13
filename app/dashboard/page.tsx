'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '../lib/supabase'

// ─── Constants ────────────────────────────────────────────────────────────────

const ANIMALS = [
  { id: 'panda',    emoji: '🐼', name: 'Panda',    unlockLevel: 0 },
  { id: 'fox',      emoji: '🦊', name: 'Fox',       unlockLevel: 0 },
  { id: 'cat',      emoji: '🐱', name: 'Cat',       unlockLevel: 0 },
  { id: 'dog',      emoji: '🐶', name: 'Dog',       unlockLevel: 0 },
  { id: 'bunny',    emoji: '🐰', name: 'Bunny',     unlockLevel: 2 },
  { id: 'bear',     emoji: '🐻', name: 'Bear',      unlockLevel: 2 },
  { id: 'koala',    emoji: '🐨', name: 'Koala',     unlockLevel: 3 },
  { id: 'penguin',  emoji: '🐧', name: 'Penguin',   unlockLevel: 3 },
  { id: 'frog',     emoji: '🐸', name: 'Frog',      unlockLevel: 4 },
  { id: 'owl',      emoji: '🦉', name: 'Owl',       unlockLevel: 5 },
  { id: 'deer',     emoji: '🦌', name: 'Deer',      unlockLevel: 5 },
  { id: 'wolf',     emoji: '🐺', name: 'Wolf',      unlockLevel: 6 },
  { id: 'hamster',  emoji: '🐹', name: 'Hamster',   unlockLevel: 7 },
  { id: 'duck',     emoji: '🦆', name: 'Duck',      unlockLevel: 7 },
  { id: 'turtle',   emoji: '🐢', name: 'Turtle',    unlockLevel: 8 },
  { id: 'octopus',  emoji: '🐙', name: 'Octopus',   unlockLevel: 9 },
  { id: 'whale',    emoji: '🐳', name: 'Whale',     unlockLevel: 10 },
  { id: 'elephant', emoji: '🐘', name: 'Elephant',  unlockLevel: 12 },
  { id: 'lion',     emoji: '🦁', name: 'Lion',      unlockLevel: 15 },
]

// Themes: base bg, card bg, ink, accent — fully differentiated per theme
const PRESETS = [
  { id: 'latte',    name: 'Warm Latte',    accent: '#7A6A4A', bg: '#F2EDE3', bg2: '#EAE3D6', card: '#FBF8F2', ink: '#2A2519', unlockLevel: 0 },
  { id: 'sage',     name: 'Sage Garden',   accent: '#4A8A5A', bg: '#EDF4EE', bg2: '#E2EEE4', card: '#F7FBF7', ink: '#1A2E1E', unlockLevel: 0 },
  { id: 'ocean',    name: 'Ocean Calm',    accent: '#2E7BB0', bg: '#EAF2F8', bg2: '#DDF0FA', card: '#F4F9FD', ink: '#0D2233', unlockLevel: 2 },
  { id: 'rose',     name: 'Dusty Rose',    accent: '#AA5A6A', bg: '#F8EFEF', bg2: '#F0E3E4', card: '#FDF7F7', ink: '#2E151A', unlockLevel: 3 },
  { id: 'lavender', name: 'Soft Lavender', accent: '#7A6AAA', bg: '#F0EDF8', bg2: '#E6E0F5', card: '#F8F6FD', ink: '#1E1833', unlockLevel: 4 },
  { id: 'terra',    name: 'Terracotta',    accent: '#C0583A', bg: '#F7EEE8', bg2: '#EFE2D8', card: '#FDF7F4', ink: '#2E1509', unlockLevel: 5 },
  { id: 'midnight', name: 'Midnight',      accent: '#8A7ACA', bg: '#0E0E18', bg2: '#14141F', card: '#1A1A28', ink: '#E8E4F4', unlockLevel: 6 },
  { id: 'forest',   name: 'Forest Night',  accent: '#4ABA7A', bg: '#0C120E', bg2: '#111811', card: '#181F18', ink: '#DDF4E2', unlockLevel: 7 },
  { id: 'amber',    name: 'Golden Amber',  accent: '#D4922A', bg: '#F7F0E2', bg2: '#EEE4CC', card: '#FDF8EE', ink: '#2A1E08', unlockLevel: 8 },
  { id: 'slate',    name: 'Cool Slate',    accent: '#5A8ACC', bg: '#EAEEF5', bg2: '#DDE4F0', card: '#F5F7FC', ink: '#0E1828', unlockLevel: 9 },
  { id: 'obsidian', name: 'Obsidian',      accent: '#E8C547', bg: '#0A0A0A', bg2: '#111111', card: '#181818', ink: '#F0ECD5', unlockLevel: 10 },
  { id: 'blossom',  name: 'Cherry Blossom',accent: '#E8709A', bg: '#FDF0F5', bg2: '#F8E2EC', card: '#FFF7FB', ink: '#2A0D1A', unlockLevel: 12 },
  { id: 'aurora',   name: 'Aurora',        accent: '#50DDB0', bg: '#061218', bg2: '#0A1E1A', card: '#0E2420', ink: '#D4FFF2', unlockLevel: 15 },
]

const DAILY_TASKS = [
  "Drink a full glass of water before your phone",
  "Write 3 sentences in your journal",
  "Take a 10 minute walk outside",
  "Text someone you haven't talked to in a while",
  "Do nothing for 5 minutes. Actually nothing.",
  "Eat something that isn't stress food",
  "Close 5 browser tabs you've been ignoring",
  "Say no to one thing today",
  "Spend 15 mins on something you used to love",
  "Sleep before midnight tonight",
  "Stretch for 5 minutes right now",
  "Put your phone face down for 30 minutes",
]

const JOURNAL_PROMPTS = [
  "What's one thing that felt heavy this week you haven't said out loud?",
  "If your burnout had a colour right now, what would it be and why?",
  "What did you used to do just for fun? When did that change?",
  "Write a letter to yourself from 6 months in the future.",
  "What's something you keep putting off that would take less than 10 minutes?",
  "Who made you feel okay recently? Did you tell them?",
  "What would you tell a friend feeling exactly how you feel right now?",
  "What does rest actually look like for you — not sleep, but real rest?",
]

const GREETINGS = [
  (n: string) => `hey ${n}, your plant missed you 🪴`,
  (n: string) => `${n}! you actually showed up. impressed 👀`,
  (n: string) => `welcome back, ${n}. the couch was worried 🛋️`,
  (n: string) => `${n} has entered the chat 🌿`,
  (n: string) => `okay ${n}, let's see how cooked you are today`,
  (n: string) => `${n}! your streak is watching 🔥`,
  (n: string) => `hey ${n}, zomato called. said you need rest 🍱`,
  (n: string) => `${n}, your burnout score wants a word 👀`,
  (n: string) => `you're back ${n}! journal is dusty tho 📓`,
  (n: string) => `${n} spotted in the wild. doing okay? 🌤️`,
]

const LEVEL_NAMES = [
  'seedling', 'sprout', 'sapling', 'growing', 'blooming',
  'thriving', 'rooted', 'flourishing', 'radiant', 'resilient', 'restored'
]

const plantStages = ['🌱', '🪴', '🌿', '🌳', '🌲']

// xp needed to reach each level
const XP_PER_LEVEL = 100

// ─── Types ────────────────────────────────────────────────────────────────────

type ThemePreset = typeof PRESETS[number]

type Prefs = {
  name: string
  animalId: string
  themeId: string
  customAccent?: string
  streak: number
  lastVisit: string // ISO date string
  totalXp: number
  completedTasksToday: number[]
  taskDate: string
  journalDate: string
  journalWrittenToday: boolean
}

type Result = {
  result_type: string
  exhaustion_score: number
  cognitive_score: number
  worth_score: number
  recovery_score: number
  created_at: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function getLevel(xp: number) {
  return Math.min(Math.floor(xp / XP_PER_LEVEL), LEVEL_NAMES.length - 1)
}

function getLevelProgress(xp: number) {
  return (xp % XP_PER_LEVEL) / XP_PER_LEVEL
}

// Choose 4 tasks deterministically for today based on date
function getTodaysTasks(): { task: string; index: number }[] {
  const d = new Date()
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
  const indices: number[] = []
  let s = seed
  while (indices.length < 4) {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    const idx = Math.abs(s) % DAILY_TASKS.length
    if (!indices.includes(idx)) indices.push(idx)
  }
  return indices.map(i => ({ task: DAILY_TASKS[i], index: i }))
}

// Plant wilt: 0 = full health, 1 = dead
function getWiltLevel(lastVisit: string, streak: number): number {
  if (!lastVisit) return 0.5
  const daysSince = Math.floor((Date.now() - new Date(lastVisit).getTime()) / 86400000)
  if (daysSince <= 0) return 0
  if (daysSince === 1) return 0.15
  if (daysSince === 2) return 0.5
  return Math.min(1, daysSince * 0.33)
}

function getPlantEmoji(streak: number, wilt: number, xp: number): string {
  if (wilt >= 1) return '🥀'
  if (wilt > 0.5) return '🍂'
  const stage = Math.min(Math.floor(xp / 50), 4)
  return plantStages[stage]
}

// ─── Theme Builder ─────────────────────────────────────────────────────────────

type Theme = {
  bg: string; bg2: string; card: string; ink: string; accent: string;
  isDark: boolean; id: string;
}

function buildTheme(preset: ThemePreset, customAccent?: string): Theme {
  const accent = customAccent || preset.accent
  const isDark = parseInt(preset.bg.slice(1, 3), 16) < 128
  return { bg: preset.bg, bg2: preset.bg2, card: preset.card, ink: preset.ink, accent, isDark, id: preset.id }
}

// ─── XP Toast ─────────────────────────────────────────────────────────────────

function XpToast({ xp, onDone }: { xp: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div style={{
      position: 'fixed', bottom: 32, right: 32, zIndex: 1000,
      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
      color: '#1A1000', fontFamily: "'Syne',sans-serif", fontWeight: 700,
      padding: '0.7rem 1.4rem', borderRadius: 100,
      boxShadow: '0 8px 32px rgba(255,180,0,0.4)',
      animation: 'toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
      fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8
    }}>
      ✦ +{xp} XP
    </div>
  )
}

// ─── Level Up Modal ────────────────────────────────────────────────────────────

function LevelUpModal({ level, T, onClose }: { level: number; T: Theme; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 900,
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        background: T.card, borderRadius: 24, padding: '2.5rem',
        textAlign: 'center', maxWidth: 360, width: '90%',
        border: `2px solid ${T.accent}40`,
        boxShadow: `0 0 60px ${T.accent}30`,
        animation: 'fadeUp 0.5s cubic-bezier(0.34,1.56,0.64,1) both'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎉</div>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: T.accent, marginBottom: 8 }}>level up!</div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '2rem', fontWeight: 700, color: T.ink, marginBottom: 6 }}>
          Level {level}
        </div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: '1.1rem', color: `${T.ink}80`, marginBottom: 20 }}>
          {LEVEL_NAMES[Math.min(level, LEVEL_NAMES.length - 1)]}
        </div>
        <p style={{ fontSize: '0.8rem', color: `${T.ink}60`, lineHeight: 1.6, marginBottom: 24 }}>
          new themes and avatars have unlocked. check settings to see what's new.
        </p>
        <button onClick={onClose} style={{
          background: T.ink, color: T.bg, fontFamily: "'Syne',sans-serif",
          fontSize: '0.85rem', fontWeight: 700, padding: '0.7rem 1.8rem',
          border: 'none', borderRadius: 100, cursor: 'pointer'
        }}>
          awesome →
        </button>
      </div>
    </div>
  )
}

// ─── All Tasks Done Screen ─────────────────────────────────────────────────────

function AllDoneScreen({ T, tasks }: { T: Theme; tasks: string[] }) {
  return (
    <div style={{
      background: `${T.accent}08`, border: `1.5px solid ${T.accent}25`,
      borderRadius: 20, padding: '2rem', textAlign: 'center',
      animation: 'fadeUp 0.5s both'
    }}>
      <div style={{ fontSize: '2.8rem', marginBottom: 12 }}>🌟</div>
      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.4rem', fontWeight: 700, color: T.ink, marginBottom: 6 }}>
        that's all for today.
      </div>
      <p style={{ fontSize: '0.83rem', color: `${T.ink}60`, lineHeight: 1.7, marginBottom: 20 }}>
        you crushed all {tasks.length} tasks. your plant is grateful. come back tomorrow for a fresh set.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, fontSize: '1.8rem' }}>
        {plantStages.map((p, i) => (
          <span key={i} style={{ opacity: i <= 3 ? 1 : 0.25, transition: 'all 0.3s', transitionDelay: `${i * 0.1}s` }}>{p}</span>
        ))}
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)
  const [section, setSection] = useState<'home' | 'recovery' | 'journal' | 'calendar' | 'history' | 'settings'>('home')

  // Prefs
  const [prefs, setPrefs] = useState<Prefs | null>(null)
  const [displayName, setDisplayName] = useState('friend')
  const [animal, setAnimal] = useState(ANIMALS[0])
  const [theme, setTheme] = useState<Theme>(buildTheme(PRESETS[1]))
  const [currentThemeId, setCurrentThemeId] = useState('sage')

  // Onboarding
  const [onboarding, setOnboarding] = useState(false)
  const [obName, setObName] = useState('')
  const [obAnimal, setObAnimal] = useState(ANIMALS[0])
  const [obTheme, setObTheme] = useState(PRESETS[1])

  // Progress
  const [streak, setStreak] = useState(1)
  const [totalXp, setTotalXp] = useState(0)
  const [level, setLevel] = useState(0)
  const [wilt, setWilt] = useState(0)
  const [xpToast, setXpToast] = useState<number | null>(null)
  const [levelUpModal, setLevelUpModal] = useState<number | null>(null)

  // Tasks
  const [todaysTasks] = useState(getTodaysTasks)
  const [completedTasks, setCompletedTasks] = useState<number[]>([])
  const [journalWrittenToday, setJournalWrittenToday] = useState(false)
  const [showJournalGate, setShowJournalGate] = useState(false)

  // Journal
  const [journalText, setJournalText] = useState('')
  const [journalSaved, setJournalSaved] = useState(false)

  // Calendar
  const [calMonth, setCalMonth] = useState(new Date())
  const [taskDays, setTaskDays] = useState<Set<string>>(new Set())

  // Settings editing
  const [editName, setEditName] = useState('')

  const todayPrompt = JOURNAL_PROMPTS[new Date().getDay()]

  // ── Init ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      const supabase = getSupabase()
      if (!supabase) { window.location.href = '/auth'; return }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth'; return }
      setUser({ id: user.id, email: user.email || '' })

      const { data } = await supabase.from('users_progress').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setResults(data || [])

      const saved = localStorage.getItem(`calf_prefs_${user.id}`)
      if (saved) {
        const p: Prefs = JSON.parse(saved)
        setPrefs(p)
        setDisplayName(p.name || 'friend')
        setEditName(p.name || 'friend')
        const foundAnimal = ANIMALS.find(a => a.id === p.animalId) || ANIMALS[0]
        setAnimal(foundAnimal)
        const foundTheme = PRESETS.find(t => t.id === p.themeId) || PRESETS[1]
        setTheme(buildTheme(foundTheme, p.customAccent))
        setCurrentThemeId(foundTheme.id)

        // Streak + wilt
        const today = todayStr()
        const lastVisit = p.lastVisit || today
        const daysSince = Math.floor((Date.now() - new Date(lastVisit).getTime()) / 86400000)

        let newStreak = p.streak || 1
        if (daysSince === 0) {
          // same day, no change
        } else if (daysSince === 1) {
          newStreak = (p.streak || 1) + 1
        } else if (daysSince >= 2) {
          // streak broken
          newStreak = 1
        }

        const wiltVal = getWiltLevel(lastVisit, newStreak)
        setWilt(wiltVal)
        setStreak(newStreak)

        const xp = p.totalXp || 0
        setTotalXp(xp)
        setLevel(getLevel(xp))

        // Tasks — reset if new day
        if (p.taskDate === today) {
          setCompletedTasks(p.completedTasksToday || [])
        }

        // Journal
        if (p.journalDate === today && p.journalWrittenToday) {
          setJournalWrittenToday(true)
        }

        // Save updated lastVisit + streak
        if (daysSince > 0) {
          const updated: Prefs = { ...p, streak: newStreak, lastVisit: today }
          localStorage.setItem(`calf_prefs_${user.id}`, JSON.stringify(updated))
        }
      } else {
        setObName(user.email?.split('@')[0] || '')
        setOnboarding(true)
      }

      // Journal text for today
      const jKey = `calf_journal_${user.id}_${todayStr()}`
      const savedJ = localStorage.getItem(jKey)
      if (savedJ) { setJournalText(savedJ); setJournalSaved(true) }

      // Task days for calendar
      const days = JSON.parse(localStorage.getItem(`calf_taskdays_${user.id}`) || '[]') as string[]
      setTaskDays(new Set(days))

      setLoading(false)
    }
    init()
  }, [])

  // ── Save Prefs Helper ──────────────────────────────────────────────────────

  const savePrefs = useCallback((overrides: Partial<Prefs> = {}) => {
    if (!user) return
    const base: Prefs = {
      name: displayName,
      animalId: animal.id,
      themeId: currentThemeId,
      streak,
      lastVisit: todayStr(),
      totalXp,
      completedTasksToday: completedTasks,
      taskDate: todayStr(),
      journalDate: todayStr(),
      journalWrittenToday,
      ...overrides,
    }
    localStorage.setItem(`calf_prefs_${user.id}`, JSON.stringify(base))
  }, [user, displayName, animal, currentThemeId, streak, totalXp, completedTasks, journalWrittenToday])

  // ── XP Award ──────────────────────────────────────────────────────────────

  const awardXp = useCallback((amount: number) => {
    setTotalXp(prev => {
      const prevLevel = getLevel(prev)
      const next = prev + amount
      const nextLevel = getLevel(next)
      if (nextLevel > prevLevel) {
        setLevelUpModal(nextLevel)
      }
      setLevel(nextLevel)
      return next
    })
    setXpToast(amount)
  }, [])

  // ── Onboarding ────────────────────────────────────────────────────────────

  const finishOnboarding = () => {
    const name = obName.trim() || 'friend'
    const t = buildTheme(obTheme)
    setDisplayName(name)
    setEditName(name)
    setAnimal(obAnimal)
    setTheme(t)
    setCurrentThemeId(obTheme.id)
    const p: Prefs = {
      name, animalId: obAnimal.id, themeId: obTheme.id,
      streak: 1, lastVisit: todayStr(), totalXp: 0,
      completedTasksToday: [], taskDate: todayStr(),
      journalDate: todayStr(), journalWrittenToday: false,
    }
    localStorage.setItem(`calf_prefs_${user!.id}`, JSON.stringify(p))
    setStreak(1)
    setOnboarding(false)
  }

  // ── Task Toggle ───────────────────────────────────────────────────────────

  const toggleTask = (taskIndex: number) => {
    if (!journalWrittenToday) {
      setShowJournalGate(true)
      return
    }
    const already = completedTasks.includes(taskIndex)
    const updated = already ? completedTasks.filter(t => t !== taskIndex) : [...completedTasks, taskIndex]
    setCompletedTasks(updated)

    if (!already) {
      awardXp(15)
      // mark calendar
      if (user) {
        const key = `calf_taskdays_${user.id}`
        const today = todayStr()
        const days = JSON.parse(localStorage.getItem(key) || '[]') as string[]
        if (!days.includes(today)) {
          days.push(today)
          localStorage.setItem(key, JSON.stringify(days))
          setTaskDays(new Set(days))
        }
      }
    }

    savePrefs({ completedTasksToday: updated, taskDate: todayStr() })
  }

  // ── Journal Save ──────────────────────────────────────────────────────────

  const saveJournal = () => {
    if (!journalText.trim() || !user) return
    localStorage.setItem(`calf_journal_${user.id}_${todayStr()}`, journalText)
    setJournalSaved(true)
    if (!journalWrittenToday) {
      setJournalWrittenToday(true)
      awardXp(20)
      savePrefs({ journalWrittenToday: true, journalDate: todayStr() })
    }
  }

  const signOut = async () => {
    const supabase = getSupabase()
    if (supabase) await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  const pct = (s: number) => Math.round((s / 6) * 100)

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return {
      firstDay: new Date(year, month, 1).getDay(),
      daysInMonth: new Date(year, month + 1, 0).getDate()
    }
  }
  const assessmentDays = new Set(results.map(r => {
    const d = new Date(r.created_at)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }))

  const T = theme
  const currentLevel = level
  const xpProgress = getLevelProgress(totalXp)
  const plantEmoji = getPlantEmoji(streak, wilt, totalXp)
  const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)](displayName)
  const allDone = completedTasks.length >= todaysTasks.length
  const latest = results[0]
  const { firstDay, daysInMonth } = getDaysInMonth(calMonth)
  const monthName = calMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F2EDE3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600&display=swap');`}</style>
      <p style={{ color: '#4A8A5A', fontStyle: 'italic', fontSize: '0.9rem' }}>loading your space...</p>
    </div>
  )

  // ── Onboarding ────────────────────────────────────────────────────────────

  if (onboarding) {
    const OT = buildTheme(obTheme)
    const isDarkOb = OT.isDark
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Syne:wght@400;500;600;700&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: ${OT.bg}; }
          @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
          .ob-ani { padding:0.5rem; border-radius:12px; cursor:pointer; text-align:center; border:2px solid transparent; transition:all 0.2s; background:${OT.card}; }
          .ob-ani:hover { border-color:${OT.accent}50; }
          .ob-ani.sel { border-color:${OT.accent}; background:${OT.accent}18; }
          .ob-theme { padding:0.6rem 0.4rem; border-radius:12px; cursor:pointer; text-align:center; border:2px solid transparent; transition:all 0.2s; }
          .ob-theme.sel { border-color:${obTheme.accent}; }
        `}</style>
        <div style={{ minHeight: '100vh', background: OT.bg, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: 620, width: '100%', animation: 'fadeUp 0.8s both' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: OT.accent, marginBottom: 10 }}>welcome to calf</div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(2rem,5vw,2.8rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em', color: OT.ink, marginBottom: 6 }}>
              let&apos;s make this <em style={{ color: OT.accent }}>yours.</em>
            </h1>
            <p style={{ fontSize: '0.85rem', color: `${OT.ink}55`, lineHeight: 1.7, marginBottom: 32 }}>30 seconds. three choices.</p>

            <div style={{ marginBottom: 26 }}>
              <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: `${OT.ink}55`, marginBottom: 8 }}>what should we call you?</label>
              <input value={obName} onChange={e => setObName(e.target.value)} placeholder="your name or nickname"
                style={{ width: '100%', padding: '0.85rem 1rem', background: OT.card, border: `1.5px solid ${OT.accent}30`, borderRadius: 12, fontFamily: "'Syne',sans-serif", fontSize: '0.93rem', color: OT.ink, outline: 'none' }} />
            </div>

            <div style={{ marginBottom: 26 }}>
              <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: `${OT.ink}55`, marginBottom: 10 }}>pick your spirit animal</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10,1fr)', gap: 5 }}>
                {ANIMALS.filter(a => a.unlockLevel === 0).map(a => (
                  <button key={a.id} onClick={() => setObAnimal(a)} className={`ob-ani${obAnimal.id === a.id ? ' sel' : ''}`}>
                    <div style={{ fontSize: '1.5rem' }}>{a.emoji}</div>
                    <div style={{ fontSize: '0.52rem', color: OT.ink, opacity: 0.55, marginTop: 2 }}>{a.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <label style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: `${OT.ink}55`, marginBottom: 10 }}>pick your theme</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 7 }}>
                {PRESETS.filter(p => p.unlockLevel === 0).map(p => (
                  <button key={p.id} onClick={() => setObTheme(p)} className={`ob-theme${obTheme.id === p.id ? ' sel' : ''}`}
                    style={{ border: `2px solid ${obTheme.id === p.id ? p.accent : 'transparent'}` }}>
                    <div style={{ width: '100%', aspectRatio: '1', borderRadius: 10, background: p.bg, border: `2px solid ${p.accent}30`, marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', background: p.accent }} />
                    </div>
                    <div style={{ fontSize: '0.5rem', color: OT.ink, opacity: 0.6, lineHeight: 1.3 }}>{p.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={finishOnboarding}
              style={{ width: '100%', padding: '1rem', background: OT.ink, color: OT.bg, fontFamily: "'Syne',sans-serif", fontSize: '0.95rem', fontWeight: 700, border: 'none', borderRadius: 100, cursor: 'pointer' }}>
              take me to my dashboard →
            </button>
          </div>
        </div>
      </>
    )
  }

  // ── Main Dashboard ────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Syne:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${T.bg}; color: ${T.ink}; font-family: 'Syne', sans-serif; transition: background 0.4s, color 0.4s; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: ${T.accent}30; border-radius: 4px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.08); } }
        @keyframes toastIn { from { opacity:0; transform:translateY(20px) scale(0.9); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes shimmer { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
        .nav-item { display:flex; align-items:center; gap:10px; padding:0.65rem 1rem; border-radius:12px; cursor:pointer; font-size:0.82rem; font-weight:500; color:${T.ink}70; border:none; background:transparent; font-family:'Syne',sans-serif; width:100%; text-align:left; transition:all 0.2s; }
        .nav-item:hover { background:${T.accent}18; color:${T.ink}; }
        .nav-item.active { background:${T.accent}22; color:${T.accent}; font-weight:700; }
        .card { background:${T.card}; border-radius:20px; padding:1.5rem; border:1px solid ${T.accent}18; box-shadow:0 2px 16px ${T.ink}06; transition: background 0.4s; }
        .task-row { display:flex; align-items:flex-start; gap:12px; padding:0.85rem 1rem; background:${T.bg2}; border:1px solid ${T.accent}12; border-radius:12px; cursor:pointer; text-align:left; width:100%; font-family:'Syne',sans-serif; font-size:0.83rem; color:${T.ink}; transition:all 0.2s; margin-bottom:8px; }
        .task-row:hover { border-color:${T.accent}35; }
        .task-row.done { opacity:0.42; text-decoration:line-through; }
        .task-row.locked { opacity:0.3; cursor:not-allowed; }
        .cal-day { width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.76rem; position:relative; font-family:'Syne',sans-serif; }
        .cal-day.today { background:${T.accent}; color:white; font-weight:700; }
        .theme-swatch { border-radius:14px; cursor:pointer; border:2px solid transparent; transition:all 0.2s; overflow:hidden; }
        .theme-swatch:hover { transform:translateY(-2px); }
        .theme-swatch.sel { border-color: var(--sw-accent); box-shadow: 0 4px 16px var(--sw-shadow); }
        .lock-badge { position:absolute; top:-4px; right:-4px; background:#999; color:white; border-radius:50%; width:16px; height:16px; font-size:0.5rem; display:flex; align-items:center; justify-content:center; }
        input[type=color] { -webkit-appearance:none; border:none; }
        input[type=color]::-webkit-color-swatch-wrapper { padding:0; }
        input[type=color]::-webkit-color-swatch { border:none; border-radius:6px; }
      `}</style>

      {/* Modals / Toasts */}
      {xpToast !== null && <XpToast xp={xpToast} onDone={() => setXpToast(null)} />}
      {levelUpModal !== null && <LevelUpModal level={levelUpModal} T={T} onClose={() => setLevelUpModal(null)} />}

      {/* Journal Gate Nudge */}
      {showJournalGate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 800, backdropFilter: 'blur(6px)' }}>
          <div style={{ background: T.card, borderRadius: 24, padding: '2rem', maxWidth: 340, width: '90%', textAlign: 'center', border: `1.5px solid ${T.accent}30`, animation: 'fadeUp 0.4s both' }}>
            <div style={{ fontSize: '2.2rem', marginBottom: 12 }}>📓</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.2rem', fontWeight: 700, color: T.ink, marginBottom: 8 }}>journal first.</div>
            <p style={{ fontSize: '0.82rem', color: `${T.ink}60`, lineHeight: 1.65, marginBottom: 20 }}>
              write a few lines in your journal before checking off tasks today. it takes 2 minutes and actually helps.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowJournalGate(false); setSection('journal') }}
                style={{ flex: 1, padding: '0.75rem', background: T.ink, color: T.bg, fontFamily: "'Syne',sans-serif", fontSize: '0.83rem', fontWeight: 700, border: 'none', borderRadius: 100, cursor: 'pointer' }}>
                open journal →
              </button>
              <button onClick={() => setShowJournalGate(false)}
                style={{ padding: '0.75rem 1rem', background: 'transparent', border: `1px solid ${T.accent}30`, borderRadius: 100, cursor: 'pointer', color: `${T.ink}50`, fontFamily: "'Syne',sans-serif", fontSize: '0.8rem' }}>
                later
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', minHeight: '100vh' }}>

        {/* ── Sidebar ── */}
        <div style={{ width: 216, flexShrink: 0, background: T.bg2, borderRight: `1px solid ${T.accent}15`, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50, overflowY: 'auto', transition: 'background 0.4s' }}>
          <a href="/" style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.4rem', fontWeight: 700, fontStyle: 'italic', color: T.ink, textDecoration: 'none', marginBottom: 20, display: 'block', paddingLeft: 6 }}>
            calf<span style={{ color: T.accent }}>.</span>
          </a>

          {/* Avatar card */}
          <div style={{ textAlign: 'center', padding: '1rem', background: T.card, borderRadius: 16, marginBottom: 12, border: `1px solid ${T.accent}15` }}>
            <div style={{ fontSize: '2.6rem', marginBottom: 4, filter: wilt > 0.5 ? 'grayscale(0.6)' : 'none', transition: 'filter 0.5s' }}>{animal.emoji}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: T.ink }}>{displayName}</div>
            <div style={{ fontSize: '0.62rem', color: `${T.ink}45`, marginTop: 2 }}>
              {wilt >= 1 ? '💀 streak broken' : wilt > 0.5 ? '🍂 wilting...' : `🔥 ${streak} day streak`}
            </div>
          </div>

          {/* XP / Level bar */}
          <div style={{ padding: '0.7rem 0.8rem', background: `${T.accent}10`, borderRadius: 12, marginBottom: 12, border: `1px solid ${T.accent}20` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: T.accent, textTransform: 'uppercase', letterSpacing: '0.08em' }}>lv {currentLevel}</span>
              <span style={{ fontSize: '0.6rem', color: `${T.ink}45` }}>{LEVEL_NAMES[Math.min(currentLevel, LEVEL_NAMES.length - 1)]}</span>
            </div>
            <div style={{ height: 4, background: `${T.ink}12`, borderRadius: 100 }}>
              <div style={{ height: '100%', width: `${xpProgress * 100}%`, background: T.accent, borderRadius: 100, transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)' }} />
            </div>
            <div style={{ fontSize: '0.58rem', color: `${T.ink}35`, marginTop: 4, textAlign: 'right' }}>{totalXp % XP_PER_LEVEL}/{XP_PER_LEVEL} xp</div>
          </div>

          {/* Plant */}
          <div style={{ textAlign: 'center', padding: '0.5rem', marginBottom: 16 }}>
            <span style={{ fontSize: '1.7rem', animation: wilt < 0.5 ? 'pulse 3s ease-in-out infinite' : 'shimmer 2s ease-in-out infinite', display: 'inline-block' }}>{plantEmoji}</span>
          </div>

          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { id: 'home',     icon: '🏠', label: 'Home' },
              { id: 'recovery', icon: '🌿', label: 'Recovery' },
              { id: 'journal',  icon: '📓', label: 'Journal' },
              { id: 'calendar', icon: '📅', label: 'Calendar' },
              { id: 'history',  icon: '📊', label: 'History' },
              { id: 'settings', icon: '✦',  label: 'Settings' },
            ].map(item => (
              <button key={item.id} onClick={() => setSection(item.id as typeof section)}
                className={`nav-item${section === item.id ? ' active' : ''}`}>
                <span>{item.icon}</span>{item.label}
              </button>
            ))}
          </nav>

          <button onClick={signOut} style={{ padding: '0.55rem 1rem', background: 'transparent', border: `1px solid ${T.accent}18`, borderRadius: 10, cursor: 'pointer', color: `${T.ink}40`, fontSize: '0.72rem', fontFamily: "'Syne',sans-serif", textAlign: 'left', marginTop: 10 }}>
            sign out
          </button>
        </div>

        {/* ── Main Content ── */}
        <div style={{ marginLeft: 216, flex: 1, padding: '2.5rem', minHeight: '100vh', transition: 'background 0.4s' }}>

          {/* HOME */}
          {section === 'home' && (
            <div style={{ animation: 'fadeUp 0.5s both' }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.accent, marginBottom: 8 }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.8rem,3.5vw,2.4rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em', color: T.ink, marginBottom: 6 }}>
                {greeting}
              </h1>
              <p style={{ fontSize: '0.83rem', color: `${T.ink}45`, marginBottom: 28 }}>
                {!journalWrittenToday && <span style={{ color: T.accent }}>✦ journal first to unlock tasks · </span>}
                {completedTasks.length}/{todaysTasks.length} tasks done today
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
                {latest ? (
                  <div className="card">
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.accent, marginBottom: 10 }}>latest check-in</div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.35rem', fontWeight: 700, color: T.ink, marginBottom: 4, textTransform: 'capitalize' }}>{latest.result_type}</div>
                    <div style={{ fontSize: '0.72rem', color: `${T.ink}40`, marginBottom: 14 }}>{new Date(latest.created_at).toLocaleDateString()}</div>
                    {[['Exhaustion', latest.exhaustion_score, '#C05A3A'], ['Mental', latest.cognitive_score, '#5A9A5A'], ['Self-Worth', latest.worth_score, '#7A6EAA'], ['Recovery', latest.recovery_score, T.accent]].map(([l, s, c]) => (
                      <div key={l as string} style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: `${T.ink}50`, marginBottom: 3 }}>
                          <span>{l as string}</span><span>{pct(s as number)}%</span>
                        </div>
                        <div style={{ height: 5, background: `${T.ink}10`, borderRadius: 100 }}>
                          <div style={{ height: '100%', width: `${pct(s as number)}%`, background: c as string, borderRadius: 100, transition: 'width 0.8s ease' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🌱</div>
                    <p style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.05rem', color: T.ink, marginBottom: 8 }}>no check-ins yet</p>
                    <a href="/assessment" style={{ background: T.ink, color: T.bg, fontFamily: "'Syne',sans-serif", fontSize: '0.82rem', fontWeight: 700, padding: '0.65rem 1.3rem', borderRadius: 100, textDecoration: 'none', display: 'inline-block', marginTop: 4 }}>take assessment →</a>
                  </div>
                )}

                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.accent }}>today&apos;s 4 tasks</div>
                    {!journalWrittenToday && (
                      <button onClick={() => setSection('journal')}
                        style={{ fontSize: '0.65rem', color: T.accent, background: `${T.accent}12`, border: `1px solid ${T.accent}25`, borderRadius: 100, padding: '0.2rem 0.6rem', cursor: 'pointer', fontFamily: "'Syne',sans-serif", fontWeight: 700 }}>
                        write first →
                      </button>
                    )}
                  </div>
                  {allDone ? (
                    <AllDoneScreen T={T} tasks={todaysTasks.map(t => t.task)} />
                  ) : (
                    todaysTasks.map(({ task, index }) => {
                      const done = completedTasks.includes(index)
                      const locked = !journalWrittenToday && !done
                      return (
                        <button key={index} onClick={() => toggleTask(index)}
                          className={`task-row${done ? ' done' : ''}${locked ? ' locked' : ''}`}>
                          <span style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${done ? T.accent : `${T.ink}22`}`, background: done ? T.accent : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'white', marginTop: 1 }}>
                            {done && '✓'}
                          </span>
                          <span style={{ lineHeight: 1.5 }}>{task}</span>
                          {locked && <span style={{ marginLeft: 'auto', fontSize: '0.65rem', opacity: 0.5 }}>🔒</span>}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>

              <a href="/assessment" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: T.ink, color: T.bg, fontFamily: "'Syne',sans-serif", fontSize: '0.85rem', fontWeight: 700, padding: '0.75rem 1.5rem', borderRadius: 100, textDecoration: 'none' }}>
                new check-in →
              </a>
            </div>
          )}

          {/* RECOVERY */}
          {section === 'recovery' && (
            <div style={{ animation: 'fadeUp 0.5s both' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.accent, marginBottom: 8 }}>recovery plan</div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 700, letterSpacing: '-0.03em', color: T.ink, marginBottom: 24 }}>your path back.</h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', gap: 16 }}>
                <div className="card" style={{ gridColumn: 'span 2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: '1.05rem', color: T.ink }}>
                      today&apos;s 4 tasks
                    </div>
                    <div style={{ fontSize: '0.7rem', color: T.accent, fontWeight: 700 }}>{completedTasks.length}/4 done · +15 XP each</div>
                  </div>
                  {!journalWrittenToday && (
                    <div style={{ padding: '0.75rem 1rem', background: `${T.accent}10`, border: `1px solid ${T.accent}25`, borderRadius: 12, marginBottom: 14, fontSize: '0.8rem', color: T.accent, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span>📓</span>
                      <span>journal first to unlock tasks — <button onClick={() => setSection('journal')} style={{ background: 'none', border: 'none', color: T.accent, fontFamily: "'Syne',sans-serif", fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline', padding: 0 }}>write now →</button></span>
                    </div>
                  )}
                  {allDone ? <AllDoneScreen T={T} tasks={todaysTasks.map(t => t.task)} /> : todaysTasks.map(({ task, index }) => {
                    const done = completedTasks.includes(index)
                    const locked = !journalWrittenToday && !done
                    return (
                      <button key={index} onClick={() => toggleTask(index)}
                        className={`task-row${done ? ' done' : ''}${locked ? ' locked' : ''}`}>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${done ? T.accent : `${T.ink}22`}`, background: done ? T.accent : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'white', marginTop: 1 }}>
                          {done && '✓'}
                        </span>
                        <span style={{ lineHeight: 1.5 }}>{task}</span>
                        {locked && <span style={{ marginLeft: 'auto', fontSize: '0.65rem', opacity: 0.5 }}>🔒</span>}
                      </button>
                    )
                  })}
                </div>

                <div className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.accent, marginBottom: 10 }}>recovery plant</div>
                  <div style={{ fontSize: '4rem', margin: '0.8rem 0', display: 'inline-block', animation: wilt < 0.5 ? 'pulse 3s ease-in-out infinite' : 'shimmer 2s ease-in-out infinite', filter: wilt > 0.5 ? 'grayscale(0.5)' : 'none', transition: 'filter 0.5s' }}>{plantEmoji}</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '0.95rem', color: T.ink, marginBottom: 4 }}>
                    {wilt >= 1 ? 'wilted — visit daily to revive' : wilt > 0.5 ? 'needs attention...' : 'thriving 🌱'}
                  </div>
                  <p style={{ fontSize: '0.74rem', color: `${T.ink}45`, lineHeight: 1.6, marginBottom: 14 }}>
                    {wilt < 0.2 ? 'keep it up — visit every day to grow.' : wilt < 0.6 ? 'missed a day. come back tomorrow.' : 'your plant wilted. streak reset — start fresh.'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                    {plantStages.map((p, i) => <span key={i} style={{ fontSize: '1.3rem', opacity: i <= Math.min(Math.floor(totalXp / 50), 4) ? 1 : 0.18 }}>{p}</span>)}
                  </div>
                </div>

                <div className="card">
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.accent, marginBottom: 12 }}>your progress</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '2.2rem', fontWeight: 700, color: T.ink }}>Lv {currentLevel}</span>
                    <span style={{ fontSize: '0.78rem', color: `${T.ink}50`, fontStyle: 'italic' }}>{LEVEL_NAMES[Math.min(currentLevel, LEVEL_NAMES.length - 1)]}</span>
                  </div>
                  <div style={{ height: 6, background: `${T.ink}10`, borderRadius: 100, marginBottom: 6 }}>
                    <div style={{ height: '100%', width: `${xpProgress * 100}%`, background: `linear-gradient(90deg, ${T.accent}, ${T.accent}cc)`, borderRadius: 100, transition: 'width 0.6s ease' }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: `${T.ink}40`, marginBottom: 16 }}>{totalXp % XP_PER_LEVEL} / {XP_PER_LEVEL} XP to next level</div>
                  <div style={{ fontSize: '0.68rem', color: `${T.ink}50`, lineHeight: 1.7 }}>
                    📓 Journal: +20 XP<br />
                    ✓ Task: +15 XP<br />
                    🔥 Streak bonus: +5 XP/day
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* JOURNAL */}
          {section === 'journal' && (
            <div style={{ animation: 'fadeUp 0.5s both' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.accent, marginBottom: 8 }}>daily journal</div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 700, letterSpacing: '-0.03em', color: T.ink, marginBottom: 6 }}>what&apos;s on your mind?</h2>
              <p style={{ fontSize: '0.82rem', color: `${T.ink}45`, marginBottom: 24 }}>
                {journalWrittenToday ? '✦ written today — tasks are unlocked 🔓' : '✦ write first to unlock today\'s tasks'}
              </p>

              <div className="card" style={{ maxWidth: 640 }}>
                <div style={{ background: `${T.accent}08`, border: `1px solid ${T.accent}18`, borderRadius: 12, padding: '0.9rem 1.1rem', marginBottom: 18 }}>
                  <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.accent, marginBottom: 5 }}>today&apos;s prompt</div>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: '0.95rem', color: T.ink, lineHeight: 1.65 }}>{todayPrompt}</p>
                </div>
                <textarea value={journalText} onChange={e => { setJournalText(e.target.value); setJournalSaved(false) }}
                  placeholder="start writing... this is just for you." rows={10}
                  style={{ width: '100%', padding: '1rem', background: T.bg2, border: `1.5px solid ${journalText ? T.accent + '40' : T.accent + '15'}`, borderRadius: 14, fontFamily: "'Syne',sans-serif", fontSize: '0.91rem', color: T.ink, lineHeight: 1.75, outline: 'none', resize: 'none', transition: 'border-color 0.2s' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <span style={{ fontSize: '0.68rem', color: `${T.ink}30` }}>{journalText.length} chars {!journalWrittenToday && journalText.length > 0 && <span style={{ color: T.accent }}>· save to unlock tasks</span>}</span>
                  <button onClick={saveJournal}
                    style={{ background: journalSaved ? `${T.accent}18` : T.ink, color: journalSaved ? T.accent : T.bg, fontFamily: "'Syne',sans-serif", fontSize: '0.8rem', fontWeight: 700, padding: '0.6rem 1.3rem', border: 'none', borderRadius: 100, cursor: 'pointer', transition: 'all 0.2s' }}>
                    {journalSaved ? 'saved ✓' : 'save entry +20 XP'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CALENDAR */}
          {section === 'calendar' && (
            <div style={{ animation: 'fadeUp 0.5s both' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.accent, marginBottom: 8 }}>calendar</div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 700, letterSpacing: '-0.03em', color: T.ink, marginBottom: 24 }}>your recovery journey.</h2>

              <div className="card" style={{ maxWidth: 400 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1))}
                    style={{ background: 'transparent', border: `1px solid ${T.accent}22`, borderRadius: 8, padding: '0.38rem 0.75rem', cursor: 'pointer', color: T.ink, fontFamily: "'Syne',sans-serif", fontSize: '0.82rem' }}>←</button>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: T.ink, fontSize: '1.05rem' }}>{monthName}</div>
                  <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1))}
                    style={{ background: 'transparent', border: `1px solid ${T.accent}22`, borderRadius: 8, padding: '0.38rem 0.75rem', cursor: 'pointer', color: T.ink, fontFamily: "'Syne',sans-serif", fontSize: '0.82rem' }}>→</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 6 }}>
                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: '0.62rem', fontWeight: 700, color: `${T.ink}35`, letterSpacing: '0.04em' }}>{d}</div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const dateKey = `${calMonth.getFullYear()}-${String(calMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                    const isToday = day === new Date().getDate() && calMonth.getMonth() === new Date().getMonth() && calMonth.getFullYear() === new Date().getFullYear()
                    const hasAssessment = assessmentDays.has(dateKey)
                    const hasTask = taskDays.has(dateKey)
                    return (
                      <div key={day} className={`cal-day${isToday ? ' today' : ''}`}
                        style={{ background: isToday ? T.accent : hasTask || hasAssessment ? `${T.accent}12` : 'transparent', color: isToday ? 'white' : T.ink, opacity: hasAssessment || hasTask || isToday ? 1 : 0.35, justifyContent: 'center' }}>
                        {day}
                        {(hasAssessment || hasTask) && !isToday && (
                          <div style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 2 }}>
                            {hasTask && <span style={{ width: 3.5, height: 3.5, borderRadius: '50%', background: T.accent, display: 'block' }} />}
                            {hasAssessment && <span style={{ width: 3.5, height: 3.5, borderRadius: '50%', background: '#C05A3A', display: 'block' }} />}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', gap: 14, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${T.accent}12` }}>
                  {[['tasks done', T.accent], ['check-in', '#C05A3A']].map(([label, color]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.68rem', color: `${T.ink}50` }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'block' }} />{label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* HISTORY */}
          {section === 'history' && (
            <div style={{ animation: 'fadeUp 0.5s both' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.accent, marginBottom: 8 }}>history</div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 700, letterSpacing: '-0.03em', color: T.ink, marginBottom: 24 }}>your journey so far.</h2>
              {results.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                  <p style={{ fontSize: '2rem', marginBottom: 12 }}>🌱</p>
                  <p style={{ fontFamily: "'Playfair Display',serif", color: T.ink, marginBottom: 16 }}>no check-ins yet</p>
                  <a href="/assessment" style={{ background: T.ink, color: T.bg, fontFamily: "'Syne',sans-serif", fontSize: '0.82rem', fontWeight: 700, padding: '0.65rem 1.3rem', borderRadius: 100, textDecoration: 'none', display: 'inline-block' }}>take your first →</a>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 660 }}>
                  {results.map((r, i) => (
                    <div key={i} className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', fontWeight: 700, color: T.ink, textTransform: 'capitalize' }}>{r.result_type}</div>
                        <div style={{ fontSize: '0.7rem', color: `${T.ink}40` }}>{new Date(r.created_at).toLocaleDateString()}</div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                        {[['Exhaustion', r.exhaustion_score], ['Mental', r.cognitive_score], ['Self-Worth', r.worth_score], ['Recovery', r.recovery_score]].map(([label, score]) => (
                          <div key={label as string} style={{ textAlign: 'center', padding: '0.65rem', background: T.bg2, borderRadius: 10 }}>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: T.accent }}>{pct(score as number)}%</p>
                            <p style={{ fontSize: '0.62rem', color: `${T.ink}45`, marginTop: 2 }}>{label as string}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS */}
          {section === 'settings' && (
            <div style={{ animation: 'fadeUp 0.5s both' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.accent, marginBottom: 8 }}>settings</div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 700, letterSpacing: '-0.03em', color: T.ink, marginBottom: 6 }}>make it yours.</h2>
              <p style={{ fontSize: '0.8rem', color: `${T.ink}45`, marginBottom: 28 }}>level up to unlock more themes and avatars. you&apos;re level {currentLevel} — {LEVEL_NAMES[Math.min(currentLevel, LEVEL_NAMES.length - 1)]}.</p>

              <div style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* Name */}
                <div className="card">
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: `${T.ink}50`, marginBottom: 10 }}>display name</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input value={editName} onChange={e => setEditName(e.target.value)}
                      style={{ flex: 1, padding: '0.8rem 1rem', background: T.bg2, border: `1.5px solid ${T.accent}25`, borderRadius: 12, fontFamily: "'Syne',sans-serif", fontSize: '0.9rem', color: T.ink, outline: 'none' }} />
                    <button onClick={() => { setDisplayName(editName); savePrefs({ name: editName }) }}
                      style={{ padding: '0.8rem 1.2rem', background: T.ink, color: T.bg, fontFamily: "'Syne',sans-serif", fontSize: '0.78rem', fontWeight: 700, border: 'none', borderRadius: 12, cursor: 'pointer' }}>save</button>
                  </div>
                </div>

                {/* Avatars */}
                <div className="card">
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: `${T.ink}50`, marginBottom: 10 }}>spirit animal</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10,1fr)', gap: 6 }}>
                    {ANIMALS.map(a => {
                      const locked = a.unlockLevel > currentLevel
                      return (
                        <button key={a.id} onClick={() => { if (locked) return; setAnimal(a); savePrefs({ animalId: a.id }) }}
                          style={{ padding: '0.45rem', borderRadius: 12, cursor: locked ? 'not-allowed' : 'pointer', textAlign: 'center', border: `2px solid ${!locked && animal.id === a.id ? T.accent : 'transparent'}`, background: !locked && animal.id === a.id ? `${T.accent}12` : T.bg2, transition: 'all 0.2s', position: 'relative', opacity: locked ? 0.38 : 1 }}>
                          <div style={{ fontSize: '1.45rem', filter: locked ? 'grayscale(1)' : 'none' }}>{a.emoji}</div>
                          <div style={{ fontSize: '0.48rem', color: T.ink, opacity: 0.5, marginTop: 2 }}>{a.name}</div>
                          {locked && <div className="lock-badge">🔒</div>}
                          {locked && <div style={{ fontSize: '0.45rem', color: T.accent, marginTop: 1 }}>lv{a.unlockLevel}</div>}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Themes */}
                <div className="card">
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: `${T.ink}50`, marginBottom: 12 }}>theme</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
                    {PRESETS.map(p => {
                      const locked = p.unlockLevel > currentLevel
                      const selected = currentThemeId === p.id
                      return (
                        <button key={p.id} onClick={() => {
                          if (locked) return
                          const newTheme = buildTheme(p)
                          setTheme(newTheme)
                          setCurrentThemeId(p.id)
                          savePrefs({ themeId: p.id })
                        }}
                          className={`theme-swatch${selected ? ' sel' : ''}`}
                          // @ts-ignore
                          style={{ '--sw-accent': p.accent, '--sw-shadow': `${p.accent}40`, padding: '0.6rem', border: `2px solid ${selected ? p.accent : 'transparent'}`, opacity: locked ? 0.45 : 1, cursor: locked ? 'not-allowed' : 'pointer', position: 'relative', background: 'transparent' }}>
                          {/* Mini preview */}
                          <div style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 5, border: `1px solid ${p.accent}25` }}>
                            <div style={{ height: 40, background: p.bg, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '4px 6px', gap: 3 }}>
                              <div style={{ height: 3, width: '70%', background: p.accent, borderRadius: 2 }} />
                              <div style={{ height: 2, width: '45%', background: `${p.ink}30`, borderRadius: 2 }} />
                            </div>
                            <div style={{ height: 20, background: p.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.accent }} />
                            </div>
                          </div>
                          <div style={{ fontSize: '0.58rem', color: T.ink, opacity: 0.65, lineHeight: 1.25 }}>{p.name}</div>
                          {locked && (
                            <div style={{ position: 'absolute', top: 4, right: 4, background: '#666', color: 'white', borderRadius: 6, padding: '1px 4px', fontSize: '0.48rem', fontFamily: "'Syne',sans-serif" }}>lv{p.unlockLevel}</div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <label style={{ fontSize: '0.75rem', color: `${T.ink}50` }}>custom accent:</label>
                    <input type="color" value={T.accent} onChange={e => {
                      const newT = { ...T, accent: e.target.value }
                      setTheme(newT)
                      savePrefs({ customAccent: e.target.value })
                    }} style={{ width: 40, height: 32, borderRadius: 8, border: `1.5px solid ${T.accent}30`, cursor: 'pointer', padding: 2, background: T.card }} />
                    <span style={{ fontSize: '0.7rem', color: `${T.ink}40`, fontFamily: 'monospace' }}>{T.accent}</span>
                  </div>
                </div>

                {/* Account */}
                <div className="card">
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: `${T.ink}50`, marginBottom: 8 }}>account</div>
                  <p style={{ fontSize: '0.82rem', color: `${T.ink}50`, marginBottom: 12 }}>{user?.email}</p>
                  <button onClick={signOut} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: `1px solid ${T.accent}25`, borderRadius: 100, cursor: 'pointer', color: `${T.ink}50`, fontSize: '0.78rem', fontFamily: "'Syne',sans-serif" }}>sign out</button>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
