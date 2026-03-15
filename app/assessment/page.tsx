'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const questions = [
  // --- PART 1: Soft & reflective ---
  {
    id: 1, area: 'recovery', part: 1,
    text: "When was the last time a day felt genuinely easy?",
    sub: "Not productive, not successful — just light. Like you weren't carrying anything.",
    options: [
      { label: "Recently, actually — I have those days", score: 0 },
      { label: "A few weeks ago, maybe", score: 1 },
      { label: "I honestly can't remember", score: 2 },
      { label: "I'm not sure I know what that feels like anymore", score: 3 },
    ]
  },
  {
    id: 2, area: 'recovery', part: 1,
    text: "What do you do when you're not studying or in class?",
    sub: "Your real answer, not the ideal one.",
    options: [
      { label: "Things I actually enjoy — hobbies, people, rest", score: 0 },
      { label: "Scroll, watch stuff, zone out mostly", score: 1 },
      { label: "Worry about what I should be doing", score: 2 },
      { label: "I barely have time that's actually mine", score: 3 },
    ]
  },
  {
    id: 3, area: 'exhaustion', part: 1,
    text: "If you had a completely free week — no deadlines, no obligations — what's the first thing you'd feel?",
    sub: "Not what you'd do. What you'd feel, in your body, in the first few minutes.",
    options: [
      { label: "Relief and excitement — finally", score: 0 },
      { label: "Relief, but also a weird guilt", score: 1 },
      { label: "I'd probably still feel anxious", score: 2 },
      { label: "Honestly, I can't picture it — it doesn't feel real", score: 3 },
    ]
  },
  {
    id: 4, area: 'exhaustion', part: 1,
    text: "How willing are you to actually spend time recovering — not just resting, but doing the work of getting better?",
    sub: "Recovery takes effort too. Where are you with that?",
    options: [
      { label: "Ready — I want to put in the work", score: 0 },
      { label: "Willing, but I don't know where to start", score: 1 },
      { label: "Skeptical — I've tried things and nothing sticks", score: 2 },
      { label: "Too tired to even think about it right now", score: 3 },
    ]
  },

  // --- PART 2: Deeper, unexpected ---
  {
    id: 5, area: 'cognitive', part: 2,
    text: "When you get a notification from a professor or classmate about academics, what happens in your chest?",
    sub: "That split second before you even read it.",
    options: [
      { label: "Nothing much — I just check it", score: 0 },
      { label: "A small tightening, but it passes", score: 1 },
      { label: "A jolt of dread I have to breathe through", score: 2 },
      { label: "I avoid it for as long as I can", score: 3 },
    ]
  },
  {
    id: 6, area: 'worth', part: 2,
    text: "Think about something you used to love doing before college. How present is that thing in your life now?",
    sub: "A sport, a hobby, an interest — something that was just yours.",
    options: [
      { label: "Still there, still matters to me", score: 0 },
      { label: "I do it sometimes, but less than before", score: 1 },
      { label: "I've mostly let it go without realising it", score: 2 },
      { label: "I forgot I even had that until just now", score: 3 },
    ]
  },
  {
    id: 7, area: 'worth', part: 2,
    text: "If a close friend described how you seem lately, what do you think they would say?",
    sub: "Not how you want to seem. What they'd actually notice.",
    options: [
      { label: "Pretty much like themselves", score: 0 },
      { label: "A bit more stressed or quiet lately", score: 1 },
      { label: "Withdrawn — not really present anymore", score: 2 },
      { label: "They've probably noticed I'm not okay", score: 3 },
    ]
  },
  {
    id: 8, area: 'cognitive', part: 2,
    text: "When you lie down at night, what does your mind do?",
    sub: "That space between being awake and asleep.",
    options: [
      { label: "Quiets down — I fall asleep okay", score: 0 },
      { label: "Wanders a bit, but eventually settles", score: 1 },
      { label: "Replays the day, worries about tomorrow", score: 2 },
      { label: "Races — sleep feels like something I have to fight for", score: 3 },
    ]
  },
]

