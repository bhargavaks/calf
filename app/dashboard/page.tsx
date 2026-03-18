'use client'
import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const openQuestions = [
  {
    id: 1,
    text: "When did you last do something just because it made you happy?",
    sub: "Not because it was useful, impressive, or productive. Not a hobby you list on your resume. Something that was just yours.",
    placeholder: "Take your time. There's no right answer here...",
  },
  {
    id: 2,
    text: "Is there a version of your life your parents imagine for you that you've never actually wanted?",
    sub: "You don't have to answer fully. Even half an answer counts.",
    placeholder: "You can be honest here. Nobody's watching...",
  },
  {
    id: 3,
    text: "What's the one thing you wish someone would just ask you — but nobody does?",
    sub: "It could be anything. About college, about your work, about how you're actually doing.",
    placeholder: "Whatever comes to mind first...",
  },
  {
    id: 4,
    text: "What are you most afraid will happen if you stop performing well for a while?",
    sub: "Not the logical answer. The real fear underneath it.",
    placeholder: "The thing you haven't quite said out loud yet...",
  },
]

const mcqQuestions = [
  {
    id: 5, area: 'worth',
    text: "When you see a batchmate doing better than you — placing better, understanding faster, scoring higher — what actually happens inside you?",
    sub: "Your honest first reaction. Not what you think you should feel.",
    options: [
      { label: "I feel genuinely happy for them, mostly", score: 0 },
      { label: "A sting I try to ignore but it lingers", score: 1 },
      { label: "It spirals — I start questioning everything about myself", score: 2 },
      { label: "I go quiet and just pretend I didn't notice", score: 3 },
    ]
  },
  {
    id: 6, area: 'cognitive',
    text: "How often do you feel like everyone around you has figured something out that you haven't?",
    sub: "Like there was an instruction everyone else got and you missed it.",
    options: [
      { label: "Rarely — I feel fairly grounded", score: 0 },
      { label: "Sometimes, but I remind myself it's not true", score: 1 },
      { label: "Often — I feel like I missed something everyone else got", score: 2 },
      { label: "Almost always — I feel like I'm faking it every single day", score: 3 },
    ]
  },
  {
    id: 7, area: 'exhaustion',
    text: "When a professor singles you out or you get a bad grade, how long does it stay with you?",
    sub: "That feeling after. How long before it actually leaves?",
    options: [
      { label: "A few hours and I move on", score: 0 },
      { label: "The rest of the day, maybe the next", score: 1 },
      { label: "Days — it replays more than I want to admit", score: 2 },
      { label: "Weeks sometimes. It becomes part of how I see myself.", score: 3 },
    ]
  },
  {
    id: 8, area: 'worth',
    text: "When was the last time you felt genuinely proud of yourself — not because of marks, but just because of who you are?",
    sub: "Not an achievement. Just you, being enough.",
    options: [
      { label: "Recently actually — it doesn't always need a reason", score: 0 },
      { label: "A while ago, tied to something I achieved", score: 1 },
      { label: "I'm not sure — pride feels like something I have to earn", score: 2 },
      { label: "I honestly can't remember the last time", score: 3 },
    ]
  },
]

const resultData: Record<string, { emoji: string; title: string; desc: string; color: string; accent: string }> = {
  stable: {
    emoji: '🌤️',
    title: "You're holding up.",
    desc: "You're managing the pressure without breaking under it. The foundations are there — keep protecting them. Small habits now prevent big collapses later.",
    color: '#4A8A5A', accent: 'rgba(74,138,90,0.1)',
  },
  early: {
    emoji: '🌿',
    title: "Early signs are showing.",
    desc: "You're functioning, but there's strain beneath the surface. This is actually the best time to step in — before it compounds. You don't have to wait until you're fully cooked.",
    color: '#7A9E5A', accent: 'rgba(122,158,90,0.1)',
  },
  depleted: {
    emoji: '🍂',
    title: "You're running on empty.",
    desc: "You've been giving from a tank that's been dry for a while. Rest isn't optional right now — it's the work. What you're feeling is real, and it makes complete sense.",
    color: '#B5654A', accent: 'rgba(181,101,74,0.1)',
  },
  severe: {
    emoji: '🌫️',
    title: "You're deeply exhausted.",
    desc: "This level of burnout doesn't fix itself with a good night's sleep. Real rest, real support, and real honesty about what needs to change — that's what this takes. Please don't carry this alone.",
    color: '#7A4A8A', accent: 'rgba(122,74,138,0.1)',
  },
}

