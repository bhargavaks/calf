import Link from 'next/link'

export default function Recovery() {
  return (
    <div style={{fontFamily:'Georgia', background:'#F5F0E8', minHeight:'100vh'}}>

      {/* NAV */}
      <nav style={{position:'fixed', top:0, left:0, right:0, zIndex:100, padding:'20px 48px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(245,240,232,0.9)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(196,168,130,0.15)'}}>
        <Link href="/" style={{fontSize:'1.4rem', fontWeight:'600', color:'#6B4F3A', textDecoration:'none'}}>Calf</Link>
        <div style={{display:'flex', gap:'32px', alignItems:'center'}}>
          <Link href="/assessment" style={{color:'#5C4A38', textDecoration:'none', fontSize:'0.85rem', fontFamily:'sans-serif'}}>Assessment</Link>
          <Link href="/dashboard" style={{color:'#5C4A38', textDecoration:'none', fontSize:'0.85rem', fontFamily:'sans-serif'}}>Dashboard</Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{minHeight:'100vh', background:'#6B4F3A', display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:'0 80px 80px', position:'relative', overflow:'hidden'}}>
        <div style={{position:'absolute', inset:0, background:'radial-gradient(ellipse 70% 60% at 80% 30%, rgba(201,148,138,0.35), transparent), radial-gradient(ellipse 50% 70% at 10% 80%, rgba(138,158,133,0.2), transparent)'}}></div>
        <div style={{position:'absolute', fontSize:'18rem', fontStyle:'italic', color:'rgba(255,255,255,0.03)', top:'50%', left:'50%', transform:'translate(-50%,-50%)', whiteSpace:'nowrap', userSelect:'none'}}>Recovery</div>
        <div style={{position:'relative', zIndex:2, maxWidth:'680px'}}>
          <p style={{fontSize:'0.72rem', letterSpacing:'0.25em', textTransform:'uppercase', color:'#C4A882', marginBottom:'24px', fontFamily:'sans-serif'}}>The Recovery Program</p>
          <h1 style={{fontSize:'clamp(3rem, 6vw, 5rem)', lineHeight:'1.05', color:'#F5F0E8', marginBottom:'28px', fontWeight:'500'}}>Four stages.<br/><span style={{fontStyle:'italic', color:'#C4A882'}}>One return to yourself.</span></h1>
          <p style={{fontSize:'1rem', lineHeight:'1.85', color:'rgba(245,240,232,0.65)', maxWidth:'520px', marginBottom:'48px', fontFamily:'sans-serif'}}>Academic burnout doesn't fix itself with a long weekend. Real recovery is a process — and it has a shape.</p>
          <div style={{display:'flex', gap:'12px', flexWrap:'wrap'}}>
            {['01 Recognize','02 Rest','03 Rebuild','04 Reclaim'].map(s => (
              <a key={s} href={`#${s.split(' ')[1].toLowerCase()}`} style={{padding:'10px 22px', borderRadius:'100px', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(245,240,232,0.7)', textDecoration:'none', fontSize:'0.82rem', fontFamily:'sans-serif', background:'rgba(255,255,255,0.06)'}}>{s}</a>
            ))}
          </div>
        </div>
      </div>

      {/* STAGES OVERVIEW */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', background:'#1E1510'}}>
        {[['01','🔍','Recognize','Name it. Stop pretending you\'re fine.','#C9948A'],['02','🌊','Rest','True guilt-free restoration.','#C4A882'],['03','🌱','Rebuild','Rediscover who you are.','#8A9E85'],['04','✨','Reclaim','Take back what is yours.','#C4A882']].map(([num, icon, title, desc, color]) => (
          <a key={num} href={`#${title.toLowerCase()}`} style={{padding:'40px 32px', borderRight:'1px solid rgba(255,255,255,0.06)', textDecoration:'none', display:'block'}}>
            <p style={{fontSize:'0.68rem', letterSpacing:'0.2em', textTransform:'uppercase', color:color, marginBottom:'16px', fontFamily:'sans-serif'}}>Stage {num}</p>
            <p style={{fontSize:'1.8rem', marginBottom:'12px'}}>{icon}</p>
            <p style={{fontSize:'1.3rem', fontStyle:'italic', color:'#F5F0E8', marginBottom:'8px'}}>{title}</p>
            <p style={{fontSize:'0.8rem', color:'rgba(245,240,232,0.45)', lineHeight:'1.7', fontFamily:'sans-serif'}}>{desc}</p>
          </a>
        ))}
      </div>

      {/* STAGE 1 */}
      <div id="recognize" style={{padding:'120px 80px', background:'#FBF8F3'}}>
        <p style={{fontSize:'0.7rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'#C9948A', marginBottom:'20px', fontFamily:'sans-serif'}}>Stage 01 — Recognize</p>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'80px', alignItems:'start', marginBottom:'60px'}}>
          <div>
            <h2 style={{fontSize:'3.5rem', lineHeight:'1.05', color:'#6B4F3A', marginBottom:'24px', fontWeight:'500'}}>Name<br/><span style={{fontStyle:'italic'}}>what happened.</span></h2>
            <p style={{color:'#5C4A38', lineHeight:'1.9', fontFamily:'sans-serif'}}>Most students spend months not realising they're burned out. They call it laziness. Weakness. This stage is about replacing those false stories with an honest one: you ran out of fuel, and that's not a character flaw.</p>
          </div>
          <div style={{background:'#6B4F3A', padding:'32px 36px', borderRadius:'20px', position:'relative', overflow:'hidden'}}>
            <div style={{position:'absolute', fontSize:'10rem', color:'rgba(196,168,130,0.1)', top:'-10px', left:'16px', lineHeight:'0.8', fontStyle:'italic'}}>"</div>
            <p style={{fontSize:'0.68rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'#C4A882', marginBottom:'14px', fontFamily:'sans-serif'}}>The truth</p>
            <p style={{fontStyle:'italic', fontSize:'1.2rem', color:'#F5F0E8', lineHeight:'1.6', position:'relative', zIndex:1}}>Recognition often looks like a quiet moment where you stop pretending you're fine and admit — to yourself — that you're really not.</p>
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'20px', marginBottom:'48px'}}>
          {[['🪞','The Honest Inventory','Write down everything you\'ve been carrying without complaining about it. Seeing it is the first step to not being ruled by it.'],['📅','Track Your Mood 7 Days','Once a day, rate how you feel and write one sentence why. Patterns will emerge after a week.'],['🛑','Stop Minimising','"I\'m just tired." Practice saying: "I\'m genuinely exhausted and it\'s okay to name that."'],['📖','Write Your Burnout Story','In one page, write when things started feeling hard and where you are now. No judgment.'],['🗣️','Tell One Person','Telling one person you trust — "I think I\'m burned out" — breaks the isolation.'],['⚖️','Separate Yourself From Grades','"My grades measure output under conditions. They are not a measure of my worth."']].map(([icon, title, desc]) => (
            <div key={title} style={{padding:'28px', borderRadius:'20px', background:'#F5F0E8', border:'1px solid rgba(196,168,130,0.2)'}}>
              <p style={{fontSize:'1.6rem', marginBottom:'12px'}}>{icon}</p>
              <p style={{fontSize:'1rem', color:'#6B4F3A', marginBottom:'8px', fontWeight:'500'}}>{title}</p>
              <p style={{fontSize:'0.84rem', color:'#5C4A38', lineHeight:'1.75', fontFamily:'sans-serif'}}>{desc}</p>
            </div>
          ))}
        </div>
        <div style={{background:'#6B4F3A', borderRadius:'24px', padding:'40px 48px'}}>
          <p style={{fontSize:'0.68rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'#C4A882', marginBottom:'16px', fontFamily:'sans-serif'}}>Journal Prompts — Stage 01</p>
          <p style={{fontStyle:'italic', fontSize:'1.3rem', color:'#F5F0E8', marginBottom:'24px'}}>Questions to sit with this week</p>
          {['When did I stop feeling like myself? What was happening around that time?','What have I been telling myself about why I feel this way? Are those stories true?','What would I tell a close friend if they described feeling exactly how I feel?','What am I most afraid to admit about how I\'m really doing?'].map((q, i) => (
            <div key={i} style={{display:'flex', gap:'16px', padding:'16px 20px', borderRadius:'12px', background:'rgba(255,255,255,0.06)', marginBottom:'12px', alignItems:'flex-start'}}>
              <span style={{fontStyle:'italic', color:'#C4A882', fontSize:'1.1rem', minWidth:'24px'}}>{i+1}</span>
              <p style={{fontSize:'0.88rem', color:'rgba(245,240,232,0.78)', lineHeight:'1.7', fontFamily:'sans-serif'}}>{q}</p>
            </div>
          ))}
        </div>
      </div>

      {/* STAGE 2 */}
      <div id="rest" style={{padding:'120px 80px', background:'#F5F0E8'}}>
        <p style={{fontSize:'0.7rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'#C4A882', marginBottom:'20px', fontFamily:'sans-serif'}}>Stage 02 — Rest</p>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'80px', alignItems:'start', marginBottom:'60px'}}>
          <div>
            <h2 style={{fontSize:'3.5rem', lineHeight:'1.05', color:'#6B4F3A', marginBottom:'24px', fontWeight:'500'}}>Real rest.<br/><span style={{fontStyle:'italic'}}>Not earned rest.</span></h2>
            <p style={{color:'#5C4A38', lineHeight:'1.9', fontFamily:'sans-serif'}}>Most students treat rest as something you get after being productive enough. Real rest has no prerequisite. This stage is about letting your nervous system remember what safe actually feels like.</p>
          </div>
          <div style={{background:'#6B4F3A', padding:'32px 36px', borderRadius:'20px', position:'relative', overflow:'hidden'}}>
            <div style={{position:'absolute', fontSize:'10rem', color:'rgba(196,168,130,0.1)', top:'-10px', left:'16px', lineHeight:'0.8', fontStyle:'italic'}}>"</div>
            <p style={{fontSize:'0.68rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'#C4A882', marginBottom:'14px', fontFamily:'sans-serif'}}>The truth</p>
            <p style={{fontStyle:'italic', fontSize:'1.2rem', color:'#F5F0E8', lineHeight:'1.6', position:'relative', zIndex:1}}>You cannot think your way out of burnout. Rest is not the soft option — it is the only option. Everything else is just delaying the crash.</p>
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'20px', marginBottom:'48px'}}>
          {[['🚫','Remove the Guilt Script','Every time you rest and feel guilty, say: "I am allowed to rest. I do not need to earn this."'],['😴','Sleep as Medicine','Not 5-6 hours. Eight. Consistently. Sleep is when your brain repairs emotional regulation.'],['📵','Digital Silence Windows','No phone for 30 minutes after waking and before sleeping. Quiet is how your mind decompresses.'],['🧘','Do Nothing Deliberately','Schedule 20 minutes with no input. No podcasts, no scrolling. Just exist.'],['🌿','Nature, Even Small Doses','Even 10 minutes outside measurably lowers cortisol. Nature doesn\'t care about your grades.'],['🍽️','Eat Like You Care','Burnout collapses eating. Consistent, nourishing meals are how your brain actually recovers.']].map(([icon, title, desc]) => (
            <div key={title} style={{padding:'28px', borderRadius:'20px', background:'#FBF8F3', border:'1px solid rgba(196,168,130,0.2)'}}>
              <p style={{fontSize:'1.6rem', marginBottom:'12px'}}>{icon}</p>
              <p style={{fontSize:'1rem', color:'#6B4F3A', marginBottom:'8px', fontWeight:'500'}}>{title}</p>
              <p style={{fontSize:'0.84rem', color:'#5C4A38', lineHeight:'1.75', fontFamily:'sans-serif'}}>{desc}</p>
            </div>
          ))}
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'10px'}}>
          {[['Mon','🌅','Morning without a phone.'],['Tue','🚶','20 min walk outside.'],['Wed','😴','Bed by 10pm.'],['Thu','🍜','A meal you actually enjoy.'],['Fri','📵','Two hours screen-free.'],['Sat','🛁','One hour of pure comfort.'],['Sun','🪴','Check in: 5% lighter?']].map(([day, icon, task]) => (
            <div key={day} style={{padding:'20px 14px', borderRadius:'16px', background:'#FBF8F3', border:'1px solid rgba(196,168,130,0.2)', textAlign:'center'}}>
              <p style={{fontSize:'0.68rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'#9C8878', marginBottom:'8px', fontFamily:'sans-serif'}}>{day}</p>
              <p style={{fontSize:'1.4rem', marginBottom:'8px'}}>{icon}</p>
              <p style={{fontSize:'0.74rem', color:'#5C4A38', lineHeight:'1.5', fontFamily:'sans-serif'}}>{task}</p>
            </div>
          ))}
        </div>
      </div>

      {/* STAGE 3 */}
      <div id="rebuild" style={{padding:'120px 80px', background:'#FBF8F3'}}>
        <p style={{fontSize:'0.7rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'#8A9E85', marginBottom:'20px', fontFamily:'sans-serif'}}>Stage 03 — Rebuild</p>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'80px', alignItems:'start', marginBottom:'60px'}}>
          <div>
            <h2 style={{fontSize:'3.5rem', lineHeight:'1.05', color:'#6B4F3A', marginBottom:'24px', fontWeight:'500'}}>Rediscover<br/><span style={{fontStyle:'italic'}}>who you are.</span></h2>
            <p style={{color:'#5C4A38', lineHeight:'1.9', fontFamily:'sans-serif'}}>After enough rest, something shifts. You begin to want things again. This stage is about slowly rediscovering what you enjoy, what you think, who you are when you're not performing for grades.</p>
          </div>
          <div style={{background:'#6B4F3A', padding:'32px 36px', borderRadius:'20px', position:'relative', overflow:'hidden'}}>
            <div style={{position:'absolute', fontSize:'10rem', color:'rgba(196,168,130,0.1)', top:'-10px', left:'16px', lineHeight:'0.8', fontStyle:'italic'}}>"</div>
            <p style={{fontSize:'0.68rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'#C4A882', marginBottom:'14px', fontFamily:'sans-serif'}}>The truth</p>
            <p style={{fontStyle:'italic', fontSize:'1.2rem', color:'#F5F0E8', lineHeight:'1.6', position:'relative', zIndex:1}}>You are not rebuilding who you were before burnout. You're building someone who understands their limits and knows their worth beyond performance.</p>
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'20px', marginBottom:'48px'}}>
          {[['🎨','Revisit Something You Loved','Before exams owned your life — what did you love? Do it for 30 minutes with zero productivity attached.'],['🤝','Reconnect With One Person','Reach out to one person — not to catch up, just to exist together. Human connection is restorative.'],['🎯','One Tiny Non-Academic Goal','Finish a book. Learn one recipe. Completing ungraded things rebuilds satisfaction.'],['💪','Move Your Body Gently','Not to get fit. Just to feel something good. A walk, stretching, dancing alone in your room.'],['🧩','Try One New Thing','A new podcast, a different route. Novelty tells your brain the world is larger than the exam hall.'],['✍️','Three Things You Like About Yourself','Not achievements. Qualities. Read this list when burnout makes you forget.']].map(([icon, title, desc]) => (
            <div key={title} style={{padding:'28px', borderRadius:'20px', background:'#F5F0E8', border:'1px solid rgba(196,168,130,0.2)'}}>
              <p style={{fontSize:'1.6rem', marginBottom:'12px'}}>{icon}</p>
              <p style={{fontSize:'1rem', color:'#6B4F3A', marginBottom:'8px', fontWeight:'500'}}>{title}</p>
              <p style={{fontSize:'0.84rem', color:'#5C4A38', lineHeight:'1.75', fontFamily:'sans-serif'}}>{desc}</p>
            </div>
          ))}
        </div>
        <div style={{background:'#6B4F3A', borderRadius:'24px', padding:'40px 48px'}}>
          <p style={{fontSize:'0.68rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'#C4A882', marginBottom:'16px', fontFamily:'sans-serif'}}>Journal Prompts — Stage 03</p>
          <p style={{fontStyle:'italic', fontSize:'1.3rem', color:'#F5F0E8', marginBottom:'24px'}}>Questions for the turning point</p>
          {['Who was I before academic pressure became the centre of my identity?','What would I do with my time if grades didn\'t exist?','What does genuine success look like to me — not my parents, not society, but me?','What small thing recently made me feel — even briefly — like myself again?'].map((q, i) => (
            <div key={i} style={{display:'flex', gap:'16px', padding:'16px 20px', borderRadius:'12px', background:'rgba(255,255,255,0.06)', marginBottom:'12px', alignItems:'flex-start'}}>
              <span style={{fontStyle:'italic', color:'#C4A882', fontSize:'1.1rem', minWidth:'24px'}}>{i+1}</span>
              <p style={{fontSize:'0.88rem', color:'rgba(245,240,232,0.78)', lineHeight:'1.7', fontFamily:'sans-serif'}}>{q}</p>
            </div>
          ))}
        </div>
      </div>

      {/* STAGE 4 */}
      <div id="reclaim" style={{padding:'120px 80px', background:'#F5F0E8'}}>
        <p style={{fontSize:'0.7rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'#6B4F3A', marginBottom:'20px', fontFamily:'sans-serif'}}>Stage 04 — Reclaim</p>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'80px', alignItems:'start', marginBottom:'60px'}}>
          <div>
            <h2 style={{fontSize:'3.5rem', lineHeight:'1.05', color:'#6B4F3A', marginBottom:'24px', fontWeight:'500'}}>Take back<br/><span style={{fontStyle:'italic'}}>what is yours.</span></h2>
            <p style={{color:'#5C4A38', lineHeight:'1.9', fontFamily:'sans-serif'}}>This is not about returning to the person who burned out. Reclaiming means stepping into something new — a version of you that works hard from a place of genuine care rather than fear.</p>
          </div>
          <div style={{background:'#6B4F3A', padding:'32px 36px', borderRadius:'20px', position:'relative', overflow:'hidden'}}>
            <div style={{position:'absolute', fontSize:'10rem', color:'rgba(196,168,130,0.1)', top:'-10px', left:'16px', lineHeight:'0.8', fontStyle:'italic'}}>"</div>
            <p style={{fontSize:'0.68rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'#C4A882', marginBottom:'14px', fontFamily:'sans-serif'}}>The truth</p>
            <p style={{fontStyle:'italic', fontSize:'1.2rem', color:'#F5F0E8', lineHeight:'1.6', position:'relative', zIndex:1}}>Recovery is not a destination. It's a new way of operating. The goal is to know yourself well enough to catch it early and return to yourself faster every time.</p>
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'20px', marginBottom:'48px'}}>
          {[['🚧','Set Academic Boundaries','No work after 9pm. One full rest day per week. These aren\'t laziness — they\'re what makes sustained performance possible.'],['📊','Redesign Your Relationship With Grades','Decide your own definition of academic success — one you can actually live with.'],['🔔','Build an Early Warning System','Know your personal burnout signals. When you notice them, act — don\'t wait until it\'s severe.'],['💬','Talk About Mental Health','Tell friends when you\'re struggling. Normalising the conversation protects you and others.'],['🌟','Celebrate Non-Academic Wins','Got out of bed when it was hard? That counts. Learning to value ungraded wins is part of reclaiming.'],['🔄','Make Recovery a Habit','The students who don\'t burn out again made recovery part of their ordinary week. Not once in crisis. Always.']].map(([icon, title, desc]) => (
            <div key={title} style={{padding:'28px', borderRadius:'20px', background:'#FBF8F3', border:'1px solid rgba(196,168,130,0.2)'}}>
              <p style={{fontSize:'1.6rem', marginBottom:'12px'}}>{icon}</p>
              <p style={{fontSize:'1rem', color:'#6B4F3A', marginBottom:'8px', fontWeight:'500'}}>{title}</p>
              <p style={{fontSize:'0.84rem', color:'#5C4A38', lineHeight:'1.75', fontFamily:'sans-serif'}}>{desc}</p>
            </div>
          ))}
        </div>
        <div style={{background:'#6B4F3A', borderRadius:'24px', padding:'40px 48px'}}>
          <p style={{fontSize:'0.68rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'#C4A882', marginBottom:'16px', fontFamily:'sans-serif'}}>Journal Prompts — Stage 04</p>
          <p style={{fontStyle:'italic', fontSize:'1.3rem', color:'#F5F0E8', marginBottom:'24px'}}>Questions for who you're becoming</p>
          {['What has this period taught me about my limits and how I want to honour them?','What would I tell my past self — the one just starting to burn out?','What does a sustainable version of my academic life look like?','Who am I, right now, outside of what I achieve?'].map((q, i) => (
            <div key={i} style={{display:'flex', gap:'16px', padding:'16px 20px', borderRadius:'12px', background:'rgba(255,255,255,0.06)', marginBottom:'12px', alignItems:'flex-start'}}>
              <span style={{fontStyle:'italic', color:'#C4A882', fontSize:'1.1rem', minWidth:'24px'}}>{i+1}</span>
              <p style={{fontSize:'0.88rem', color:'rgba(245,240,232,0.78)', lineHeight:'1.7', fontFamily:'sans-serif'}}>{q}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{background:'#1E1510', padding:'100px 80px', textAlign:'center'}}>
        <p style={{fontSize:'0.72rem', letterSpacing:'0.25em', textTransform:'uppercase', color:'#C4A882', marginBottom:'20px', fontFamily:'sans-serif'}}>Your Journey</p>
        <h2 style={{fontSize:'3rem', color:'#F5F0E8', marginBottom:'16px', fontWeight:'500', lineHeight:'1.1'}}>You don't have to do this <span style={{fontStyle:'italic', color:'#C4A882'}}>all at once.</span></h2>
        <p style={{color:'rgba(245,240,232,0.5)', maxWidth:'480px', margin:'0 auto 48px', lineHeight:'1.8', fontFamily:'sans-serif'}}>Move through the stages at your own pace. Some people spend weeks in Rest. There's no wrong way to heal.</p>
        <div style={{display:'flex', gap:'16px', justifyContent:'center', flexWrap:'wrap'}}>
          <Link href="/assessment" style={{background:'#C4A882', color:'#6B4F3A', padding:'16px 40px', borderRadius:'100px', textDecoration:'none', fontSize:'0.92rem', fontFamily:'sans-serif', fontWeight:'500'}}>Take the Assessment First</Link>
          <Link href="/" style={{background:'transparent', color:'rgba(245,240,232,0.6)', padding:'16px 40px', borderRadius:'100px', textDecoration:'none', fontSize:'0.92rem', fontFamily:'sans-serif', border:'1px solid rgba(255,255,255,0.15)'}}>← Back to Home</Link>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{background:'#1E1510', padding:'40px 80px', display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid rgba(255,255,255,0.06)'}}>
        <p style={{fontSize:'1.6rem', fontStyle:'italic', color:'#C4A882'}}>Calf</p>
        <p style={{fontSize:'0.78rem', color:'rgba(245,240,232,0.3)', fontFamily:'sans-serif'}}>Built by <span style={{color:'#C4A882'}}>Bhargava</span></p>
      </footer>

    </div>
  )
}
