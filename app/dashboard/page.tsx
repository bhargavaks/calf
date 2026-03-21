'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ANIMALS = [
  { id: 'panda',    emoji: '🐼', name: 'Panda' },
  { id: 'fox',      emoji: '🦊', name: 'Fox' },
  { id: 'cat',      emoji: '🐱', name: 'Cat' },
  { id: 'dog',      emoji: '🐶', name: 'Dog' },
  { id: 'bunny',    emoji: '🐰', name: 'Bunny' },
  { id: 'bear',     emoji: '🐻', name: 'Bear' },
  { id: 'koala',    emoji: '🐨', name: 'Koala' },
  { id: 'penguin',  emoji: '🐧', name: 'Penguin' },
  { id: 'frog',     emoji: '🐸', name: 'Frog' },
  { id: 'owl',      emoji: '🦉', name: 'Owl' },
  { id: 'deer',     emoji: '🦌', name: 'Deer' },
  { id: 'wolf',     emoji: '🐺', name: 'Wolf' },
  { id: 'hamster',  emoji: '🐹', name: 'Hamster' },
  { id: 'duck',     emoji: '🦆', name: 'Duck' },
  { id: 'turtle',   emoji: '🐢', name: 'Turtle' },
  { id: 'octopus',  emoji: '🐙', name: 'Octopus' },
  { id: 'whale',    emoji: '🐳', name: 'Whale' },
  { id: 'elephant', emoji: '🐘', name: 'Elephant' },
  { id: 'lion',     emoji: '🦁', name: 'Lion' },
  
]

const PRESETS = [
  { id: 'latte',      name: 'Warm Latte',       accent: '#7A6A4A' },
  { id: 'sage',       name: 'Sage Garden',       accent: '#4A8A5A' },
  { id: 'forest',     name: 'Forest Night',      accent: '#3A7A5A' },
  { id: 'ocean',      name: 'Ocean Calm',        accent: '#3A6A9A' },
  { id: 'sky',        name: 'Morning Sky',       accent: '#4A7AAA' },
  { id: 'rose',       name: 'Dusty Rose',        accent: '#AA5A6A' },
  { id: 'lavender',   name: 'Soft Lavender',     accent: '#7A6AAA' },
  { id: 'mauve',      name: 'Warm Mauve',        accent: '#9A6A8A' },
  { id: 'terra',      name: 'Terracotta',        accent: '#AA5A3A' },
  { id: 'amber',      name: 'Golden Amber',      accent: '#AA7A2A' },
  { id: 'moss',       name: 'Deep Moss',         accent: '#5A7A4A' },
  { id: 'teal',       name: 'Calm Teal',         accent: '#3A8A8A' },
  { id: 'slate',      name: 'Cool Slate',        accent: '#4A5A8A' },
  { id: 'blush',      name: 'Soft Blush',        accent: '#C4807A' },
  { id: 'mint',       name: 'Fresh Mint',        accent: '#4A9A7A' },
  { id: 'midnight',   name: 'Midnight',          accent: '#6A5A9A' },
]

const GREETINGS = [
  (n: string) => `hey ${n}, your plant missed you 🪴`,
  (n: string) => `${n}! you actually showed up. impressed 👀`,
  (n: string) => `welcome back, ${n}. the couch was worried 🛋️`,
  (n: string) => `${n} has entered the chat 🌿`,
  (n: string) => `okay ${n}, let's see how cooked you are today`,
  (n: string) => `${n}! your streak is judging you rn 🔥`,
  (n: string) => `hey ${n}, zomato called. said you need rest 🍱`,
  (n: string) => `${n}, your burnout score wants a word 👀`,
  (n: string) => `you're back ${n}! journal is dusty tho 📓`,
  (n: string) => `${n} spotted in the wild. doing okay? 🌤️`,
]