function extractDays(text: string): number {
  const lower = text.toLowerCase()
  const numMatch = text.match(/\d+/)
  if (numMatch) {
    const n = parseInt(numMatch[0])
    if (lower.includes('week')) return n * 7
    if (lower.includes('month')) return n * 30
    if (n > 0 && n <= 365) return n
  }
  if (lower.includes('one week') || lower.includes('a week')) return 7
  if (lower.includes('two week')) return 14
  if (lower.includes('a month') || lower.includes('one month')) return 30
  if (lower.includes('don\'t know') || lower.includes('not sure') || lower.includes('idk')) return 21
  return 21 // default
}

export default function Assessment() {
  const [stage, setStage] = useState<'intro' | 'open' | 'transition' | 'mcq' | 'commitment' | 'loading' | 'result' | 'save'>('intro')
  const [openIdx, setOpenIdx] = useState(0)
  const [openAnswers, setOpenAnswers] = useState<string[]>(['', '', '', ''])
  const [mcqIdx, setMcqIdx] = useState(0)
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, number>>({})
  const [commitmentText, setCommitmentText] = useState('')
  const [commitmentDays, setCommitmentDays] = useState(21)
  const [result, setResult] = useState<{ key: string; dim: Record<string, number>; days: number } | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const commitRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (stage === 'open' && textareaRef.current) textareaRef.current.focus()
  }, [stage, openIdx])

  useEffect(() => {
    if (stage === 'commitment' && commitRef.current) commitRef.current.focus()
  }, [stage])

  const nextOpen = () => {
    if (!openAnswers[openIdx].trim()) return
    if (openIdx === openQuestions.length - 1) { setStage('transition'); return }
    setOpenIdx(openIdx + 1)
  }

  const prevOpen = () => { if (openIdx > 0) setOpenIdx(openIdx - 1) }

  const nextMcq = () => {
    if (mcqAnswers[mcqIdx] === undefined) return
    if (mcqIdx === mcqQuestions.length - 1) { setStage('commitment'); return }
    setMcqIdx(mcqIdx + 1)
  }

  const prevMcq = () => { if (mcqIdx > 0) setMcqIdx(mcqIdx - 1) }

  const calculate = () => {
    const days = extractDays(commitmentText)
    setCommitmentDays(days)
    setStage('loading')
    const dim: Record<string, number> = { exhaustion: 0, cognitive: 0, worth: 0, recovery: 0 }
    mcqQuestions.forEach((q, i) => {
      if (mcqAnswers[i] !== undefined) dim[q.area] += q.options[mcqAnswers[i]].score
    })
    const total = Math.round(((dim.exhaustion + dim.cognitive + dim.worth + dim.recovery) / 24) * 100)
    const key = total <= 20 ? 'stable' : total <= 42 ? 'early' : total <= 67 ? 'depleted' : 'severe'
    setTimeout(() => { setResult({ key, dim, days }); setStage('result') }, 2200)
  }

  const handleSave = async (email: string, password: string, isNew: boolean) => {
    if (!supabase) { setSaveState('error'); return }
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
        await supabase.from('users_progress').insert({
          user_id: userId,
          exhaustion_score: result.dim.exhaustion,
          cognitive_score: result.dim.cognitive,
          worth_score: result.dim.worth,
          recovery_score: result.dim.recovery,
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

  const pct = (s: number) => Math.round((s / 6) * 100)

  const totalProgress = stage === 'open' ? ((openIdx + 1) / 9) * 100
    : stage === 'transition' ? (4 / 9) * 100
    : stage === 'mcq' ? ((4 + mcqIdx + 1) / 9) * 100
    : stage === 'commitment' ? (8 / 9) * 100
    : stage === 'loading' || stage === 'result' || stage === 'save' ? 100 : 0

  // ── INTRO ──
  if (stage === 'intro') return (
    <Page progress={0}>
      <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', animation: 'fadeUp 0.8s both' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--green)', border: '1.5px solid rgba(74,138,90,0.25)', borderRadius: 100, padding: '0.3rem 0.9rem', marginBottom: 28, background: 'rgba(74,138,90,0.07)' }}>
          🌿 burnout check-in
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.2rem, 6vw, 4rem)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.03em', color: 'var(--ink)', marginBottom: 20 }}>
          how are you<br /><em style={{ fontStyle: 'italic', color: 'var(--green)' }}>actually</em> doing?
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.8, maxWidth: 440, margin: '0 auto 8px' }}>
          9 questions. The kind nobody usually asks. Your answers stay with you.
        </p>
        <p style={{ fontSize: '0.82rem', color: 'var(--muted)', fontStyle: 'italic', margin: '0 auto 44px', opacity: 0.7 }}>
          About 4 minutes. You can save your results at the end.
        </p>
        <Btn onClick={() => setStage('open')}>let&apos;s begin &rarr;</Btn>
      </div>
    </Page>
  )

  // ── OPEN QUESTIONS ──
  if (stage === 'open') {
    const q = openQuestions[openIdx]
    const val = openAnswers[openIdx]
    return (
      <Page progress={totalProgress}>
        <div style={{ maxWidth: 660, margin: '0 auto', width: '100%', animation: 'fadeUp 0.5s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)' }}>{openIdx + 1} of 9</span>
            <span style={{ fontSize: '0.7rem', padding: '4px 12px', borderRadius: 100, background: 'rgba(74,138,90,0.08)', color: 'var(--green)', border: '1px solid rgba(74,138,90,0.2)' }}>in your words</span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: 10 }}>{q.text}</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.7, marginBottom: 28 }}>{q.sub}</p>
          <textarea ref={textareaRef} value={val}
            onChange={e => { const u = [...openAnswers]; u[openIdx] = e.target.value; setOpenAnswers(u) }}
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) nextOpen() }}
            placeholder={q.placeholder} rows={5}
            style={{ width: '100%', padding: '1.1rem 1.2rem', background: '#FFFFFF', border: `1.5px solid ${val.trim() ? 'rgba(74,138,90,0.35)' : 'rgba(90,110,85,0.14)'}`, borderRadius: 16, resize: 'none', fontFamily: "'Syne', sans-serif", fontSize: '0.97rem', color: 'var(--ink)', lineHeight: 1.75, outline: 'none', transition: 'border-color 0.2s', boxShadow: val.trim() ? '0 2px 16px rgba(74,138,90,0.08)' : 'none', marginBottom: 8 }} />
          <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 36, opacity: 0.6 }}>{val.length > 0 ? `${val.length} characters` : 'write as much or as little as you want'}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={prevOpen} disabled={openIdx === 0} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid rgba(90,110,85,0.18)', borderRadius: 100, cursor: openIdx === 0 ? 'default' : 'pointer', color: 'var(--muted)', fontSize: '0.86rem', opacity: openIdx === 0 ? 0.4 : 1, fontFamily: "'Syne', sans-serif" }}>&larr; back</button>
            <button onClick={nextOpen} disabled={!val.trim()} style={{ padding: '0.75rem 2rem', background: val.trim() ? 'var(--ink)' : 'rgba(46,53,40,0.15)', color: val.trim() ? 'var(--bg)' : 'var(--muted)', border: 'none', borderRadius: 100, cursor: val.trim() ? 'pointer' : 'default', fontSize: '0.86rem', fontWeight: 700, fontFamily: "'Syne', sans-serif", transition: 'all 0.2s' }}>
              {openIdx === openQuestions.length - 1 ? 'next part →' : 'next →'}
            </button>
          </div>
        </div>
      </Page>
    )
  }

  // ── TRANSITION ──
  if (stage === 'transition') return (
    <Page progress={50}>
      <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center', animation: 'fadeUp 0.8s both' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 24 }}>🌿</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.03em', color: 'var(--ink)', marginBottom: 16 }}>
          now for the<br /><em style={{ fontStyle: 'italic', color: 'var(--green)' }}>quieter questions.</em>
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.8, maxWidth: 400, margin: '0 auto 40px' }}>
          The next ones are different. Just pick what feels truest — not what sounds best.
        </p>
        <Btn onClick={() => setStage('mcq')}>continue &rarr;</Btn>
      </div>
    </Page>
  )

  // ── MCQ ──
  if (stage === 'mcq') {
    const q = mcqQuestions[mcqIdx]
    return (
      <Page progress={totalProgress}>
        <div style={{ maxWidth: 660, margin: '0 auto', width: '100%', animation: 'fadeUp 0.5s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)' }}>{4 + mcqIdx + 1} of 9</span>
            <span style={{ fontSize: '0.7rem', padding: '4px 12px', borderRadius: 100, background: 'rgba(181,101,74,0.08)', color: 'var(--terracotta)', border: '1px solid rgba(181,101,74,0.2)' }}>deeper dive</span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: 10 }}>{q.text}</h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.7, marginBottom: 36 }}>{q.sub}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 48 }}>
            {q.options.map((opt, i) => {
              const selected = mcqAnswers[mcqIdx] === i
              return (
                <button key={i} onClick={() => setMcqAnswers({ ...mcqAnswers, [mcqIdx]: i })} style={{ padding: '1.1rem 1.4rem', background: selected ? 'rgba(74,138,90,0.07)' : '#FFFFFF', border: `1.5px solid ${selected ? 'rgba(74,138,90,0.4)' : 'rgba(90,110,85,0.12)'}`, borderRadius: 16, textAlign: 'left', fontSize: '0.93rem', color: selected ? 'var(--ink)' : 'rgba(46,53,40,0.7)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 12, boxShadow: selected ? '0 2px 12px rgba(74,138,90,0.1)' : 'none' }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', border: `1.5px solid ${selected ? 'var(--green)' : 'rgba(90,110,85,0.25)'}`, flexShrink: 0, background: selected ? 'var(--green)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                    {selected && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'white', display: 'block' }} />}
                  </span>
                  {opt.label}
                </button>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={prevMcq} disabled={mcqIdx === 0} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid rgba(90,110,85,0.18)', borderRadius: 100, cursor: mcqIdx === 0 ? 'default' : 'pointer', color: 'var(--muted)', fontSize: '0.86rem', opacity: mcqIdx === 0 ? 0.4 : 1, fontFamily: "'Syne', sans-serif" }}>&larr; back</button>
            <button onClick={nextMcq} disabled={mcqAnswers[mcqIdx] === undefined} style={{ padding: '0.75rem 2rem', background: mcqAnswers[mcqIdx] !== undefined ? 'var(--ink)' : 'rgba(46,53,40,0.15)', color: mcqAnswers[mcqIdx] !== undefined ? 'var(--bg)' : 'var(--muted)', border: 'none', borderRadius: 100, cursor: mcqAnswers[mcqIdx] !== undefined ? 'pointer' : 'default', fontSize: '0.86rem', fontWeight: 700, fontFamily: "'Syne', sans-serif", transition: 'all 0.2s' }}>
              {mcqIdx === mcqQuestions.length - 1 ? 'one last thing →' : 'next →'}
            </button>
          </div>
        </div>
      </Page>
    )
  }

  // ── COMMITMENT ──
  if (stage === 'commitment') return (
    <Page progress={totalProgress}>
      <div style={{ maxWidth: 620, margin: '0 auto', width: '100%', animation: 'fadeUp 0.7s both' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
          <span style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)' }}>9 of 9</span>
          <span style={{ fontSize: '0.7rem', padding: '4px 12px', borderRadius: 100, background: 'rgba(74,138,90,0.08)', color: 'var(--green)', border: '1px solid rgba(74,138,90,0.2)' }}>just for you</span>
        </div>

        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: 10 }}>
          One last thing.
        </h2>
        <p style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.8, marginBottom: 8 }}>
          How much time are you willing to give yourself to actually feel better?
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.7, marginBottom: 32, opacity: 0.7 }}>
          Not to fix everything. Just to start. There&apos;s no wrong answer — even saying 3 days means something.
        </p>

        <textarea ref={commitRef} value={commitmentText}
          onChange={e => setCommitmentText(e.target.value)}
          placeholder="e.g. 21 days, until my next semester, a month, I don't know yet..."
          rows={4}
          style={{ width: '100%', padding: '1.1rem 1.2rem', background: '#FFFFFF', border: `1.5px solid ${commitmentText.trim() ? 'rgba(74,138,90,0.35)' : 'rgba(90,110,85,0.14)'}`, borderRadius: 16, resize: 'none', fontFamily: "'Syne', sans-serif", fontSize: '0.97rem', color: 'var(--ink)', lineHeight: 1.75, outline: 'none', transition: 'border-color 0.2s', marginBottom: 8 }} />

        {commitmentText.trim() && (
          <div style={{ padding: '0.7rem 1rem', background: 'rgba(74,138,90,0.06)', border: '1px solid rgba(74,138,90,0.2)', borderRadius: 10, marginBottom: 24, fontSize: '0.82rem', color: 'var(--green)', fontWeight: 500 }}>
            ✦ we&apos;ll build your {extractDays(commitmentText)}-day recovery plan around this
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: commitmentText.trim() ? 0 : 24 }}>
          <button onClick={() => setStage('mcq')} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid rgba(90,110,85,0.18)', borderRadius: 100, cursor: 'pointer', color: 'var(--muted)', fontSize: '0.86rem', fontFamily: "'Syne', sans-serif" }}>&larr; back</button>
          <button onClick={calculate} disabled={!commitmentText.trim()}
            style={{ padding: '0.75rem 2rem', background: commitmentText.trim() ? 'var(--ink)' : 'rgba(46,53,40,0.15)', color: commitmentText.trim() ? 'var(--bg)' : 'var(--muted)', border: 'none', borderRadius: 100, cursor: commitmentText.trim() ? 'pointer' : 'default', fontSize: '0.86rem', fontWeight: 700, fontFamily: "'Syne', sans-serif", transition: 'all 0.2s' }}>
            see my results →
          </button>
        </div>
      </div>
    </Page>
  )

  // ── LOADING ──
  if (stage === 'loading') return (
    <Page progress={100}>
      <div style={{ textAlign: 'center', animation: 'fadeUp 0.6s both' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--green), var(--terracotta))', margin: '0 auto 28px', animation: 'pulse 2s ease-in-out infinite' }} />
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontStyle: 'italic', color: 'var(--ink)', marginBottom: 8 }}>reading your answers...</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--muted)', opacity: 0.7 }}>building your {commitmentDays}-day plan</p>
      </div>
    </Page>
  )

  // ── RESULT ──
  if (stage === 'result' && result) {
    const r = resultData[result.key]
    const m1 = Math.round(result.days * 0.25)
    const m2 = Math.round(result.days * 0.5)
    const m3 = Math.round(result.days * 0.75)
    return (
      <Page progress={100}>
        <div style={{ maxWidth: 660, margin: '0 auto', animation: 'fadeUp 0.8s both' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: 16 }}>{r.emoji}</span>
            <div style={{ display: 'inline-block', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: r.color, background: r.accent, border: `1px solid ${r.color}33`, borderRadius: 100, padding: '0.3rem 0.9rem', marginBottom: 14 }}>your result</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.03em', color: 'var(--ink)', marginBottom: 14 }}>{r.title}</h2>
            <p style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.8, maxWidth: 500, margin: '0 auto' }}>{r.desc}</p>
          </div>

          {/* Breakdown */}
          <div style={{ background: '#FFFFFF', borderRadius: 24, padding: '1.8rem', marginBottom: 16, border: '1px solid rgba(90,110,85,0.1)', boxShadow: '0 2px 16px rgba(80,90,70,0.06)' }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: 'var(--ink)', marginBottom: 20, fontSize: '1.05rem' }}>your burnout breakdown</p>
            {[['Exhaustion', result.dim.exhaustion, '#B5654A'], ['Mental Fatigue', result.dim.cognitive, '#7A9E5A'], ['Self-Worth', result.dim.worth, '#7A6EAA'], ['Recovery Capacity', result.dim.recovery, '#4A8A5A']].map(([l, s, c]) => (
              <div key={l as string} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 6 }}>
                  <span>{l as string}</span><span style={{ fontWeight: 600, color: 'var(--ink)' }}>{pct(s as number)}%</span>
                </div>
                <div style={{ height: 6, background: 'rgba(90,110,85,0.1)', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct(s as number)}%`, background: c as string, borderRadius: 100, transition: 'width 1s cubic-bezier(0.16,1,0.3,1)' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Recovery timeline */}
          <div style={{ background: '#FFFFFF', borderRadius: 24, padding: '1.8rem', marginBottom: 16, border: '1px solid rgba(90,110,85,0.1)', boxShadow: '0 2px 16px rgba(80,90,70,0.06)' }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: 'var(--ink)', marginBottom: 20, fontSize: '1.05rem' }}>your {result.days}-day recovery milestones</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { day: m1, label: 'First milestone', desc: 'Unlock a new animal companion 🐾', color: '#4A8A5A' },
                { day: m2, label: 'Halfway there', desc: 'Unlock custom accent colours 🎨', color: '#7A6EAA' },
                { day: m3, label: 'Almost done', desc: 'Earn your recovery badge ✦', color: '#B5654A' },
                { day: result.days, label: 'Full recovery', desc: 'Your plant becomes a tree 🌲', color: '#2E3528' },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${m.color}15`, border: `1.5px solid ${m.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'Syne',sans-serif", fontSize: '0.75rem', fontWeight: 700, color: m.color }}>
                    {m.day}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ink)' }}>{m.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save prompt */}
          <div style={{ background: 'rgba(74,138,90,0.05)', border: '1px solid rgba(74,138,90,0.15)', borderRadius: 20, padding: '1.5rem 2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink)', fontWeight: 600, marginBottom: 6 }}>Want to track your recovery over time?</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 20 }}>Save your results and start your {result.days}-day plan. Free, always.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setStage('save')} style={{ background: 'var(--ink)', color: 'var(--bg)', fontFamily: "'Syne', sans-serif", fontSize: '0.88rem', fontWeight: 700, padding: '0.75rem 1.8rem', border: 'none', borderRadius: 100, cursor: 'pointer' }}>
                save & start my plan →
              </button>
              <a href="/recovery" style={{ background: 'transparent', color: 'var(--muted)', fontFamily: "'Syne', sans-serif", fontSize: '0.88rem', fontWeight: 500, padding: '0.75rem 1.5rem', border: '1px solid rgba(90,110,85,0.18)', borderRadius: 100, textDecoration: 'none' }}>
                skip for now
              </a>
            </div>
          </div>
        </div>
      </Page>
    )
  }

  // ── SAVE ──
  if (stage === 'save') return <SaveForm onSave={handleSave} saveState={saveState} days={result?.days || 21} />

  return null
}

function Btn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? 'var(--green)' : 'var(--ink)', color: 'var(--bg)', fontFamily: "'Syne', sans-serif", fontSize: '0.95rem', fontWeight: 700, padding: '0.95rem 2.5rem', border: 'none', borderRadius: 100, cursor: 'pointer', transition: 'background 0.2s, transform 0.2s', transform: hovered ? 'translateY(-2px)' : 'none' }}>
      {children}
    </button>
  )
}

function SaveForm({ onSave, saveState, days }: { onSave: (e: string, p: string, n: boolean) => void; saveState: string; days: number }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isNew, setIsNew] = useState(true)
  return (
    <Page progress={100}>
      <div style={{ maxWidth: 420, margin: '0 auto', animation: 'fadeUp 0.7s both' }}>
        <a href="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 700, fontStyle: 'italic', color: 'var(--ink)', textDecoration: 'none', display: 'block', marginBottom: 36 }}>
          calf<span style={{ color: 'var(--green)' }}>.</span>
        </a>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 14 }}>save your results</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em', color: 'var(--ink)', marginBottom: 8 }}>
          {isNew ? <>create your<br /><em style={{ fontStyle: 'italic', color: 'var(--green)' }}>account.</em></> : <>welcome<br /><em style={{ fontStyle: 'italic', color: 'var(--green)' }}>back.</em></>}
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: 24 }}>
          {isNew ? `Your results + ${days}-day recovery plan will be saved.` : 'Sign in to save your results.'}
        </p>
        {['Email', 'Password'].map((label, idx) => (
          <div key={label} style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>{label}</label>
            <input type={idx === 1 ? 'password' : 'email'} placeholder={idx === 0 ? 'you@example.com' : '••••••••'}
              value={idx === 0 ? email : password} onChange={e => idx === 0 ? setEmail(e.target.value) : setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.85rem 1rem', background: '#FFFFFF', border: '1.5px solid rgba(90,110,85,0.14)', borderRadius: 12, fontFamily: "'Syne', sans-serif", fontSize: '0.93rem', color: 'var(--ink)', outline: 'none' }} />
          </div>
        ))}
        <button onClick={() => onSave(email, password, isNew)} disabled={saveState === 'loading' || saveState === 'done'}
          style={{ width: '100%', padding: '0.95rem', background: 'var(--ink)', color: 'var(--bg)', fontFamily: "'Syne', sans-serif", fontSize: '0.95rem', fontWeight: 700, border: 'none', borderRadius: 100, cursor: 'pointer', marginTop: 8, marginBottom: 14, opacity: saveState === 'loading' ? 0.7 : 1 }}>
          {saveState === 'loading' ? 'saving...' : saveState === 'done' ? 'saved! redirecting...' : isNew ? 'create account & save →' : 'sign in & save →'}
        </button>
        {saveState === 'error' && <p style={{ textAlign: 'center', fontSize: '0.83rem', color: 'var(--terracotta)', marginBottom: 12 }}>Something went wrong. Try again.</p>}
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

function Page({ children, progress }: { children: React.ReactNode; progress: number }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Syne:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --bg: #F5F0E8; --ink: #2E3528; --muted: rgba(46,53,40,0.5); --green: #4A8A5A; --terracotta: #B5654A; }
        html, body { min-height: 100%; }
        body { background: var(--bg); color: var(--ink); font-family: 'Syne', sans-serif; overflow-x: hidden; }
        body::before { content: ''; position: fixed; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); opacity: 0.025; pointer-events: none; z-index: 9997; }
        textarea:focus, input:focus { outline: none; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.08); opacity: 0.8; } }
      `}</style>
      {progress > 0 && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: 'rgba(90,110,85,0.1)', zIndex: 100 }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--green), var(--terracotta))', width: `${progress}%`, transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1)' }} />
        </div>
      )}
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
        {children}
      </div>
    </>
  )
}

