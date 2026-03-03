'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const questions = [
  { id:1, area:'exhaustion', badge:'Study Exhaustion', text:"After finishing exams or a heavy study period, how long does it take to feel genuinely okay again?", sub:"Not just physically rested — mentally light, able to enjoy things, present.", options:[{label:"A day or two and I'm back to myself",score:0},{label:"About a week of proper rest",score:1},{label:"Several weeks — the emptiness lingers",score:2},{label:"I'm not sure I've ever fully recovered",score:3}] },
  { id:2, area:'cognitive', badge:'Mental Fatigue', text:"How would you describe your ability to concentrate on things you actually want to do right now?", sub:"Not studying — things you choose freely.", options:[{label:"Pretty good — I can focus when I want to",score:0},{label:"A bit scattered but manageable",score:1},{label:"Difficult — my mind drifts constantly",score:2},{label:"Almost impossible — even enjoyable things feel like effort",score:3}] },
  { id:3, area:'worth', badge:'Self-Worth', text:"How much of your sense of self-worth depends on how well you perform academically?", sub:"When you get a bad grade — how much does it affect how you feel about yourself?", options:[{label:"Not much — grades don't define me",score:0},{label:"Somewhat — it stings but I recover quickly",score:1},{label:"A lot — bad results genuinely shake me",score:2},{label:"Almost entirely — I feel worthless when I fail",score:3}] },
  { id:4, area:'exhaustion', badge:'Study Exhaustion', text:"When you sit down to study, what happens in your body and mind before you even start?", sub:"The moment you open a textbook or sit at your desk.", options:[{label:"I feel ready, maybe a little distracted",score:0},{label:"Some resistance, but I push through",score:1},{label:"Dread, heaviness, or a strong urge to escape",score:2},{label:"A complete shutdown — numbness or panic",score:3}] },
  { id:5, area:'recovery', badge:'Recovery Capacity', text:"Do you have things in your life right now that genuinely restore you?", sub:"Real restoration, not just distraction.", options:[{label:"Yes — several things that really help",score:0},{label:"A few, though I don't use them enough",score:1},{label:"Barely any — most things feel hollow",score:2},{label:"Nothing feels restorative right now",score:3}] },
  { id:6, area:'cognitive', badge:'Mental Fatigue', text:"How often do you experience physical signs of mental overload — headaches, brain fog, poor sleep?", sub:"Your body often signals burnout before your mind admits it.", options:[{label:"Rarely — I feel physically okay",score:0},{label:"Occasionally, especially before exams",score:1},{label:"Regularly — it's become my new normal",score:2},{label:"Almost constantly",score:3}] },
  { id:7, area:'worth', badge:'Self-Worth', text:"When you imagine taking time off studying — a full guilt-free rest — what do you feel?", sub:"Not what you think you should feel. What actually comes up.", options:[{label:"Relief — I'd welcome it",score:0},{label:"Mixed — I'd enjoy it but feel a bit guilty",score:1},{label:"Mostly guilt — I'd feel like I was falling behind",score:2},{label:"I can't even picture it — resting feels impossible",score:3}] },
  { id:8, area:'recovery', badge:'Recovery Capacity', text:"Looking at the last month, how connected have you felt to people around you?", sub:"Genuine connection, not just being physically present.", options:[{label:"Well connected — relationships feel good",score:0},{label:"A bit withdrawn but I reach out sometimes",score:1},{label:"Largely isolated — I've pulled back a lot",score:2},{label:"Completely detached — just going through motions",score:3}] }
]