const TASKS = [
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

const plantEmojis = ['🌱', '🪴', '🌿', '🌳', '🌲']

type Result = {
  result_type: string
  exhaustion_score: number
  cognitive_score: number
  worth_score: number
  recovery_score: number
  created_at: string
}

function buildTheme(accent: string, isDark: boolean) {
  return isDark
    ? { bg: '#181C18', bg2: '#1E241E', card: '#222A22', ink: '#EDE8DC', accent, border: `${accent}25` }
    : { bg: '#F5F1EB', bg2: '#EDE8DE', card: '#FFFFFF', ink: '#2A2E24', accent, border: `${accent}25` }
}

export default function Dashboard() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)
  const [section, setSection] = useState<'home' | 'recovery' | 'journal' | 'calendar' | 'history' | 'settings'>('home')

  const [displayName, setDisplayName] = useState('friend')
  const [animal, setAnimal] = useState(ANIMALS[0])
  const [accentColor, setAccentColor] = useState(PRESETS[1].accent)
  const [isDark, setIsDark] = useState(false)
  const [onboarding, setOnboarding] = useState(false)
  const [obName, setObName] = useState('')
  const [obAnimal, setObAnimal] = useState(ANIMALS[0])
  const [obAccent, setObAccent] = useState(PRESETS[1].accent)
  const [obDark, setObDark] = useState(false)

  const [streak, setStreak] = useState(1)
  const [completedTasks, setCompletedTasks] = useState<number[]>([])
  const [plantStage, setPlantStage] = useState(0)
  const [journalText, setJournalText] = useState('')
  const [journalSaved, setJournalSaved] = useState(false)
  const [greeting, setGreeting] = useState('')
  const [calMonth, setCalMonth] = useState(new Date())

  const todayTasks = TASKS.slice(0, 5)
  const todayPrompt = JOURNAL_PROMPTS[new Date().getDay()]

  useEffect(() => {
    const init = async () => {
      if (!supabase) { window.location.href = '/auth'; return }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth'; return }
      setUser({ id: user.id, email: user.email || '' })

      const { data } = await supabase.from('users_progress').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setResults(data || [])

      const saved = localStorage.getItem(`calf_prefs_${user.id}`)
      if (saved) {
        const p = JSON.parse(saved)
        setDisplayName(p.name || 'friend')
        setAnimal(ANIMALS.find(a => a.id === p.animalId) || ANIMALS[0])
        setAccentColor(p.accent || PRESETS[1].accent)
        setIsDark(p.isDark || false)
        setStreak(p.streak || 1)
        setCompletedTasks(p.completedTasks || [])
        setPlantStage(Math.min(Math.floor((p.streak || 1) / 3), 4))
      } else {
        setObName(user.email?.split('@')[0] || '')
        setOnboarding(true)
      }

      const jKey = `calf_journal_${user.id}_${new Date().toDateString()}`
      const savedJ = localStorage.getItem(jKey)
      if (savedJ) { setJournalText(savedJ); setJournalSaved(true) }

      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (displayName) {
      setGreeting(GREETINGS[Math.floor(Math.random() * GREETINGS.length)](displayName))
    }
  }, [displayName])

  const T = buildTheme(accentColor, isDark)

  const savePrefs = (name = displayName, a = animal, acc = accentColor, dark = isDark, tasks = completedTasks, s = streak) => {
    if (!user) return
    localStorage.setItem(`calf_prefs_${user.id}`, JSON.stringify({ name, animalId: a.id, accent: acc, isDark: dark, streak: s, completedTasks: tasks }))
  }

  const finishOnboarding = () => {
    const name = obName.trim() || 'friend'
    setDisplayName(name)
    setAnimal(obAnimal)
    setAccentColor(obAccent)
    setIsDark(obDark)
    savePrefs(name, obAnimal, obAccent, obDark, [], 1)
    setOnboarding(false)
  }

  const toggleTask = (i: number) => {
    const updated = completedTasks.includes(i) ? completedTasks.filter(t => t !== i) : [...completedTasks, i]
    setCompletedTasks(updated)
    setPlantStage(Math.min(Math.floor(updated.length / 2), 4))
    savePrefs(displayName, animal, accentColor, isDark, updated)
  }

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  const pct = (s: number) => Math.round((s / 6) * 100)

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth }
  }

  const assessmentDays = new Set(results.map(r => {
    const d = new Date(r.created_at)
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
  }))

  const taskDays = new Set(
    JSON.parse(localStorage.getItem(`calf_taskdays_${user?.id}`) || '[]') as string[]
  )

  const markTaskDay = () => {
    if (!user) return
    const key = `calf_taskdays_${user.id}`
    const today = `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`
    const days = JSON.parse(localStorage.getItem(key) || '[]') as string[]
    if (!days.includes(today)) {
      days.push(today)
      localStorage.setItem(key, JSON.stringify(days))
    }
  }

  const latest = results[0]

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F5F1EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600&display=swap');`}</style>
      <p style={{ color: '#4A8A5A', fontStyle: 'italic' }}>loading your space...</p>
    </div>
  )

  // ── ONBOARDING ──
  if (onboarding) {
    const OT = buildTheme(obAccent, obDark)
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Syne:wght@400;500;600;700&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { background: ${OT.bg}; font-family: 'Syne', sans-serif; transition: background 0.3s; }
          @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
          .ob-animal { padding: 0.6rem; border-radius: 14px; cursor: pointer; text-align: center; border: 2px solid transparent; transition: all 0.2s; background: ${OT.card}; }
          .ob-animal:hover { border-color: ${OT.accent}60; }
          .ob-animal.sel { border-color: ${OT.accent}; background: ${OT.accent}15; box-shadow: 0 4px 12px ${OT.accent}25; }
          .ob-preset { padding: 0.6rem 0.4rem; border-radius: 12px; cursor: pointer; text-align: center; border: 2px solid transparent; transition: all 0.2s; background: transparent; }
          .ob-preset.sel { border-color: ${obAccent}; box-shadow: 0 4px 12px ${obAccent}30; }
        `}</style>
        <div style={{ minHeight: '100vh', background: OT.bg, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: 600, width: '100%', animation: 'fadeUp 0.8s both' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: OT.accent, marginBottom: 12 }}>welcome to calf</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em', color: OT.ink, marginBottom: 6 }}>
              let&apos;s make this <em style={{ fontStyle: 'italic', color: OT.accent }}>yours.</em>
            </h1>
            <p style={{ fontSize: '0.88rem', color: `${OT.ink}60`, lineHeight: 1.7, marginBottom: 32 }}>Three quick things. Takes 30 seconds.</p>

            {/* Name */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: `${OT.ink}60`, marginBottom: 8 }}>what should we call you?</label>
              <input value={obName} onChange={e => setObName(e.target.value)} placeholder="your name or nickname"
                style={{ width: '100%', padding: '0.85rem 1rem', background: OT.card, border: `1.5px solid ${OT.accent}30`, borderRadius: 12, fontFamily: "'Syne',sans-serif", fontSize: '0.93rem', color: OT.ink, outline: 'none' }} />
            </div>

            {/* Animal */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: `${OT.ink}60`, marginBottom: 10 }}>pick your spirit animal</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 6 }}>
                {ANIMALS.map(a => (
                  <button key={a.id} onClick={() => setObAnimal(a)} className={`ob-animal${obAnimal.id === a.id ? ' sel' : ''}`}>
                    <div style={{ fontSize: '1.6rem' }}>{a.emoji}</div>
                    <div style={{ fontSize: '0.55rem', color: OT.ink, marginTop: 2, opacity: 0.6 }}>{a.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: `${OT.ink}60`, marginBottom: 10 }}>pick your colour</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 8, marginBottom: 14 }}>
                {PRESETS.map(p => (
                  <button key={p.id} onClick={() => setObAccent(p.accent)} className={`ob-preset${obAccent === p.accent ? ' sel' : ''}`}
                    style={{ border: `2px solid ${obAccent === p.accent ? p.accent : 'transparent'}` }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: p.accent, margin: '0 auto 4px' }} />
                    <div style={{ fontSize: '0.55rem', color: OT.ink, opacity: 0.6, lineHeight: 1.2 }}>{p.name}</div>
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ fontSize: '0.72rem', color: `${OT.ink}60` }}>or pick any colour:</label>
                <input type="color" value={obAccent} onChange={e => setObAccent(e.target.value)}
                  style={{ width: 44, height: 36, borderRadius: 8, border: `1.5px solid ${OT.accent}30`, cursor: 'pointer', padding: 2, background: OT.card }} />
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: obAccent, border: `2px solid ${obAccent}40` }} />
              </div>
            </div>

            {/* Dark mode toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
              <label style={{ fontSize: '0.82rem', color: `${OT.ink}70` }}>dark mode</label>
              <button onClick={() => setObDark(!obDark)}
                style={{ width: 44, height: 24, borderRadius: 100, background: obDark ? obAccent : `${OT.ink}20`, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                <span style={{ position: 'absolute', top: 3, left: obDark ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.2s' }} />
              </button>
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

  // ── MAIN DASHBOARD ──
  const { firstDay, daysInMonth } = getDaysInMonth(calMonth)
  const monthName = calMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Syne:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${T.bg}; color: ${T.ink}; font-family: 'Syne', sans-serif; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: ${T.accent}30; border-radius: 4px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.06); } }
        .nav-item { display:flex; align-items:center; gap:10px; padding:0.65rem 1rem; border-radius:12px; cursor:pointer; font-size:0.84rem; font-weight:500; color:${T.ink}80; border:none; background:transparent; font-family:'Syne',sans-serif; width:100%; text-align:left; transition:all 0.2s; }
        .nav-item:hover { background:${T.accent}18; color:${T.ink}; }
        .nav-item.active { background:${T.accent}20; color:${T.accent}; font-weight:600; }
        .card { background:${T.card}; border-radius:20px; padding:1.5rem; border:1px solid ${T.accent}15; box-shadow:0 2px 12px ${T.ink}06; }
        .task-btn { display:flex; align-items:center; gap:12px; padding:0.85rem 1rem; background:${T.bg2}; border:1px solid ${T.accent}15; border-radius:12px; cursor:pointer; text-align:left; width:100%; font-family:'Syne',sans-serif; font-size:0.84rem; color:${T.ink}; transition:all 0.2s; margin-bottom:8px; }
        .task-btn.done { opacity:0.5; text-decoration:line-through; }
        .cal-day { width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.78rem; cursor:default; position:relative; font-family:'Syne',sans-serif; }
        .cal-day.today { background:${T.accent}; color:white; font-weight:700; }
        .cal-day.has-dot { font-weight:600; color:${T.ink}; }
        input[type=color] { -webkit-appearance:none; border:none; } input[type=color]::-webkit-color-swatch-wrapper { padding:0; } input[type=color]::-webkit-color-swatch { border:none; border-radius:6px; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh' }}>

        {/* SIDEBAR */}
        <div style={{ width: 220, flexShrink: 0, background: T.bg2, borderRight: `1px solid ${T.accent}15`, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50, overflowY: 'auto' }}>
          <a href="/" style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.4rem', fontWeight: 700, fontStyle: 'italic', color: T.ink, textDecoration: 'none', marginBottom: 24, display: 'block', paddingLeft: 8 }}>
            calf<span style={{ color: T.accent }}>.</span>
          </a>

          {/* Avatar */}
          <div style={{ textAlign: 'center', padding: '1rem', background: T.card, borderRadius: 16, marginBottom: 16, border: `1px solid ${T.accent}15` }}>
            <div style={{ fontSize: '2.8rem', marginBottom: 4 }}>{animal.emoji}</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: T.ink }}>{displayName}</div>
            <div style={{ fontSize: '0.65rem', color: `${T.ink}50`, marginTop: 2 }}>day {streak} streak 🔥</div>
          </div>

          {/* Plant */}
          <div style={{ textAlign: 'center', padding: '0.6rem', background: `${T.accent}10`, borderRadius: 12, marginBottom: 20, border: `1px solid ${T.accent}20` }}>
            <span style={{ fontSize: '1.6rem', animation: 'pulse 3s ease-in-out infinite', display: 'inline-block' }}>{plantEmojis[plantStage]}</span>
            <div style={{ fontSize: '0.62rem', color: T.accent, marginTop: 2 }}>stage {plantStage + 1}/5</div>
          </div>

          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
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

          <button onClick={signOut} style={{ padding: '0.6rem 1rem', background: 'transparent', border: `1px solid ${T.accent}20`, borderRadius: 10, cursor: 'pointer', color: `${T.ink}50`, fontSize: '0.75rem', fontFamily: "'Syne',sans-serif", textAlign: 'left', marginTop: 12 }}>
            sign out
          </button>
        </div>

        {/* MAIN */}
        <div style={{ marginLeft: 220, flex: 1, padding: '2.5rem', minHeight: '100vh', overflowY: 'auto' }}>

          {/* HOME */}
          {section === 'home' && (
            <div style={{ animation: 'fadeUp 0.6s both' }}>
              <p style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.accent, marginBottom: 8 }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.8rem,3.5vw,2.5rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em', color: T.ink, marginBottom: 6 }}>
                {greeting}
              </h1>
              <p style={{ fontSize: '0.85rem', color: `${T.ink}50`, marginBottom: 32 }}>
                {completedTasks.length} of {todayTasks.length} tasks done today
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
                {latest ? (
                  <div className="card">
                    <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.accent, marginBottom: 10 }}>latest check-in</div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.4rem', fontWeight: 700, color: T.ink, marginBottom: 4, textTransform: 'capitalize' }}>{latest.result_type}</div>
                    <div style={{ fontSize: '0.75rem', color: `${T.ink}45`, marginBottom: 14 }}>{new Date(latest.created_at).toLocaleDateString()}</div>
                    {[['Exhaustion', latest.exhaustion_score, '#B5654A'], ['Mental', latest.cognitive_score, '#7A9E5A'], ['Self-Worth', latest.worth_score, '#7A6EAA'], ['Recovery', latest.recovery_score, T.accent]].map(([l, s, c]) => (
                      <div key={l as string} style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: `${T.ink}55`, marginBottom: 3 }}>
                          <span>{l as string}</span><span>{pct(s as number)}%</span>
                        </div>
                        <div style={{ height: 5, background: `${T.ink}10`, borderRadius: 100 }}>
                          <div style={{ height: '100%', width: `${pct(s as number)}%`, background: c as string, borderRadius: 100 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🌱</div>
                    <p style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', color: T.ink, marginBottom: 8 }}>no check-ins yet</p>
                    <a href="/assessment" style={{ background: T.ink, color: T.bg, fontFamily: "'Syne',sans-serif", fontSize: '0.83rem', fontWeight: 700, padding: '0.65rem 1.4rem', borderRadius: 100, textDecoration: 'none', display: 'inline-block', marginTop: 8 }}>take assessment →</a>
                  </div>
                )}

                <div className="card">
                  <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.accent, marginBottom: 10 }}>today&apos;s tasks</div>
                  {todayTasks.map((task, i) => (
                    <button key={i} onClick={() => { toggleTask(i); markTaskDay() }} className={`task-btn${completedTasks.includes(i) ? ' done' : ''}`}>
                      <span style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${completedTasks.includes(i) ? T.accent : `${T.ink}25`}`, background: completedTasks.includes(i) ? T.accent : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'white' }}>
                        {completedTasks.includes(i) && '✓'}
                      </span>
                      {task}
                    </button>
                  ))}
                  {completedTasks.length >= todayTasks.length && (
                    <div style={{ textAlign: 'center', padding: '0.7rem', background: `${T.accent}10`, borderRadius: 10, fontSize: '0.8rem', color: T.accent, fontWeight: 600, marginTop: 4 }}>
                      all done 🎉 your plant grew!
                    </div>
                  )}
                </div>
              </div>

              <a href="/assessment" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: T.ink, color: T.bg, fontFamily: "'Syne',sans-serif", fontSize: '0.86rem', fontWeight: 700, padding: '0.75rem 1.6rem', borderRadius: 100, textDecoration: 'none' }}>
                new check-in →
              </a>
            </div>
          )}

          {/* RECOVERY */}
          {section === 'recovery' && (
            <div style={{ animation: 'fadeUp 0.6s both' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.accent, marginBottom: 8 }}>recovery plan</div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 700, letterSpacing: '-0.03em', color: T.ink, marginBottom: 24 }}>your path back.</h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', gap: 16 }}>
                <div className="card" style={{ gridColumn: 'span 2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: '1.05rem', color: T.ink }}>daily recovery tasks</div>
                    <div style={{ fontSize: '0.72rem', color: T.accent, fontWeight: 600 }}>{completedTasks.length}/{TASKS.length} done</div>
                  </div>
                  {TASKS.map((task, i) => (
                    <button key={i} onClick={() => { toggleTask(i); markTaskDay() }} className={`task-btn${completedTasks.includes(i) ? ' done' : ''}`}>
                      <span style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${completedTasks.includes(i) ? T.accent : `${T.ink}25`}`, background: completedTasks.includes(i) ? T.accent : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'white' }}>
                        {completedTasks.includes(i) && '✓'}
                      </span>
                      {task}
                    </button>
                  ))}
                </div>

                <div className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.accent, marginBottom: 10 }}>recovery plant</div>
                  <div style={{ fontSize: '4rem', margin: '1rem 0', animation: 'pulse 3s ease-in-out infinite', display: 'inline-block' }}>{plantEmojis[plantStage]}</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1rem', color: T.ink, marginBottom: 6 }}>stage {plantStage + 1} of 5</div>
                  <p style={{ fontSize: '0.76rem', color: `${T.ink}50`, lineHeight: 1.6, marginBottom: 14 }}>complete tasks to grow it. miss days and it wilts.</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                    {plantEmojis.map((p, i) => <span key={i} style={{ fontSize: '1.3rem', opacity: i <= plantStage ? 1 : 0.2 }}>{p}</span>)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* JOURNAL */}
          {section === 'journal' && (
            <div style={{ animation: 'fadeUp 0.6s both' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.accent, marginBottom: 8 }}>daily journal</div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 700, letterSpacing: '-0.03em', color: T.ink, marginBottom: 6 }}>what&apos;s on your mind?</h2>
              <p style={{ fontSize: '0.83rem', color: `${T.ink}50`, marginBottom: 24 }}>a new prompt every day.</p>

              <div className="card" style={{ maxWidth: 640 }}>
                <div style={{ background: `${T.accent}08`, border: `1px solid ${T.accent}20`, borderRadius: 12, padding: '0.9rem 1.1rem', marginBottom: 18 }}>
                  <div style={{ fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.accent, marginBottom: 5 }}>today&apos;s prompt</div>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: '0.97rem', color: T.ink, lineHeight: 1.65 }}>{todayPrompt}</p>
                </div>
                <textarea value={journalText} onChange={e => { setJournalText(e.target.value); setJournalSaved(false) }}
                  placeholder="start writing... this is just for you." rows={10}
                  style={{ width: '100%', padding: '1rem', background: T.bg2, border: `1.5px solid ${journalText ? T.accent + '40' : T.accent + '15'}`, borderRadius: 14, fontFamily: "'Syne',sans-serif", fontSize: '0.92rem', color: T.ink, lineHeight: 1.75, outline: 'none', resize: 'none' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <span style={{ fontSize: '0.7rem', color: `${T.ink}35` }}>{journalText.length} chars</span>
                  <button onClick={() => {
                    if (!journalText.trim()) return
                    localStorage.setItem(`calf_journal_${user?.id}_${new Date().toDateString()}`, journalText)
                    setJournalSaved(true)
                    markTaskDay()
                  }} style={{ background: journalSaved ? `${T.accent}15` : T.ink, color: journalSaved ? T.accent : T.bg, fontFamily: "'Syne',sans-serif", fontSize: '0.8rem', fontWeight: 700, padding: '0.6rem 1.3rem', border: 'none', borderRadius: 100, cursor: 'pointer' }}>
                    {journalSaved ? 'saved ✓' : 'save entry'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CALENDAR */}
          {section === 'calendar' && (
            <div style={{ animation: 'fadeUp 0.6s both' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.accent, marginBottom: 8 }}>calendar</div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 700, letterSpacing: '-0.03em', color: T.ink, marginBottom: 24 }}>your recovery journey.</h2>

              <div className="card" style={{ maxWidth: 420 }}>
                {/* Month nav */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1))}
                    style={{ background: 'transparent', border: `1px solid ${T.accent}25`, borderRadius: 8, padding: '0.4rem 0.8rem', cursor: 'pointer', color: T.ink, fontFamily: "'Syne',sans-serif", fontSize: '0.82rem' }}>←</button>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, color: T.ink, fontSize: '1.1rem' }}>{monthName}</div>
                  <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1))}
                    style={{ background: 'transparent', border: `1px solid ${T.accent}25`, borderRadius: 8, padding: '0.4rem 0.8rem', cursor: 'pointer', color: T.ink, fontFamily: "'Syne',sans-serif", fontSize: '0.82rem' }}>→</button>
                </div>

                {/* Day labels */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 8 }}>
                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 600, color: `${T.ink}40`, letterSpacing: '0.05em' }}>{d}</div>
                  ))}
                </div>

                {/* Days */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const dateKey = `${calMonth.getFullYear()}-${calMonth.getMonth()}-${day}`
                    const isToday = day === new Date().getDate() && calMonth.getMonth() === new Date().getMonth() && calMonth.getFullYear() === new Date().getFullYear()
                    const hasAssessment = assessmentDays.has(dateKey)
                    const hasTask = taskDays.has(dateKey)
                    return (
                      <div key={day} className={`cal-day${isToday ? ' today' : ''}`}
                        style={{ background: isToday ? T.accent : 'transparent', color: isToday ? 'white' : T.ink, opacity: hasAssessment || hasTask || isToday ? 1 : 0.4 }}>
                        {day}
                        {(hasAssessment || hasTask) && !isToday && (
                          <div style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 2 }}>
                            {hasTask && <span style={{ width: 4, height: 4, borderRadius: '50%', background: T.accent, display: 'block' }} />}
                            {hasAssessment && <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#B5654A', display: 'block' }} />}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.accent}15` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: `${T.ink}60` }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.accent, display: 'block' }} />tasks done
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: `${T.ink}60` }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#B5654A', display: 'block' }} />check-in
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: `${T.ink}60` }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: T.accent, display: 'block' }} />today
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* HISTORY */}
          {section === 'history' && (
            <div style={{ animation: 'fadeUp 0.6s both' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.accent, marginBottom: 8 }}>history</div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 700, letterSpacing: '-0.03em', color: T.ink, marginBottom: 24 }}>your journey so far.</h2>
              {results.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                  <p style={{ fontSize: '2rem', marginBottom: 12 }}>🌱</p>
                  <p style={{ fontFamily: "'Playfair Display',serif", color: T.ink, marginBottom: 16 }}>no check-ins yet</p>
                  <a href="/assessment" style={{ background: T.ink, color: T.bg, fontFamily: "'Syne',sans-serif", fontSize: '0.83rem', fontWeight: 700, padding: '0.65rem 1.4rem', borderRadius: 100, textDecoration: 'none', display: 'inline-block' }}>take your first →</a>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 680 }}>
                  {results.map((r, i) => (
                    <div key={i} className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.1rem', fontWeight: 700, color: T.ink, textTransform: 'capitalize' }}>{r.result_type}</div>
                        <div style={{ fontSize: '0.72rem', color: `${T.ink}45` }}>{new Date(r.created_at).toLocaleDateString()}</div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                        {[['Exhaustion', r.exhaustion_score], ['Mental', r.cognitive_score], ['Self-Worth', r.worth_score], ['Recovery', r.recovery_score]].map(([label, score]) => (
                          <div key={label as string} style={{ textAlign: 'center', padding: '0.7rem', background: T.bg2, borderRadius: 10 }}>
                            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: T.accent }}>{pct(score as number)}%</p>
                            <p style={{ fontSize: '0.65rem', color: `${T.ink}50`, marginTop: 2 }}>{label as string}</p>
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
            <div style={{ animation: 'fadeUp 0.6s both' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.accent, marginBottom: 8 }}>settings</div>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 700, letterSpacing: '-0.03em', color: T.ink, marginBottom: 24 }}>make it yours.</h2>

              <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* Name */}
                <div className="card">
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: `${T.ink}55`, marginBottom: 10 }}>display name</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                      style={{ flex: 1, padding: '0.8rem 1rem', background: T.bg2, border: `1.5px solid ${T.accent}25`, borderRadius: 12, fontFamily: "'Syne',sans-serif", fontSize: '0.9rem', color: T.ink, outline: 'none' }} />
                    <button onClick={() => savePrefs()} style={{ padding: '0.8rem 1.3rem', background: T.ink, color: T.bg, fontFamily: "'Syne',sans-serif", fontSize: '0.8rem', fontWeight: 700, border: 'none', borderRadius: 12, cursor: 'pointer' }}>save</button>
                  </div>
                </div>

                {/* Animal */}
                <div className="card">
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: `${T.ink}55`, marginBottom: 10 }}>spirit animal</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10,1fr)', gap: 6 }}>
                    {ANIMALS.map(a => (
                      <button key={a.id} onClick={() => { setAnimal(a); savePrefs(displayName, a) }}
                        style={{ padding: '0.5rem', borderRadius: 12, cursor: 'pointer', textAlign: 'center', border: `2px solid ${animal.id === a.id ? T.accent : 'transparent'}`, background: animal.id === a.id ? `${T.accent}12` : T.bg2, transition: 'all 0.2s' }}>
                        <div style={{ fontSize: '1.5rem' }}>{a.emoji}</div>
                        <div style={{ fontSize: '0.5rem', color: T.ink, opacity: 0.5, marginTop: 2 }}>{a.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color */}
                <div className="card">
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: `${T.ink}55`, marginBottom: 12 }}>accent colour</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 8, marginBottom: 14 }}>
                    {PRESETS.map(p => (
                      <button key={p.id} onClick={() => { setAccentColor(p.accent); savePrefs(displayName, animal, p.accent) }}
                        style={{ padding: '0.6rem 0.4rem', borderRadius: 12, cursor: 'pointer', textAlign: 'center', border: `2px solid ${accentColor === p.accent ? p.accent : 'transparent'}`, background: 'transparent', transition: 'all 0.2s' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: p.accent, margin: '0 auto 4px' }} />
                        <div style={{ fontSize: '0.55rem', color: T.ink, opacity: 0.6, lineHeight: 1.2 }}>{p.name}</div>
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <label style={{ fontSize: '0.75rem', color: `${T.ink}55` }}>custom colour:</label>
                    <input type="color" value={accentColor} onChange={e => { setAccentColor(e.target.value); savePrefs(displayName, animal, e.target.value) }}
                      style={{ width: 44, height: 36, borderRadius: 8, border: `1.5px solid ${T.accent}30`, cursor: 'pointer', padding: 2, background: T.card }} />
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: accentColor, border: `2px solid ${accentColor}40` }} />
                    <span style={{ fontSize: '0.72rem', color: `${T.ink}50`, fontFamily: 'monospace' }}>{accentColor}</span>
                  </div>
                </div>

                {/* Dark mode */}
                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: `${T.ink}55`, marginBottom: 4 }}>dark mode</div>
                      <div style={{ fontSize: '0.8rem', color: `${T.ink}50` }}>{isDark ? 'on — midnight vibes' : 'off — bright & warm'}</div>
                    </div>
                    <button onClick={() => { const d = !isDark; setIsDark(d); savePrefs(displayName, animal, accentColor, d) }}
                      style={{ width: 48, height: 26, borderRadius: 100, background: isDark ? T.accent : `${T.ink}20`, border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                      <span style={{ position: 'absolute', top: 4, left: isDark ? 26 : 4, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.2s', display: 'block' }} />
                    </button>
                  </div>
                </div>

                {/* Account */}
                <div className="card">
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: `${T.ink}55`, marginBottom: 8 }}>account</div>
                  <p style={{ fontSize: '0.83rem', color: `${T.ink}55`, marginBottom: 12 }}>{user?.email}</p>
                  <button onClick={signOut} style={{ padding: '0.65rem 1.3rem', background: 'transparent', border: `1px solid ${T.accent}30`, borderRadius: 100, cursor: 'pointer', color: `${T.ink}60`, fontSize: '0.8rem', fontFamily: "'Syne',sans-serif" }}>sign out</button>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
