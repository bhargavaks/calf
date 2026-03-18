'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const THEMES = [
  { id: 'latte',   name: 'Warm Latte',      bg: '#F5F0E8', bg2: '#EDE8DC', ink: '#2E3528', accent: '#4A8A5A', card: '#FFFFFF' },
  { id: 'forest',  name: 'Midnight Forest', bg: '#1A2018', bg2: '#1F261D', ink: '#EDE8DC', accent: '#8BB48C', card: '#222A20' },
  { id: 'ocean',   name: 'Ocean Calm',      bg: '#EEF4F8', bg2: '#E0ECF4', ink: '#1A2A38', accent: '#3A7A9A', card: '#FFFFFF' },
  { id: 'rose',    name: 'Dusty Rose',      bg: '#F8F0EE', bg2: '#F0E4E0', ink: '#3A2020', accent: '#A85A5A', card: '#FFFFFF' },
  { id: 'lavender',name: 'Soft Lavender',   bg: '#F2F0F8', bg2: '#E8E4F4', ink: '#28243A', accent: '#7A6AAA', card: '#FFFFFF' },
  { id: 'sand',    name: 'Desert Sand',     bg: '#F8F4EC', bg2: '#EEE8D8', ink: '#3A2E18', accent: '#AA8844', card: '#FFFFFF' },
  { id: 'sage',    name: 'Sage Garden',     bg: '#EEF2EC', bg2: '#E2EAE0', ink: '#1E2A1E', accent: '#5A8A5A', card: '#FFFFFF' },
  { id: 'slate',   name: 'Cool Slate',      bg: '#EEF0F4', bg2: '#E4E8F0', ink: '#1E2030', accent: '#4A5A8A', card: '#FFFFFF' },
]

const GREETINGS = [
  (name: string) => `hey ${name}, your plant missed you 🪴`,
  (name: string) => `${name}! you actually showed up. we're impressed 👀`,
  (name: string) => `welcome back, ${name}. the couch was worried 🛋️`,
  (name: string) => `${name} has entered the chat 🌿`,
  (name: string) => `okay ${name}, let's see how cooked you are today`,
  (name: string) => `${name}! your recovery streak is judging you rn 🔥`,
  (name: string) => `hey ${name}, zomato called. said you need to eat and rest 🍱`,
  (name: string) => `${name}, your burnout score wants a word 👀`,
  (name: string) => `you're back ${name}! your journal is gathering dust tho 📓`,
  (name: string) => `${name} spotted in the wild. doing okay? 🌤️`,
]

const TASKS = [
  "Drink a full glass of water before checking your phone",
  "Write 3 sentences in your journal today",
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
  "What's one thing that felt heavy this week that you haven't said out loud yet?",
  "If your burnout had a colour right now, what would it be and why?",
  "What did you used to do just for fun? When did that change?",
  "Write a letter to yourself from 6 months in the future.",
  "What's something you keep putting off that would actually take less than 10 minutes?",
  "Who made you feel okay recently? Did you tell them?",
  "What would you tell a friend who was feeling exactly how you feel right now?",
  "What does rest actually look like for you — not sleep, but real rest?",
]

type Theme = typeof THEMES[0]
type UserData = { id: string; email: string }
type Result = { result_type: string; exhaustion_score: number; cognitive_score: number; worth_score: number; recovery_score: number; created_at: string }

