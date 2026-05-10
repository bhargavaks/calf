'use client'

import React, { useState, useEffect, useRef } from 'react'
import { getSupabase } from '@/lib/supabase'

// ── KEYWORD SCORING ──────────────────────────────────────────
const BURNOUT_SIGNALS: Record<string, number> = {
  tired: 2, exhausted: 3, drained: 3, empty: 3, numb: 3,
  heavy: 2, flat: 2, dead: 2, hollow: 2, broken: 3,
  collapse: 3, crash: 2, burnout: 3, burnt: 3, burned: 3,
  overwhelmed: 3, drowning: 3, suffocating: 2, barely: 2,
  anxious: 2, anxiety: 2, panic: 3, worry: 2, worried: 2,
  overthink: 2, racing: 2, spiral: 2, stuck: 2, lost: 2,
  fog: 2, foggy: 2, confused: 1, blank: 2, forget: 1,
  failure: 3, worthless: 3, useless: 3, hate: 2,
  disappoint: 2, disappointed: 2, shame: 2, ashamed: 2,
  behind: 1, failing: 2, failed: 2, inadequate: 3,
  anymore: 2, stopped: 2, miss: 2, missed: 2, forgot: 2, forgotten: 2,
  cannot: 2, gave: 1,
}

const RECOVERY_SIGNALS: Record<string, number> = {
  okay: -1, fine: -1, good: -1, well: -1, better: -1,
  excited: -2, happy: -2, enjoy: -2, love: -1, passion: -2,
  hope: -2, hopeful: -2, motivated: -2, energy: -2,
  rested: -2, calm: -2, peaceful: -2, clear: -1, ready: -1,
  grateful: -2, grounded: -2, balance: -1, balanced: -1,
}