const resultData: Record<string, { emoji: string; title: string; desc: string; color: string; accent: string }> = {
  stable: {
    emoji: '🌤️',
    title: "You're holding up.",
    desc: "You're managing the pressure without breaking under it. The foundations are there — keep protecting them. Small habits now prevent big collapses later.",
    color: '#4A8A5A',
    accent: 'rgba(74,138,90,0.1)',
  },
  early: {
    emoji: '🌿',
    title: "Early signs are showing.",
    desc: "You're functioning, but there's strain beneath the surface. This is actually the best time to step in — before it compounds. You don't have to wait until you're fully cooked.",
    color: '#7A9E5A',
    accent: 'rgba(122,158,90,0.1)',
  },
  depleted: {
    emoji: '🍂',
    title: "You're running on empty.",
    desc: "You've been giving from a tank that's been dry for a while. Rest isn't optional right now — it's the work. What you're feeling is real, and it makes sense.",
    color: '#B5654A',
    accent: 'rgba(181,101,74,0.1)',
  },
  severe: {
    emoji: '🌫️',
    title: "You're deeply exhausted.",
    desc: "This level of burnout doesn't fix itself with a good night's sleep. Real rest, real support, and real honesty about what needs to change — that's what this takes. Please don't carry this alone.",
    color: '#7A4A8A',
    accent: 'rgba(122,74,138,0.1)',
  },
}