export default function Dashboard() {
  const [user, setUser] = useState<UserData | null>(null)
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)
  const [section, setSection] = useState<'home' | 'recovery' | 'journal' | 'history' | 'settings'>('home')

  // Customization
  const [theme, setTheme] = useState<Theme>(THEMES[0])
  const [displayName, setDisplayName] = useState('')
  const [onboarding, setOnboarding] = useState(false)
  const [onboardName, setOnboardName] = useState('')
  const [onboardTheme, setOnboardTheme] = useState(THEMES[0])

  // Streak + tasks
  const [streak, setStreak] = useState(1)
  const [completedTasks, setCompletedTasks] = useState<number[]>([])
  const [plantStage, setPlantStage] = useState(0)
  const [journalText, setJournalText] = useState('')
  const [journalSaved, setJournalSaved] = useState(false)
  const [greeting, setGreeting] = useState('')

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

      // Load saved preferences
      const saved = localStorage.getItem(`calf_prefs_${user.id}`)
      if (saved) {
        const prefs = JSON.parse(saved)
        const t = THEMES.find(t => t.id === prefs.themeId) || THEMES[0]
        setTheme(t)
        setDisplayName(prefs.name || user.email?.split('@')[0] || 'friend')
        setStreak(prefs.streak || 1)
        setPlantStage(Math.min(Math.floor((prefs.streak || 1) / 3), 4))
        setCompletedTasks(prefs.completedTasks || [])
      } else {
        // First time — show onboarding
        setOnboardName(user.email?.split('@')[0] || '')
        setOnboarding(true)
      }

      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (displayName) {
      const g = GREETINGS[Math.floor(Math.random() * GREETINGS.length)]
      setGreeting(g(displayName))
    }
  }, [displayName])

  const savePrefs = (name: string, t: Theme, tasks: number[] = completedTasks, s: number = streak) => {
    if (!user) return
    localStorage.setItem(`calf_prefs_${user.id}`, JSON.stringify({ themeId: t.id, name, streak: s, completedTasks: tasks }))
  }

  const finishOnboarding = () => {
    const name = onboardName.trim() || 'friend'
    setDisplayName(name)
    setTheme(onboardTheme)
    savePrefs(name, onboardTheme, [], 1)
    setOnboarding(false)
  }

  const toggleTask = (i: number) => {
    const updated = completedTasks.includes(i) ? completedTasks.filter(t => t !== i) : [...completedTasks, i]
    setCompletedTasks(updated)
    const newPlant = Math.min(Math.floor(updated.length / 2), 4)
    setPlantStage(newPlant)
    savePrefs(displayName, theme, updated)
  }

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  const latest = results[0]
  const pct = (s: number) => Math.round((s / 6) * 100)
  const plantEmojis = ['🌱', '🪴', '🌿', '🌳', '🌲']

  const T = theme

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <p style={{ fontFamily: "'Playfair Display', serif", color: '#4A8A5A', fontSize: '1.2rem', fontStyle: 'italic' }}>loading your space...</p>
    </div>
  )

  // ── ONBOARDING ──
  if (onboarding) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Syne:wght@400;500;600;700&display=swap'); *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; } body { background: ${onboardTheme.bg}; font-family: 'Syne', sans-serif; transition: background 0.3s; }`}</style>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: onboardTheme.bg }}>
        <div style={{ maxWidth: 520, width: '100%', animation: 'fadeUp 0.8s both' }}>
          <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: onboardTheme.accent, marginBottom: 16 }}>welcome to calf</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em', color: onboardTheme.ink, marginBottom: 8 }}>
            let&apos;s make this<br /><em style={{ fontStyle: 'italic', color: onboardTheme.accent }}>yours.</em>
          </h1>
          <p style={{ fontSize: '0.92rem', color: `${onboardTheme.ink}80`, lineHeight: 1.7, marginBottom: 36 }}>
            Two quick things and your dashboard is ready.
          </p>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: `${onboardTheme.ink}70`, marginBottom: 8 }}>what should we call you?</label>
            <input
              value={onboardName}
              onChange={e => setOnboardName(e.target.value)}
              placeholder="your name or nickname"
              style={{ width: '100%', padding: '0.9rem 1rem', background: onboardTheme.card, border: `1.5px solid ${onboardTheme.accent}40`, borderRadius: 12, fontFamily: "'Syne', sans-serif", fontSize: '0.95rem', color: onboardTheme.ink, outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: 36 }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: `${onboardTheme.ink}70`, marginBottom: 12 }}>pick your vibe</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {THEMES.map(t => (
                <button key={t.id} onClick={() => setOnboardTheme(t)}
                  style={{ padding: '0.7rem 0.5rem', background: t.bg, border: `2px solid ${onboardTheme.id === t.id ? t.accent : 'transparent'}`, borderRadius: 14, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', boxShadow: onboardTheme.id === t.id ? `0 4px 16px ${t.accent}30` : 'none' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: t.accent, margin: '0 auto 6px' }} />
                  <div style={{ fontSize: '0.65rem', color: t.ink, fontWeight: 600, lineHeight: 1.2 }}>{t.name}</div>
                </button>
              ))}
            </div>
          </div>

          <button onClick={finishOnboarding}
            style={{ width: '100%', padding: '1rem', background: onboardTheme.ink, color: onboardTheme.bg, fontFamily: "'Syne', sans-serif", fontSize: '0.95rem', fontWeight: 700, border: 'none', borderRadius: 100, cursor: 'pointer' }}>
            take me to my dashboard →
          </button>
        </div>
      </div>
    </>
  )

  // ── MAIN DASHBOARD ──
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Syne:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${T.bg}; color: ${T.ink}; font-family: 'Syne', sans-serif; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: ${T.accent}40; border-radius: 4px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.06); } }
        .nav-item { display:flex; align-items:center; gap:10px; padding:0.65rem 1rem; border-radius:12px; cursor:pointer; font-size:0.85rem; font-weight:500; color:${T.ink}90; border:none; background:transparent; font-family:'Syne',sans-serif; width:100%; text-align:left; transition:all 0.2s; }
        .nav-item:hover { background:${T.accent}15; color:${T.ink}; }
        .nav-item.active { background:${T.accent}18; color:${T.accent}; font-weight:600; }
        .card { background:${T.card}; border-radius:20px; padding:1.5rem; border:1px solid ${T.accent}15; box-shadow:0 2px 16px ${T.ink}08; }
        .task-btn { display:flex; align-items:center; gap:12px; padding:0.85rem 1rem; background:${T.bg2}; border:1px solid ${T.accent}15; border-radius:12px; cursor:pointer; text-align:left; width:100%; font-family:'Syne',sans-serif; font-size:0.85rem; color:${T.ink}; transition:all 0.2s; margin-bottom:8px; }
        .task-btn.done { background:${T.accent}10; border-color:${T.accent}30; text-decoration:line-through; color:${T.ink}60; }
        .task-btn:hover { border-color:${T.accent}40; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh' }}>

        {/* SIDEBAR */}
        <div style={{ width: 220, flexShrink: 0, background: T.bg2, borderRight: `1px solid ${T.accent}15`, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50 }}>
          <a href="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 700, fontStyle: 'italic', color: T.ink, textDecoration: 'none', marginBottom: 32, display: 'block', paddingLeft: 8 }}>
            calf<span style={{ color: T.accent }}>.</span>
          </a>

          {/* Plant + streak */}
          <div style={{ textAlign: 'center', padding: '1rem', background: T.card, borderRadius: 16, marginBottom: 20, border: `1px solid ${T.accent}15` }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 4, animation: 'pulse 3s ease-in-out infinite' }}>{plantEmojis[plantStage]}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: T.accent, letterSpacing: '0.08em', textTransform: 'uppercase' }}>day {streak} streak</div>
            <div style={{ fontSize: '0.65rem', color: `${T.ink}50`, marginTop: 2 }}>complete tasks to grow</div>
          </div>

          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { id: 'home',     icon: '🏠', label: 'Home' },
              { id: 'recovery', icon: '🌿', label: 'Recovery' },
              { id: 'journal',  icon: '📓', label: 'Journal' },
              { id: 'history',  icon: '📊', label: 'History' },
              { id: 'settings', icon: '✦',  label: 'Settings' },
            ].map(item => (
              <button key={item.id} onClick={() => setSection(item.id as typeof section)}
                className={`nav-item${section === item.id ? ' active' : ''}`}>
                <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <button onClick={signOut} style={{ padding: '0.6rem 1rem', background: 'transparent', border: `1px solid ${T.accent}25`, borderRadius: 10, cursor: 'pointer', color: `${T.ink}60`, fontSize: '0.78rem', fontFamily: "'Syne', sans-serif", textAlign: 'left' }}>
            sign out
          </button>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ marginLeft: 220, flex: 1, padding: '2.5rem', overflowY: 'auto' }}>

          {/* ── HOME ── */}
          {section === 'home' && (
            <div style={{ animation: 'fadeUp 0.6s both' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.accent, marginBottom: 8 }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem,3.5vw,2.6rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em', color: T.ink, marginBottom: 6 }}>
                {greeting || `hey ${displayName} 🌿`}
              </h1>
              <p style={{ fontSize: '0.88rem', color: `${T.ink}55`, marginBottom: 36 }}>
                {completedTasks.length} of {todayTasks.length} tasks done today
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>

                {/* Latest score */}
                {latest && (
                  <div className="card">
                    <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.accent, marginBottom: 12 }}>latest check-in</div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: T.ink, marginBottom: 4, textTransform: 'capitalize' }}>
                      {latest.result_type}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: `${T.ink}50`, marginBottom: 16 }}>
                      {new Date(latest.created_at).toLocaleDateString()}
                    </div>
                    {[['Exhaustion', latest.exhaustion_score, '#B5654A'], ['Mental', latest.cognitive_score, '#7A9E5A'], ['Self-Worth', latest.worth_score, '#7A6EAA'], ['Recovery', latest.recovery_score, T.accent]].map(([l, s, c]) => (
                      <div key={l as string} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: `${T.ink}60`, marginBottom: 4 }}>
                          <span>{l as string}</span><span>{pct(s as number)}%</span>
                        </div>
                        <div style={{ height: 5, background: `${T.ink}10`, borderRadius: 100 }}>
                          <div style={{ height: '100%', width: `${pct(s as number)}%`, background: c as string, borderRadius: 100, transition: 'width 1s' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Today's tasks */}
                <div className="card">
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.accent, marginBottom: 12 }}>today&apos;s tasks</div>
                  {todayTasks.map((task, i) => (
                    <button key={i} onClick={() => toggleTask(i)} className={`task-btn${completedTasks.includes(i) ? ' done' : ''}`}>
                      <span style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${completedTasks.includes(i) ? T.accent : `${T.ink}30`}`, background: completedTasks.includes(i) ? T.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.6rem', color: 'white' }}>
                        {completedTasks.includes(i) ? '✓' : ''}
                      </span>
                      {task}
                    </button>
                  ))}
                  {completedTasks.length === todayTasks.length && todayTasks.length > 0 && (
                    <div style={{ textAlign: 'center', padding: '0.75rem', background: `${T.accent}10`, borderRadius: 10, fontSize: '0.82rem', color: T.accent, fontWeight: 600, marginTop: 4 }}>
                      all done today 🎉 your plant grew!
                    </div>
                  )}
                </div>

                {/* No results yet */}
                {!latest && (
                  <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 12 }}>🌱</div>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: T.ink, marginBottom: 8 }}>no assessments yet</p>
                    <p style={{ fontSize: '0.82rem', color: `${T.ink}55`, marginBottom: 20 }}>take your first check-in to get started</p>
                    <a href="/assessment" style={{ background: T.ink, color: T.bg, fontFamily: "'Syne',sans-serif", fontSize: '0.85rem', fontWeight: 700, padding: '0.7rem 1.5rem', borderRadius: 100, textDecoration: 'none' }}>
                      take assessment →
                    </a>
                  </div>
                )}
              </div>

              <a href="/assessment" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: T.ink, color: T.bg, fontFamily: "'Syne',sans-serif", fontSize: '0.88rem', fontWeight: 700, padding: '0.8rem 1.8rem', borderRadius: 100, textDecoration: 'none' }}>
                take a new check-in →
              </a>
            </div>
          )}

          {/* ── RECOVERY ── */}
          {section === 'recovery' && (
            <div style={{ animation: 'fadeUp 0.6s both' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.accent, marginBottom: 8 }}>recovery plan</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 700, letterSpacing: '-0.03em', color: T.ink, marginBottom: 24 }}>
                your path back.
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>

                {/* All tasks */}
                <div className="card" style={{ gridColumn: 'span 2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontStyle: 'italic', color: T.ink }}>daily recovery tasks</div>
                    <div style={{ fontSize: '0.75rem', color: T.accent, fontWeight: 600 }}>{completedTasks.length}/{todayTasks.length} done</div>
                  </div>
                  {TASKS.map((task, i) => (
                    <button key={i} onClick={() => toggleTask(i)} className={`task-btn${completedTasks.includes(i) ? ' done' : ''}`}>
                      <span style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${completedTasks.includes(i) ? T.accent : `${T.ink}30`}`, background: completedTasks.includes(i) ? T.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.6rem', color: 'white' }}>
                        {completedTasks.includes(i) ? '✓' : ''}
                      </span>
                      {task}
                    </button>
                  ))}
                </div>

                {/* Plant progress */}
                <div className="card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.accent, marginBottom: 12 }}>your recovery plant</div>
                  <div style={{ fontSize: '4rem', margin: '1rem 0', animation: 'pulse 3s ease-in-out infinite' }}>{plantEmojis[plantStage]}</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', color: T.ink, marginBottom: 6 }}>
                    stage {plantStage + 1} of 5
                  </div>
                  <p style={{ fontSize: '0.78rem', color: `${T.ink}55`, lineHeight: 1.6 }}>
                    complete tasks to help it grow. miss days and it wilts.
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
                    {plantEmojis.map((p, i) => (
                      <span key={i} style={{ fontSize: '1.2rem', opacity: i <= plantStage ? 1 : 0.2 }}>{p}</span>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ── JOURNAL ── */}
          {section === 'journal' && (
            <div style={{ animation: 'fadeUp 0.6s both' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.accent, marginBottom: 8 }}>daily journal</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 700, letterSpacing: '-0.03em', color: T.ink, marginBottom: 8 }}>
                what&apos;s on your mind?
              </h2>
              <p style={{ fontSize: '0.85rem', color: `${T.ink}55`, marginBottom: 28 }}>a new prompt every day. write as much or as little as you want.</p>

              <div className="card" style={{ maxWidth: 640 }}>
                <div style={{ background: `${T.accent}08`, border: `1px solid ${T.accent}20`, borderRadius: 12, padding: '1rem 1.2rem', marginBottom: 20 }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: T.accent, marginBottom: 6 }}>today&apos;s prompt</div>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '1rem', color: T.ink, lineHeight: 1.6 }}>
                    {todayPrompt}
                  </p>
                </div>

                <textarea
                  value={journalText}
                  onChange={e => { setJournalText(e.target.value); setJournalSaved(false) }}
                  placeholder="start writing... this is just for you."
                  rows={10}
                  style={{ width: '100%', padding: '1rem', background: T.bg2, border: `1.5px solid ${journalText ? T.accent + '40' : T.accent + '15'}`, borderRadius: 14, fontFamily: "'Syne', sans-serif", fontSize: '0.92rem', color: T.ink, lineHeight: 1.75, outline: 'none', resize: 'none', transition: 'border-color 0.2s' }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <span style={{ fontSize: '0.72rem', color: `${T.ink}40` }}>{journalText.length} characters</span>
                  <button onClick={() => {
                    if (!journalText.trim()) return
                    localStorage.setItem(`calf_journal_${user?.id}_${new Date().toDateString()}`, journalText)
                    setJournalSaved(true)
                    if (!completedTasks.includes(99)) {
                      const updated = [...completedTasks, 99]
                      setCompletedTasks(updated)
                      savePrefs(displayName, theme, updated)
                    }
                  }} style={{ background: journalSaved ? `${T.accent}15` : T.ink, color: journalSaved ? T.accent : T.bg, fontFamily: "'Syne',sans-serif", fontSize: '0.82rem', fontWeight: 700, padding: '0.6rem 1.4rem', border: 'none', borderRadius: 100, cursor: 'pointer', transition: 'all 0.2s' }}>
                    {journalSaved ? 'saved ✓' : 'save entry'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── HISTORY ── */}
          {section === 'history' && (
            <div style={{ animation: 'fadeUp 0.6s both' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.accent, marginBottom: 8 }}>past check-ins</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 700, letterSpacing: '-0.03em', color: T.ink, marginBottom: 24 }}>
                your journey so far.
              </h2>

              {results.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                  <p style={{ fontSize: '2rem', marginBottom: 12 }}>🌱</p>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: T.ink, marginBottom: 8 }}>no check-ins yet</p>
                  <a href="/assessment" style={{ background: T.ink, color: T.bg, fontFamily: "'Syne',sans-serif", fontSize: '0.85rem', fontWeight: 700, padding: '0.7rem 1.5rem', borderRadius: 100, textDecoration: 'none', display: 'inline-block', marginTop: 16 }}>take your first →</a>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 680 }}>
                  {results.map((r, i) => (
                    <div key={i} className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', fontWeight: 700, color: T.ink, textTransform: 'capitalize' }}>{r.result_type}</div>
                        <div style={{ fontSize: '0.75rem', color: `${T.ink}50` }}>{new Date(r.created_at).toLocaleDateString()}</div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                        {[['Exhaustion', r.exhaustion_score], ['Mental', r.cognitive_score], ['Self-Worth', r.worth_score], ['Recovery', r.recovery_score]].map(([label, score]) => (
                          <div key={label as string} style={{ textAlign: 'center', padding: '0.75rem', background: T.bg2, borderRadius: 12 }}>
                            <p style={{ fontSize: '1.2rem', fontWeight: 700, color: T.accent }}>{pct(score as number)}%</p>
                            <p style={{ fontSize: '0.68rem', color: `${T.ink}55`, marginTop: 3 }}>{label as string}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SETTINGS ── */}
          {section === 'settings' && (
            <div style={{ animation: 'fadeUp 0.6s both' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.accent, marginBottom: 8 }}>settings</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 700, letterSpacing: '-0.03em', color: T.ink, marginBottom: 24 }}>
                make it yours.
              </h2>

              <div style={{ maxWidth: 540, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="card">
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: `${T.ink}60`, marginBottom: 10 }}>display name</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                      style={{ flex: 1, padding: '0.8rem 1rem', background: T.bg2, border: `1.5px solid ${T.accent}25`, borderRadius: 12, fontFamily: "'Syne',sans-serif", fontSize: '0.92rem', color: T.ink, outline: 'none' }} />
                    <button onClick={() => savePrefs(displayName, theme)}
                      style={{ padding: '0.8rem 1.4rem', background: T.ink, color: T.bg, fontFamily: "'Syne',sans-serif", fontSize: '0.82rem', fontWeight: 700, border: 'none', borderRadius: 12, cursor: 'pointer' }}>
                      save
                    </button>
                  </div>
                </div>

                <div className="card">
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: `${T.ink}60`, marginBottom: 14 }}>theme</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                    {THEMES.map(t => (
                      <button key={t.id} onClick={() => { setTheme(t); savePrefs(displayName, t) }}
                        style={{ padding: '0.7rem 0.5rem', background: t.bg, border: `2px solid ${theme.id === t.id ? t.accent : 'transparent'}`, borderRadius: 14, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', boxShadow: theme.id === t.id ? `0 4px 16px ${t.accent}30` : 'none' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: t.accent, margin: '0 auto 6px' }} />
                        <div style={{ fontSize: '0.62rem', color: t.ink, fontWeight: 600, lineHeight: 1.2 }}>{t.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: `${T.ink}60`, marginBottom: 8 }}>account</div>
                  <p style={{ fontSize: '0.85rem', color: `${T.ink}60`, marginBottom: 14 }}>{user?.email}</p>
                  <button onClick={signOut} style={{ padding: '0.7rem 1.4rem', background: 'transparent', border: `1px solid ${T.accent}30`, borderRadius: 100, cursor: 'pointer', color: `${T.ink}70`, fontSize: '0.82rem', fontFamily: "'Syne',sans-serif" }}>
                    sign out
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