function scoreOpenAnswers(answers: string[]) {
  const dim = { exhaustion: 0, cognitive: 0, worth: 0, recovery: 0 }
  answers.forEach((answer, idx) => {
    const words = answer.toLowerCase().split(/\s+/)
    let raw = 0
    words.forEach(word => {
      const clean = word.replace(/[^a-z']/g, '')
      if (BURNOUT_SIGNALS[clean]) raw += BURNOUT_SIGNALS[clean]
      if (RECOVERY_SIGNALS[clean]) raw += RECOVERY_SIGNALS[clean]
    })
    const len = answer.trim().length
    if (len < 30) raw += 2
    else if (len > 300) raw -= 1
    const clamped = Math.max(0, Math.min(raw, 6))
    if (idx === 0) dim.exhaustion += clamped
    if (idx === 1) dim.recovery   += clamped
    if (idx === 2) dim.cognitive  += clamped
    if (idx === 3) dim.worth      += clamped
  })
  return dim
}

// ── RECOVERY PLAN ────────────────────────────────────────────
type Week = { week: string; title: string; focus: string; tasks: string[]; why: string }

function getRecoveryPlan(key: string, dim: Record<string, number>): Week[] {
  const highExhaustion = dim.exhaustion > 5
  const highCognitive  = dim.cognitive  > 5
  const highWorth      = dim.worth      > 5

  const plans: Record<string, Week[]> = {
    stable: [
      {
        week: 'Week 1', title: "Protect what's working", focus: 'Maintenance',
        tasks: [
          'Identify one habit keeping you afloat — protect it deliberately',
          'Sleep at the same time for 5 out of 7 nights',
          'One meal a day eaten without a screen',
        ],
        why: "You're stable — the goal isn't fixing things, it's not letting small cracks widen.",
      },
      {
        week: 'Week 2', title: 'One thing just for you', focus: 'Joy',
        tasks: [
          'Revisit something you used to enjoy for 20 minutes — no outcome expected',
          'Walk somewhere new once this week',
          'Tell one person how you actually are',
        ],
        why: "Stable does not mean thriving. This week is about feeding yourself, not just managing.",
      },
    ],
    early: [
      {
        week: 'Week 1', title: 'Slow the leak', focus: highExhaustion ? 'Rest' : 'Clarity',
        tasks: highExhaustion ? [
          'Cut one non-essential commitment this week — just one',
          'No screens for the first 20 minutes after waking',
          'Sleep before midnight, 5 nights',
        ] : [
          "Write 3 lines each morning: what you're carrying, what can wait, what matters today",
          'One 15-min walk without headphones',
          'Say no to one thing this week without explaining yourself',
        ],
        why: "Early strain is the easiest to reverse — but only if you act before it compounds.",
      },
      {
        week: 'Week 2', title: 'Find the edges', focus: 'Boundaries',
        tasks: [
          'Identify one thing that drains you every week — what would less of it look like?',
          'Eat a real breakfast 4 out of 7 days',
          highCognitive
            ? 'Before bed: write down 3 things your brain is holding — then close the notebook'
            : 'Turn off academic notifications after 9pm',
        ],
        why: "Burnout grows in the gaps between what we say yes to and what we actually have left to give.",
      },
      {
        week: 'Week 3', title: 'Rebuild one good thing', focus: 'Recovery',
        tasks: [
          'One thing you gave up that you miss — give it 30 minutes, no pressure',
          "Text someone you haven't spoken to in a while",
          highWorth
            ? "Write down one thing you did well this week — doesn't have to be academic"
            : 'Do something purely for fun, that produces nothing',
        ],
        why: "You're not rebuilding your life — just reconnecting with one small piece of who you were before this got heavy.",
      },
    ],
    depleted: [
      {
        week: 'Week 1', title: 'Just survive, gently', focus: 'Rest',
        tasks: [
          "Remove one obligation that isn't load-bearing this week",
          'Sleep first — alarms as late as you can afford them',
          "Eat something warm once a day, even if it's small",
          'No guilt about productivity this week — rest is the work',
        ],
        why: "You're running on fumes. The first step isn't doing more — it's stopping the drain.",
      },
      {
        week: 'Week 2', title: 'One human connection', focus: 'Support',
        tasks: [
          "Tell one person you trust that you're not okay — you don't have to explain everything",
          'Spend 30 minutes outside, even if you just sit there',
          highCognitive
            ? 'Brain dump before bed — everything in your head onto paper, then shut the book'
            : 'Pick one thing to stop doing for the next 2 weeks',
        ],
        why: "Depletion grows in isolation. You don't need to fix anything — just let someone know where you are.",
      },
      {
        week: 'Week 3', title: 'Stabilise one thing', focus: 'Structure',
        tasks: [
          'Pick one consistent wake time — just one anchor point',
          "What's the one academic task causing most dread? Can any part be delayed or simplified?",
          highWorth
            ? 'Write: "Before college, I was someone who___" — just to remember'
            : '20 minutes on something unrelated to your degree',
        ],
        why: "After rest and connection, structure helps. One anchor point creates stability without pressure.",
      },
      {
        week: 'Week 4', title: 'Tiny forward motion', focus: 'Gentle momentum',
        tasks: [
          "One thing you've been avoiding — do just the first 5 minutes of it",
          'Revisit something creative or physical you used to do',
          'Notice: what does a slightly better day feel like? Write it down.',
        ],
        why: "You're not bouncing back — you're slowly rebuilding. Small wins compound.",
      },
    ],
    severe: [
      {
        week: 'Week 1', title: 'Stop. Genuinely.', focus: 'Emergency rest',
        tasks: [
          'Cancel or defer everything non-essential — no apology needed',
          'Sleep as much as your body asks for',
          "Tell at least one person what's going on — a friend, a counsellor, anyone",
          "Eat something. Drink water. That's enough for now.",
        ],
        why: "This level of exhaustion doesn't respond to willpower. Your only job this week is to stop depleting.",
      },
      {
        week: 'Week 2', title: 'Find one anchor', focus: 'Safety',
        tasks: [
          "Contact your university's student support or counselling service",
          'Identify one person who can check in on you — tell them',
          "One thing outside today that isn't studying. 10 minutes is enough.",
          highCognitive
            ? 'Try box breathing before sleep: 4 in, 4 hold, 4 out, 4 hold'
            : 'Write a list of things that are not your fault',
        ],
        why: "Severe burnout needs external support — not just self-management. Please don't carry this alone.",
      },
      {
        week: 'Week 3', title: "Reduce, don't optimise", focus: 'Triage',
        tasks: [
          'Triage your academic load: what is genuinely urgent vs what just feels urgent?',
          'One meal cooked or ordered that you actually enjoy',
          highWorth
            ? 'Write: "I am more than my grades because___" — even if you don't believe it yet'
            : 'Spend time with someone who makes you feel like yourself',
        ],
        why: "At this stage, the goal isn't performance — it's damage limitation and slow stabilisation.",
      },
      {
        week: 'Week 4', title: 'One small thing back', focus: 'Reconstruction',
        tasks: [
          'One thing you used to love — give it 20 minutes, no outcome required',
          'Set one boundary around academic work: a stop time, a no-phone zone, anything',
          "Check in: are you sleeping more? Is food easier? Write what's shifted.",
        ],
        why: "Recovery from severe burnout takes months, not weeks. This isn't the finish line — it's the beginning of the return.",
      },
    ],
  }

  return plans[key] ?? plans.early
}

// ── QUESTIONS ────────────────────────────────────────────────
const openQuestions = [
  {
    id: 1,
    text: "When was the last time a day felt genuinely easy?",
    sub: "Not productive, not successful — just light. Like you weren't carrying anything.",
    placeholder: "Take your time. There's no right answer here...",
  },
  {
    id: 2,
    text: "What do you actually do when you're not studying or in class?",
    sub: "Your real answer, not the ideal one.",
    placeholder: "Be honest with yourself...",
  },
  {
    id: 3,
    text: "If you had a completely free week — no deadlines, no obligations — what would you feel?",
    sub: "Not what you'd do. What you'd actually feel, in your body, in the first few minutes.",
    placeholder: "Relief? Anxiety? Something else?",
  },
  {
    id: 4,
    text: "Why do you think you're here today?",
    sub: "Something brought you to this page. What was it?",
    placeholder: "Write whatever comes to mind...",
  },
]

const mcqQuestions = [
  {
    id: 5, area: 'cognitive',
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
    id: 6, area: 'worth',
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
    id: 7, area: 'worth',
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
    id: 8, area: 'exhaustion',
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

// ── RESULT DATA ──────────────────────────────────────────────
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
    desc: "You've been giving from a tank that's been dry for a while. Rest isn't optional right now — it's the work. What you're feeling is real, and it makes sense.",
    color: '#B5654A', accent: 'rgba(181,101,74,0.1)',
  },
  severe: {
    emoji: '🌫️',
    title: "You're deeply exhausted.",
    desc: "This level of burnout doesn't fix itself with a good night's sleep. Real rest, real support, and real honesty about what needs to change — that's what this takes. Please don't carry this alone.",
    color: '#7A4A8A', accent: 'rgba(122,74,138,0.1)',
  },
}

// ── MAIN COMPONENT ───────────────────────────────────────────
export default function Assessment() {
  const [stage, setStage] = useState<'intro' | 'open' | 'transition' | 'mcq' | 'loading' | 'result' | 'save'>('intro')
  const [openIdx, setOpenIdx] = useState(0)
  const [openAnswers, setOpenAnswers] = useState<string[]>(['', '', '', ''])
  const [mcqIdx, setMcqIdx] = useState(0)
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, number>>({})
  const [result, setResult] = useState<{ key: string; dim: Record<string, number> } | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [showTimetable, setShowTimetable] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (stage === 'open' && textareaRef.current) textareaRef.current.focus()
  }, [stage, openIdx])

  const nextOpen = () => {
    if (!openAnswers[openIdx].trim()) return
    if (openIdx === openQuestions.length - 1) { setStage('transition'); return }
    setOpenIdx(openIdx + 1)
  }

  const prevOpen = () => { if (openIdx > 0) setOpenIdx(openIdx - 1) }

  const nextMcq = () => {
    if (mcqAnswers[mcqIdx] === undefined) return
    if (mcqIdx === mcqQuestions.length - 1) { calculate(); return }
    setMcqIdx(mcqIdx + 1)
  }

  const prevMcq = () => { if (mcqIdx > 0) setMcqIdx(mcqIdx - 1) }

  const calculate = () => {
    setStage('loading')
    const dim = { exhaustion: 0, cognitive: 0, worth: 0, recovery: 0 }

    // MCQ scores mapped to correct dimensions
    mcqQuestions.forEach((q, i) => {
      if (mcqAnswers[i] !== undefined) {
        const score = q.options[mcqAnswers[i]].score
        if (q.area === 'cognitive')  dim.cognitive  += score
        if (q.area === 'worth')      dim.worth      += score
        if (q.area === 'exhaustion') dim.exhaustion += score
      }
    })

    // Open answer keyword scores
    const openDim = scoreOpenAnswers(openAnswers)
    dim.exhaustion = Math.min(dim.exhaustion + openDim.exhaustion, 9)
    dim.cognitive  = Math.min(dim.cognitive  + openDim.cognitive,  9)
    dim.worth      = Math.min(dim.worth      + openDim.worth,      9)
    dim.recovery   = Math.min(openDim.recovery, 9)

    // Score out of 36 total (4 dims × max 9)
    const total = Math.round(
      ((dim.exhaustion + dim.cognitive + dim.worth + dim.recovery) / 36) * 100
    )
    const key = total <= 20 ? 'stable'
               : total <= 42 ? 'early'
               : total <= 67 ? 'depleted'
               : 'severe'

    setTimeout(() => { setResult({ key, dim }); setStage('result') }, 2000)
  }

  const handleSave = async (email: string, password: string, isNew: boolean) => {
    const supabase = getSupabase()
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

  const pct = (score: number) => Math.round((score / 9) * 100)
  const totalProgress = stage === 'open'
    ? ((openIdx + 1) / 8) * 100
    : stage === 'mcq' ? ((4 + mcqIdx + 1) / 8) * 100 : 0

  // ── INTRO ──
  if (stage === 'intro') return (
    <Page progress={0}>
      <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', animation: 'fadeUp 0.8s both' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--green)', border: '1.5px solid rgba(74,138,90,0.25)', borderRadius: 100, padding: '0.3rem 0.9rem', marginBottom: 28, background: 'rgba(74,138,90,0.07)' }}>
          🌿 burnout assessment
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.2rem, 6vw, 4rem)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.03em', color: 'var(--ink)', marginBottom: 20 }}>
          how are you<br /><em style={{ fontStyle: 'italic', color: 'var(--green)' }}>actually</em> doing?
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.8, maxWidth: 440, margin: '0 auto 8px' }}>
          8 questions. The first 4 are yours to answer in your own words. The last 4 are quick.
        </p>
        <p style={{ fontSize: '0.82rem', color: 'var(--muted)', fontStyle: 'italic', margin: '0 auto 44px', opacity: 0.7 }}>
          Takes about 3 minutes. You can save your results at the end.
        </p>
        <Btn onClick={() => setStage('open')}>begin &rarr;</Btn>
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
            <span style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              {openIdx + 1} of 8
            </span>
            <span style={{ fontSize: '0.7rem', padding: '4px 12px', borderRadius: 100, background: 'rgba(74,138,90,0.08)', color: 'var(--green)', border: '1px solid rgba(74,138,90,0.2)' }}>
              in your words
            </span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: 10 }}>
            {q.text}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.7, marginBottom: 28 }}>
            {q.sub}
          </p>
          <textarea
            ref={textareaRef}
            value={val}
            onChange={e => {
              const updated = [...openAnswers]
              updated[openIdx] = e.target.value
              setOpenAnswers(updated)
            }}
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) nextOpen() }}
            placeholder={q.placeholder}
            rows={5}
            style={{
              width: '100%', padding: '1.1rem 1.2rem',
              background: '#FFFFFF',
              border: `1.5px solid ${val.trim() ? 'rgba(74,138,90,0.35)' : 'rgba(90,110,85,0.14)'}`,
              borderRadius: 16, resize: 'none',
              fontFamily: "'Syne', sans-serif", fontSize: '0.97rem',
              color: 'var(--ink)', lineHeight: 1.75,
              outline: 'none', transition: 'border-color 0.2s',
              boxShadow: val.trim() ? '0 2px 16px rgba(74,138,90,0.08)' : 'none',
              marginBottom: 8,
            }}
          />
          <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 36, opacity: 0.6 }}>
            {val.length > 0 ? `${val.length} characters` : 'press ⌘ + Enter to continue'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={prevOpen} disabled={openIdx === 0}
              style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid rgba(90,110,85,0.18)', borderRadius: 100, cursor: openIdx === 0 ? 'default' : 'pointer', color: 'var(--muted)', fontSize: '0.86rem', opacity: openIdx === 0 ? 0.4 : 1, fontFamily: "'Syne', sans-serif" }}>
              &larr; back
            </button>
            <button onClick={nextOpen} disabled={!val.trim()}
              style={{ padding: '0.75rem 2rem', background: val.trim() ? 'var(--ink)' : 'rgba(46,53,40,0.15)', color: val.trim() ? 'var(--bg)' : 'var(--muted)', border: 'none', borderRadius: 100, cursor: val.trim() ? 'pointer' : 'default', fontSize: '0.86rem', fontWeight: 700, fontFamily: "'Syne', sans-serif", transition: 'all 0.2s' }}>
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
          The next 4 go a little deeper. Parts of your life you might not have checked in with lately. Just pick what feels truest.
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
            <span style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              {4 + mcqIdx + 1} of 8
            </span>
            <span style={{ fontSize: '0.7rem', padding: '4px 12px', borderRadius: 100, background: 'rgba(181,101,74,0.08)', color: 'var(--terracotta)', border: '1px solid rgba(181,101,74,0.2)' }}>
              deeper dive
            </span>
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: 10 }}>
            {q.text}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.7, marginBottom: 36 }}>
            {q.sub}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 48 }}>
            {q.options.map((opt, i) => {
              const selected = mcqAnswers[mcqIdx] === i
              return (
                <button key={i} onClick={() => setMcqAnswers({ ...mcqAnswers, [mcqIdx]: i })} style={{
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={prevMcq} disabled={mcqIdx === 0}
              style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid rgba(90,110,85,0.18)', borderRadius: 100, cursor: mcqIdx === 0 ? 'default' : 'pointer', color: 'var(--muted)', fontSize: '0.86rem', opacity: mcqIdx === 0 ? 0.4 : 1, fontFamily: "'Syne', sans-serif" }}>
              &larr; back
            </button>
            <button onClick={nextMcq} disabled={mcqAnswers[mcqIdx] === undefined}
              style={{ padding: '0.75rem 2rem', background: mcqAnswers[mcqIdx] !== undefined ? 'var(--ink)' : 'rgba(46,53,40,0.15)', color: mcqAnswers[mcqIdx] !== undefined ? 'var(--bg)' : 'var(--muted)', border: 'none', borderRadius: 100, cursor: mcqAnswers[mcqIdx] !== undefined ? 'pointer' : 'default', fontSize: '0.86rem', fontWeight: 700, fontFamily: "'Syne', sans-serif", transition: 'all 0.2s' }}>
              {mcqIdx === mcqQuestions.length - 1 ? 'see results →' : 'next →'}
            </button>
          </div>
        </div>
      </Page>
    )
  }

  // ── LOADING ──
  if (stage === 'loading') return (
    <Page progress={100}>
      <div style={{ textAlign: 'center', animation: 'fadeUp 0.6s both' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--green), var(--terracotta))', margin: '0 auto 28px', animation: 'pulse 2s ease-in-out infinite' }} />
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontStyle: 'italic', color: 'var(--ink)' }}>
          reading your answers...
        </p>
      </div>
    </Page>
  )

  // ── RESULT ──
  if (stage === 'result' && result) {
    const r = resultData[result.key]
    const plan = getRecoveryPlan(result.key, result.dim)

    return (
      <Page progress={100}>
        <div style={{ maxWidth: 660, margin: '0 auto', animation: 'fadeUp 0.8s both' }}>

          {/* Header */}
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

          {/* Burnout breakdown */}
          <div style={{ background: '#FFFFFF', borderRadius: 24, padding: '2rem', marginBottom: 24, border: '1px solid rgba(90,110,85,0.1)', boxShadow: '0 2px 16px rgba(80,90,70,0.06)' }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: 'var(--ink)', marginBottom: 24, fontSize: '1.05rem' }}>your burnout breakdown</p>
            {([
              ['Exhaustion',        result.dim.exhaustion, '#B5654A'],
              ['Mental Fatigue',    result.dim.cognitive,  '#7A9E5A'],
              ['Self-Worth',        result.dim.worth,      '#7A6EAA'],
              ['Recovery Capacity', result.dim.recovery,   '#4A8A5A'],
            ] as [string, number, string][]).map(([label, score, color]) => (
              <div key={label} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 7 }}>
                  <span>{label}</span>
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{pct(score)}%</span>
                </div>
                <div style={{ height: 6, background: 'rgba(90,110,85,0.1)', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct(score)}%`, background: color, borderRadius: 100, transition: 'width 1s cubic-bezier(0.16,1,0.3,1)' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Recovery Timetable */}
          <div style={{ marginBottom: 24 }}>
            <button
              onClick={() => setShowTimetable(!showTimetable)}
              style={{
                width: '100%', padding: '1.1rem 1.6rem',
                background: showTimetable ? 'var(--ink)' : '#FFFFFF',
                color: showTimetable ? 'var(--bg)' : 'var(--ink)',
                border: '1.5px solid rgba(90,110,85,0.15)',
                borderRadius: 20, cursor: 'pointer',
                fontFamily: "'Playfair Display', serif",
                fontSize: '1rem', fontStyle: 'italic',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'all 0.25s',
              }}
            >
              <span>your recovery timetable</span>
              <span style={{ fontSize: '0.8rem', fontStyle: 'normal', fontFamily: "'Syne', sans-serif", opacity: 0.6 }}>
                {showTimetable ? '↑ hide' : '↓ show'}
              </span>
            </button>

            {showTimetable && (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeUp 0.4s both' }}>
                {plan.map((week, i) => (
                  <div key={i} style={{
                    background: '#FFFFFF',
                    border: '1px solid rgba(90,110,85,0.1)',
                    borderRadius: 20,
                    padding: '1.5rem 1.8rem',
                    boxShadow: '0 2px 12px rgba(80,90,70,0.04)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: r.color, display: 'block', marginBottom: 4 }}>
                          {week.week}
                        </span>
                        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1.2 }}>
                          {week.title}
                        </p>
                      </div>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em',
                        textTransform: 'uppercase', color: r.color,
                        background: r.accent, border: `1px solid ${r.color}33`,
                        borderRadius: 100, padding: '0.25rem 0.75rem',
                        whiteSpace: 'nowrap', marginLeft: 12,
                      }}>
                        {week.focus}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                      {week.tasks.map((task, j) => (
                        <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <span style={{ color: r.color, fontSize: '0.75rem', marginTop: 3, flexShrink: 0 }}>◆</span>
                          <p style={{ fontSize: '0.88rem', color: 'var(--ink)', lineHeight: 1.6 }}>{task}</p>
                        </div>
                      ))}
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.65, borderTop: '1px solid rgba(90,110,85,0.08)', paddingTop: 12 }}>
                      {week.why}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save CTA */}
          <div style={{ background: 'rgba(74,138,90,0.05)', border: '1px solid rgba(74,138,90,0.15)', borderRadius: 20, padding: '1.5rem 2rem', marginBottom: 24, textAlign: 'center' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink)', fontWeight: 600, marginBottom: 6 }}>Want to track your recovery over time?</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: 20 }}>Save your results to see how you improve. Free, always.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setStage('save')} style={{ background: 'var(--ink)', color: 'var(--bg)', fontFamily: "'Syne', sans-serif", fontSize: '0.88rem', fontWeight: 700, padding: '0.75rem 1.8rem', border: 'none', borderRadius: 100, cursor: 'pointer' }}>
                save my results →
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
  if (stage === 'save') return <SaveForm onSave={handleSave} saveState={saveState} />

  return null
}

// ── HELPERS ──────────────────────────────────────────────────
function Btn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? 'var(--green)' : 'var(--ink)', color: 'var(--bg)', fontFamily: "'Syne', sans-serif", fontSize: '0.95rem', fontWeight: 700, padding: '0.95rem 2.5rem', border: 'none', borderRadius: 100, cursor: 'pointer', transition: 'background 0.2s, transform 0.2s', transform: hovered ? 'translateY(-2px)' : 'none' }}>
      {children}
    </button>
  )
}

function SaveForm({ onSave, saveState }: { onSave: (email: string, password: string, isNew: boolean) => void; saveState: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isNew, setIsNew] = useState(true)

  return (
    <Page progress={100}>
      <div style={{ maxWidth: 420, margin: '0 auto', animation: 'fadeUp 0.7s both' }}>
        <a href="/" style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 700, fontStyle: 'italic', color: 'var(--ink)', textDecoration: 'none', display: 'block', marginBottom: 40 }}>
          calf<span style={{ color: 'var(--green)' }}>.</span>
        </a>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 16 }}>save your results</div>
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

        <button onClick={() => onSave(email, password, isNew)} disabled={saveState === 'loading' || saveState === 'done'}
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

function Page({ children, progress }: { children: React.ReactNode; progress: number }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Syne:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --bg: #F5F0E8; --ink: #2E3528; --muted: rgba(46,53,40,0.5); --green: #4A8A5A; --terracotta: #B5654A; --border: rgba(90,110,85,0.12); }
        html, body { min-height: 100%; }
        body { background: var(--bg); color: var(--ink); font-family: 'Syne', sans-serif; overflow-x: hidden; }
        body::before { content: ''; position: fixed; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); opacity: 0.025; pointer-events: none; z-index: 9997; }
        textarea:focus { outline: none; }
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