export default function Assessment() {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [stage, setStage] = useState<'intro' | 'questions' | 'transition' | 'loading' | 'result' | 'save'>('intro')
  const [result, setResult] = useState<{ key: string; dim: Record<string, number>; total: number } | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [cursorPos, setCursorPos] = useState({ x: -200, y: -200 })

  useEffect(() => {
    const move = (e: MouseEvent) => setCursorPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  const selectOption = (i: number) => setAnswers({ ...answers, [current]: i })

  const next = () => {
    if (answers[current] === undefined) return
    // Show transition between part 1 and part 2
    if (current === 3) { setStage('transition'); return }
    if (current === questions.length - 1) { calculate(); return }
    setCurrent(current + 1)
  }

  const prev = () => { if (current > 0) setCurrent(current - 1) }

  const calculate = () => {
    setStage('loading')
    const dim: Record<string, number> = { exhaustion: 0, cognitive: 0, worth: 0, recovery: 0 }
    questions.forEach((q, i) => {
      if (answers[i] !== undefined) dim[q.area] += q.options[answers[i]].score
    })
    const total = Math.round(((dim.exhaustion + dim.cognitive + dim.worth + dim.recovery) / 24) * 100)
    const key = total <= 20 ? 'stable' : total <= 42 ? 'early' : total <= 67 ? 'depleted' : 'severe'
    setTimeout(() => {
      setResult({ key, dim, total })
      setStage('result')
    }, 2000)
  }

  const handleSave = async (email: string, password: string, isNew: boolean) => {
    if (!supabase) return
    setSaveState('loading')
    try {
      let userId: string | null = null
      if (isNew) {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        userId = data.user?.id || null
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        userId = data.user?.id || null
      }
      if (userId && result) {
        const dim = result.dim
        await supabase.from('users_progress').insert({
          user_id: userId,
          exhaustion_score: dim.exhaustion,
          cognitive_score: dim.cognitive,
          worth_score: dim.worth,
          recovery_score: dim.recovery,
          result_type: result.key,
          created_at: new Date(),
        })
      }
      setSaveState('done')
      setTimeout(() => { window.location.href = '/dashboard' }, 1200)
    } catch {
      setSaveState('error')
    }
  }

  const pct = (score: number) => Math.round((score / 6) * 100)

  // ── INTRO ──────────────────────────────────────────────
  if (stage === 'intro') return (
    <Page>
      <div style={{ maxWidth: 580, margin: '0 auto', textAlign: 'center', animation: 'fadeUp 0.8s both' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--green)', border: '1.5px solid rgba(74,138,90,0.25)', borderRadius: 100, padding: '0.3rem 0.9rem', marginBottom: 28, background: 'rgba(74,138,90,0.07)' }}>
          🌿 burnout assessment
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.2rem, 6vw, 4rem)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.03em', color: 'var(--ink)', marginBottom: 20 }}>
          how are you<br /><em style={{ fontStyle: 'italic', color: 'var(--green)' }}>actually</em> doing?
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.8, marginBottom: 8, maxWidth: 460, margin: '0 auto 8px' }}>
          8 questions. No clinical jargon. Just an honest look at where you are right now.
        </p>
        <p style={{ fontSize: '0.82rem', color: 'var(--muted)', fontStyle: 'italic', marginBottom: 44, opacity: 0.7 }}>
          Takes about 3 minutes. You can save your results at the end.
        </p>
        <button onClick={() => setStage('questions')} style={{ background: 'var(--ink)', color: 'var(--bg)', fontFamily: "'Syne', sans-serif", fontSize: '0.95rem', fontWeight: 700, padding: '0.95rem 2.5rem', border: 'none', borderRadius: 100, cursor: 'pointer', transition: 'background 0.2s, transform 0.2s' }}
          onMouseEnter={e => { (e.target as HTMLElement).style.background = 'var(--green)'; (e.target as HTMLElement).style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { (e.target as HTMLElement).style.background = 'var(--ink)'; (e.target as HTMLElement).style.transform = 'translateY(0)' }}>
          begin &rarr;
        </button>
      </div>
    </Page>
  )

  // ── TRANSITION ─────────────────────────────────────────
  if (stage === 'transition') return (
    <Page>
      <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center', animation: 'fadeUp 0.8s both' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 24 }}>🌿</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.03em', color: 'var(--ink)', marginBottom: 16 }}>
          now for the<br /><em style={{ fontStyle: 'italic', color: 'var(--green)' }}>quieter questions.</em>
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.8, maxWidth: 400, margin: '0 auto 40px' }}>
          The next 4 go a little deeper. Parts of your life you might not have checked in with lately.
        </p>
        <button onClick={() => { setCurrent(4); setStage('questions') }}
          style={{ background: 'var(--ink)', color: 'var(--bg)', fontFamily: "'Syne', sans-serif", fontSize: '0.95rem', fontWeight: 700, padding: '0.95rem 2.5rem', border: 'none', borderRadius: 100, cursor: 'pointer' }}>
          continue &rarr;
        </button>
      </div>
    </Page>
  )

  // ── QUESTIONS ──────────────────────────────────────────
  if (stage === 'questions') {
    const q = questions[current]
    const progress = ((current + 1) / questions.length) * 100
    const isPart2 = q.part === 2
    return (
      <Page>
        {/* Progress bar */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: 'rgba(90,110,85,0.1)', zIndex: 100 }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--green), var(--terracotta))', width: `${progress}%`, transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1)' }} />
        </div>

        <div style={{ maxWidth: 660, margin: '0 auto', padding: '80px 0 40px', animation: 'fadeUp 0.5s both' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              {current + 1} of {questions.length}
            </span>
            <span style={{ fontSize: '0.7rem', padding: '4px 12px', borderRadius: 100, background: isPart2 ? 'rgba(181,101,74,0.08)' : 'rgba(74,138,90,0.08)', color: isPart2 ? 'var(--terracotta)' : 'var(--green)', border: `1px solid ${isPart2 ? 'rgba(181,101,74,0.2)' : 'rgba(74,138,90,0.2)'}` }}>
              {isPart2 ? 'deeper dive' : 'check in'}
            </span>
          </div>

          {/* Question */}
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: 12 }}>
            {q.text}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.7, marginBottom: 40 }}>
            {q.sub}
          </p>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 48 }}>
            {q.options.map((opt, i) => {
              const selected = answers[current] === i
              return (
                <button key={i} onClick={() => selectOption(i)} style={{
                  padding: '1.1rem 1.4rem',
                  background: selected ? 'rgba(74,138,90,0.07)' : '#FFFFFF',
                  border: `1.5px solid ${selected ? 'rgba(74,138,90,0.4)' : 'rgba(90,110,85,0.12)'}`,
                  borderRadius: 16, textAlign: 'left',
                  fontSize: '0.93rem', color: selected ? 'var(--ink)' : 'rgba(46,53,40,0.7)',
                  cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 12,
                  boxShadow: selected ? '0 2px 12px rgba(74,138,90,0.1)' : 'none',
                }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', border: `1.5px solid ${selected ? 'var(--green)' : 'rgba(90,110,85,0.25)'}`, flexShrink: 0, background: selected ? 'var(--green)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                    {selected && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'white', display: 'block' }} />}
                  </span>
                  {opt.label}
                </button>
              )
            })}
          </div>

          {/* Nav */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={prev} disabled={current === 0} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid rgba(90,110,85,0.18)', borderRadius: 100, cursor: current === 0 ? 'default' : 'pointer', color: 'var(--muted)', fontSize: '0.86rem', opacity: current === 0 ? 0.4 : 1, fontFamily: "'Syne', sans-serif" }}>
              &larr; back
            </button>
            <button onClick={next} disabled={answers[current] === undefined} style={{ padding: '0.75rem 2rem', background: answers[current] !== undefined ? 'var(--ink)' : 'rgba(46,53,40,0.15)', color: answers[current] !== undefined ? 'var(--bg)' : 'var(--muted)', border: 'none', borderRadius: 100, cursor: answers[current] !== undefined ? 'pointer' : 'default', fontSize: '0.86rem', fontWeight: 700, fontFamily: "'Syne', sans-serif", transition: 'all 0.2s' }}>
              {current === questions.length - 1 ? 'see results →' : current === 3 ? 'next part →' : 'next →'}
            </button>
          </div>
        </div>
      </Page>
    )
  }

  // ── LOADING ────────────────────────────────────────────
  if (stage === 'loading') return (
    <Page>
      <div style={{ textAlign: 'center', animation: 'fadeUp 0.6s both' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--green), var(--terracotta))', margin: '0 auto 28px', animation: 'pulse 2s ease-in-out infinite' }} />
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontStyle: 'italic', color: 'var(--ink)' }}>
          reading your answers...
        </p>
      </div>
    </Page>
  )

  // ── RESULT ─────────────────────────────────────────────
  if (stage === 'result' && result) {
    const r = resultData[result.key]
    return (
      <Page>
        <div style={{ maxWidth: 660, margin: '0 auto', animation: 'fadeUp 0.8s both' }}>
          {/* Result header */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: 20 }}>{r.emoji}</span>
            <div style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: r.color, background: r.accent, border: `1px solid ${r.color}33`, borderRadius: 100, padding: '0.3rem 0.9rem', marginBottom: 16 }}>
              your result
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.03em', color: 'var(--ink)', marginBottom: 16 }}>
              {r.title}
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.8, maxWidth: 500, margin: '0 auto' }}>
              {r.desc}
            </p>
          </div>

          {/* Dimension bars */}
          <div style={{ background: '#FFFFFF', borderRadius: 24, padding: '2rem', marginBottom: 24, border: '1px solid rgba(90,110,85,0.1)', boxShadow: '0 2px 16px rgba(80,90,70,0.06)' }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: 'var(--ink)', marginBottom: 24, fontSize: '1.05rem' }}>
              your burnout breakdown
            </p>
            {[
              ['Exhaustion', result.dim.exhaustion, '#B5654A'],
              ['Mental Fatigue', result.dim.cognitive, '#7A9E5A'],
              ['Self-Worth', result.dim.worth, '#7A6EAA'],
              ['Recovery Capacity', result.dim.recovery, '#4A8A5A'],
            ].map(([label, score, color]) => (
              <div key={label as string} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 7 }}>
                  <span>{label as string}</span>
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{pct(score as number)}%</span>
                </div>
                <div style={{ height: 6, background: 'rgba(90,110,85,0.1)', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct(score as number)}%`, background: color as string, borderRadius: 100, transition: 'width 1s cubic-bezier(0.16,1,0.3,1)' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Save prompt */}
          <div style={{ background: 'rgba(74,138,90,0.05)', border: '1px solid rgba(74,138,90,0.15)', borderRadius: 20, padding: '1.5rem 2rem', marginBottom: 24, textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink)', fontWeight: 600, marginBottom: 6 }}>Want to track your recovery over time?</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 20 }}>Save your results to see how you improve. Free, always.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setStage('save')} style={{ background: 'var(--ink)', color: 'var(--bg)', fontFamily: "'Syne', sans-serif", fontSize: '0.88rem', fontWeight: 700, padding: '0.75rem 1.8rem', border: 'none', borderRadius: 100, cursor: 'pointer' }}>
                save my results →
              </button>
              <a href="/recovery" style={{ background: 'transparent', color: 'var(--muted)', fontFamily: "'Syne', sans-serif", fontSize: '0.88rem', fontWeight: 500, padding: '0.75rem 1.5rem', border: '1px solid rgba(90,110,85,0.18)', borderRadius: 100, cursor: 'pointer', textDecoration: 'none' }}>
                skip for now
              </a>
            </div>
          </div>
        </div>
      </Page>
    )
  }

  // ── SAVE ───────────────────────────────────────────────
  if (stage === 'save') {
    return <SaveForm onSave={handleSave} saveState={saveState} />
  }

  return null
}

function SaveForm({ onSave, saveState }: { onSave: (email: string, password: string, isNew: boolean) => void; saveState: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isNew, setIsNew] = useState(true)

  return (
    <Page>
      <div style={{ maxWidth: 420, margin: '0 auto', animation: 'fadeUp 0.7s both' }}>
        <a href="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 700, fontStyle: 'italic', color: 'var(--ink)', textDecoration: 'none', display: 'block', marginBottom: 40 }}>
          calf<span style={{ color: 'var(--green)' }}>.</span>
        </a>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 16 }}>
          save your results
        </div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'var(--ink)', marginBottom: 8 }}>
          {isNew ? <>create your<br /><em style={{ fontStyle: 'italic', color: 'var(--green)' }}>account.</em></> : <>welcome<br /><em style={{ fontStyle: 'italic', color: 'var(--green)' }}>back.</em></>}
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: 28 }}>
          {isNew ? 'Your results will be saved to your dashboard.' : 'Sign in to save your results.'}
        </p>

        {['Email', 'Password'].map((label, idx) => (
          <div key={label} style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>{label}</label>
            <input
              type={idx === 1 ? 'password' : 'email'}
              placeholder={idx === 0 ? 'you@example.com' : '••••••••'}
              value={idx === 0 ? email : password}
              onChange={e => idx === 0 ? setEmail(e.target.value) : setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.85rem 1rem', background: '#FFFFFF', border: '1.5px solid rgba(90,110,85,0.14)', borderRadius: 12, fontFamily: "'Syne', sans-serif", fontSize: '0.93rem', color: 'var(--ink)', outline: 'none' }}
            />
          </div>
        ))}

        <button
          onClick={() => onSave(email, password, isNew)}
          disabled={saveState === 'loading' || saveState === 'done'}
          style={{ width: '100%', padding: '0.95rem', background: 'var(--ink)', color: 'var(--bg)', fontFamily: "'Syne', sans-serif", fontSize: '0.95rem', fontWeight: 700, border: 'none', borderRadius: 100, cursor: 'pointer', marginTop: 8, marginBottom: 16, opacity: saveState === 'loading' ? 0.7 : 1 }}>
          {saveState === 'loading' ? 'saving...' : saveState === 'done' ? 'saved! redirecting...' : isNew ? 'create account & save →' : 'sign in & save →'}
        </button>

        {saveState === 'error' && (
          <p style={{ textAlign: 'center', fontSize: '0.83rem', color: 'var(--terracotta)', marginBottom: 12 }}>
            Something went wrong. Check your details and try again.
          </p>
        )}

        <p style={{ textAlign: 'center', fontSize: '0.83rem', color: 'var(--muted)' }}>
          {isNew ? 'Already have an account? ' : "Don't have an account? "}
          <button onClick={() => setIsNew(!isNew)} style={{ color: 'var(--terracotta)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Syne', sans-serif", fontSize: '0.83rem', padding: 0 }}>
            {isNew ? 'sign in' : 'sign up'}
          </button>
        </p>
      </div>
    </Page>
  )
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Syne:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --bg: #F5F0E8; --ink: #2E3528; --muted: rgba(46,53,40,0.5); --green: #4A8A5A; --terracotta: #B5654A; --border: rgba(90,110,85,0.12); }
        html, body { min-height: 100%; }
        body { background: var(--bg); color: var(--ink); font-family: 'Syne', sans-serif; overflow-x: hidden; }
        body::before { content: ''; position: fixed; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); opacity: 0.025; pointer-events: none; z-index: 9997; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.08); opacity: 0.8; } }
      `}</style>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        {children}
      </div>
    </>
  )
}