export default function Assessment() {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [stage, setStage] = useState('intro')
  const [result, setResult] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (supabase) {
      supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    }
  }, [])

  const selectOption = (i) => setAnswers({...answers, [current]: i})

  const next = () => {
    if (answers[current] === undefined) return
    if (current === questions.length - 1) { calculate(); return }
    setCurrent(current + 1)
  }

  const prev = () => { if (current > 0) setCurrent(current - 1) }

  const calculate = async () => {
    setStage('loading')
    let dim = {exhaustion:0, cognitive:0, worth:0, recovery:0}
    questions.forEach((q,i) => { dim[q.area] += answers[i] !== undefined ? q.options[answers[i]].score : 0 })
    const total = Math.round(((dim.exhaustion+dim.cognitive+dim.worth+dim.recovery)/24)*100)
    const key = total<=20?'stable':total<=42?'early':total<=67?'depleted':'severe'

    if (user && supabase) {
      await supabase.from('users_progress').insert({
        user_id: user.id,
        exhaustion_score: dim.exhaustion,
        cognitive_score: dim.cognitive,
        worth_score: dim.worth,
        recovery_score: dim.recovery,
        result_type: key,
        created_at: new Date()
      })
    }

    setResult({ key, dim, total })
    setStage('result')
  }

  const resultData = {
    stable: { emoji:'☀️', title:"You're holding up well.", desc:"Your responses suggest you're managing academic pressure without it breaking you down. Keep protecting your recovery habits.", color:'#8A9E85' },
    early: { emoji:'🌿', title:"Early signs are there. Don't ignore them.", desc:"You're functioning but there's strain beneath the surface. This is the best time to step in before it goes deeper.", color:'#C4A882' },
    depleted: { emoji:'🍂', title:"You're running on empty.", desc:"You've been giving from a tank that's been dry for a while. Rest is not optional right now — it's urgent.", color:'#C9948A' },
    severe: { emoji:'🌫️', title:"You're deeply exhausted. This is serious.", desc:"Deep burnout needs real rest, real support, and honesty about what needs to change. Please don't carry this alone.", color:'#6B4F3A' }
  }

  if (stage === 'intro') return (
    <div style={{minHeight:'100vh', background:'#F5F0E8', display:'flex', alignItems:'center', justifyContent:'center', padding:'28px', fontFamily:'sans-serif'}}>
      <div style={{maxWidth:'560px', textAlign:'center'}}>
        <p style={{fontSize:'0.72rem', letterSpacing:'0.25em', textTransform:'uppercase', color:'#C9948A', marginBottom:'20px'}}>Academic Burnout Assessment</p>
        <h1 style={{fontFamily:'Georgia', fontSize:'2.8rem', color:'#6B4F3A', marginBottom:'20px', lineHeight:'1.1'}}>How depleted has studying actually left you?</h1>
        <p style={{color:'#5C4A38', lineHeight:'1.9', marginBottom:'12px'}}>8 honest questions. No wrong answers. Just a clearer picture of where you are.</p>
        <p style={{fontSize:'0.82rem', color:'#9C8878', fontStyle:'italic', marginBottom:'40px'}}>3 minutes. Your results are saved to your account.</p>
        <button onClick={() => setStage('questions')} style={{background:'#6B4F3A', color:'white', padding:'17px 52px', border:'none', borderRadius:'100px', fontSize:'1rem', cursor:'pointer'}}>Begin Assessment →</button>
      </div>
    </div>
  )

  if (stage === 'questions') {
    const q = questions[current]
    const progress = ((current + 1) / questions.length) * 100
    return (
      <div style={{minHeight:'100vh', background:'#F5F0E8', fontFamily:'sans-serif'}}>
        <div style={{height:'3px', background:'rgba(196,168,130,0.2)', position:'fixed', top:0, left:0, right:0, zIndex:100}}>
          <div style={{height:'100%', background:'linear-gradient(90deg, #C9948A, #C4A882)', width:`${progress}%`, transition:'width 0.5s'}}></div>
        </div>
        <div style={{maxWidth:'680px', margin:'0 auto', padding:'80px 28px'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'44px'}}>
            <span style={{fontSize:'0.74rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'#9C8878'}}>Question {q.id} of {questions.length}</span>
            <span style={{fontSize:'0.7rem', padding:'5px 14px', borderRadius:'100px', background:'rgba(196,168,130,0.15)', color:'#6B4F3A'}}>{q.badge}</span>
          </div>
          <h2 style={{fontFamily:'Georgia', fontSize:'1.8rem', color:'#6B4F3A', marginBottom:'10px', lineHeight:'1.3'}}>{q.text}</h2>
          <p style={{fontSize:'0.86rem', color:'#9C8878', fontStyle:'italic', marginBottom:'40px', lineHeight:'1.65'}}>{q.sub}</p>
          <div style={{display:'flex', flexDirection:'column', gap:'12px', marginBottom:'44px'}}>
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => selectOption(i)} style={{padding:'18px 24px', background: answers[current]===i ? 'rgba(201,148,138,0.09)' : '#FBF8F3', border: answers[current]===i ? '1.5px solid #C9948A' : '1.5px solid rgba(196,168,130,0.22)', borderRadius:'14px', textAlign:'left', fontSize:'0.93rem', color: answers[current]===i ? '#6B4F3A' : '#5C4A38', cursor:'pointer', transition:'all 0.25s'}}>
                {opt.label}
              </button>
            ))}
          </div>
          <div style={{display:'flex', justifyContent:'space-between'}}>
            <button onClick={prev} disabled={current===0} style={{padding:'13px 26px', background:'transparent', border:'1px solid rgba(196,168,130,0.3)', borderRadius:'100px', cursor:'pointer', color:'#9C8878', fontSize:'0.86rem'}}>← Back</button>
            <button onClick={next} style={{padding:'13px 34px', background: answers[current]!==undefined ? '#6B4F3A' : '#ccc', color:'white', border:'none', borderRadius:'100px', cursor: answers[current]!==undefined ? 'pointer' : 'default', fontSize:'0.86rem'}}>
              {current === questions.length-1 ? 'See Results →' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (stage === 'loading') return (
    <div style={{minHeight:'100vh', background:'#F5F0E8', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:'sans-serif'}}>
      <div style={{width:'72px', height:'72px', borderRadius:'50%', background:'radial-gradient(circle at 35% 35%, #C4A882, #C9948A)', marginBottom:'28px'}}></div>
      <p style={{fontFamily:'Georgia', fontSize:'1.3rem', fontStyle:'italic', color:'#6B4F3A'}}>Reading your responses...</p>
    </div>
  )

  if (stage === 'result' && result) {
    const r = resultData[result.key]
    const pct = (score) => Math.round((score/6)*100)
    return (
      <div style={{minHeight:'100vh', background:'#F5F0E8', fontFamily:'sans-serif', padding:'60px 28px 100px'}}>
        <div style={{maxWidth:'680px', margin:'0 auto'}}>
          <div style={{textAlign:'center', marginBottom:'48px'}}>
            <span style={{fontSize:'3.5rem', display:'block', marginBottom:'16px'}}>{r.emoji}</span>
            <p style={{fontSize:'0.7rem', letterSpacing:'0.25em', textTransform:'uppercase', color:'#C9948A', marginBottom:'12px'}}>Your Result</p>
            <h2 style={{fontFamily:'Georgia', fontSize:'2.2rem', color:'#6B4F3A', marginBottom:'16px', lineHeight:'1.2'}}>{r.title}</h2>
            <p style={{color:'#5C4A38', lineHeight:'1.9', maxWidth:'520px', margin:'0 auto'}}>{r.desc}</p>
          </div>
          <div style={{background:'white', borderRadius:'24px', padding:'36px', marginBottom:'24px', border:'1px solid rgba(196,168,130,0.18)'}}>
            <p style={{fontFamily:'Georgia', fontStyle:'italic', color:'#6B4F3A', marginBottom:'24px'}}>Your burnout dimensions</p>
            {[['Study & Exam Exhaustion', result.dim.exhaustion, '#C9948A'],['Mental & Cognitive Fatigue', result.dim.cognitive, '#C4A882'],['Self-Worth vs Performance', result.dim.worth, '#8A9E85'],['Recovery Capacity', result.dim.recovery, '#6B4F3A']].map(([label, score, color]) => (
              <div key={label} style={{marginBottom:'16px'}}>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.83rem', color:'#5C4A38', marginBottom:'7px'}}>
                  <span>{label}</span><span style={{fontWeight:'500', color:'#6B4F3A'}}>{pct(score)}%</span>
                </div>
                <div style={{height:'7px', background:'rgba(196,168,130,0.18)', borderRadius:'100px', overflow:'hidden'}}>
                  <div style={{height:'100%', width:`${pct(score)}%`, background:color, borderRadius:'100px'}}></div>
                </div>
              </div>
            ))}
          </div>
          <div style={{display:'flex', gap:'14px', flexWrap:'wrap'}}>
            <a href="/recovery" style={{background:'#6B4F3A', color:'white', padding:'15px 34px', borderRadius:'100px', textDecoration:'none', fontSize:'0.9rem'}}>See Recovery Program →</a>
            <a href="/dashboard" style={{background:'transparent', color:'#5C4A38', padding:'15px 34px', border:'1px solid rgba(196,168,130,0.4)', borderRadius:'100px', textDecoration:'none', fontSize:'0.9rem'}}>View Dashboard</a>
          </div>
        </div>
      </div>
    )
  }
}
```

Save, then:
```
git add .
git commit -m "fix assessment page"
git push
