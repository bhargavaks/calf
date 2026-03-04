import Link from 'next/link'

export default function Home() {
  return (
    <div style={{fontFamily:'Georgia', background:'#F5F0E8', minHeight:'100vh'}}>
      
      {/* NAV */}
      <nav style={{position:'fixed', top:0, left:0, right:0, zIndex:100, padding:'20px 48px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(245,240,232,0.9)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(196,168,130,0.15)'}}>
        <span style={{fontSize:'1.4rem', fontWeight:'600', color:'#6B4F3A'}}>Calf</span>
        <div style={{display:'flex', gap:'24px', alignItems:'center'}}>
          <Link href="/assessment" style={{color:'#5C4A38', textDecoration:'none', fontSize:'0.88rem', fontFamily:'sans-serif'}}>Assessment</Link>
          <Link href="/auth" style={{background:'#6B4F3A', color:'white', padding:'10px 24px', borderRadius:'100px', textDecoration:'none', fontSize:'0.85rem', fontFamily:'sans-serif'}}>Sign In</Link>
        </div>
      </nav>

      {/* HERO */}
      <div style={{minHeight:'100vh', display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 80px', paddingTop:'100px', position:'relative', overflow:'hidden', background:'#6B4F3A'}}>
        <div style={{position:'absolute', inset:0, background:'radial-gradient(ellipse 70% 60% at 80% 30%, rgba(201,148,138,0.35), transparent), radial-gradient(ellipse 50% 70% at 10% 80%, rgba(138,158,133,0.2), transparent)'}}></div>
        <div style={{position:'relative', zIndex:2, maxWidth:'680px'}}>
          <p style={{fontSize:'0.72rem', letterSpacing:'0.25em', textTransform:'uppercase', color:'#C4A882', marginBottom:'24px', fontFamily:'sans-serif'}}>For students who've lost themselves</p>
          <h1 style={{fontSize:'clamp(3rem, 6vw, 5.5rem)', lineHeight:'1.05', color:'#F5F0E8', marginBottom:'28px', fontWeight:'500'}}>You were pure once.<br/><span style={{fontStyle:'italic', color:'#C4A882'}}>You still are.</span></h1>
          <p style={{fontSize:'1rem', lineHeight:'1.85', color:'rgba(245,240,232,0.65)', maxWidth:'520px', marginBottom:'48px', fontFamily:'sans-serif'}}>Academic burnout quietly steals the most innocent parts of you. Calf is where you come to understand what's happening — and find your way back.</p>
          <div style={{display:'flex', gap:'16px', flexWrap:'wrap'}}>
            <Link href="/assessment" style={{background:'#C4A882', color:'#6B4F3A', padding:'17px 40px', borderRadius:'100px', textDecoration:'none', fontSize:'0.95rem', fontWeight:'500', fontFamily:'sans-serif'}}>Take the Assessment →</Link>
            <Link href="/auth" style={{background:'transparent', color:'rgba(245,240,232,0.8)', padding:'17px 40px', borderRadius:'100px', textDecoration:'none', fontSize:'0.95rem', border:'1px solid rgba(255,255,255,0.2)', fontFamily:'sans-serif'}}>Sign In</Link>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={{background:'#2C2018', padding:'40px 80px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'24px'}}>
        {[['73%', 'of Gen Z report burnout'],['1 in 3', 'don\'t recognise the signs'],['68%', 'never seek support'],['4 stages', 'to full recovery']].map(([num, label]) => (
          <div key={label} style={{textAlign:'center'}}>
            <p style={{fontSize:'2rem', fontWeight:'600', color:'#C4A882', marginBottom:'4px'}}>{num}</p>
            <p style={{fontSize:'0.75rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(245,240,232,0.4)', fontFamily:'sans-serif'}}>{label}</p>
          </div>
        ))}
      </div>

      {/* WHAT IS BURNOUT */}
      <div style={{padding:'120px 80px', background:'#FBF8F3', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'80px', alignItems:'center'}}>
        <div>
          <p style={{fontSize:'0.72rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'#8A9E85', marginBottom:'20px', fontFamily:'sans-serif'}}>Understand It</p>
          <h2 style={{fontSize:'3rem', lineHeight:'1.1', color:'#6B4F3A', marginBottom:'24px', fontWeight:'500'}}>It's not laziness.<br/><span style={{fontStyle:'italic'}}>It's depletion.</span></h2>
          <p style={{color:'#5C4A38', lineHeight:'1.9', marginBottom:'20px', fontFamily:'sans-serif'}}>Burnout isn't about being weak or not trying hard enough. It's what happens when you give and give — in exams, in studying, in life — until there's nothing left.</p>
          <p style={{color:'#5C4A38', lineHeight:'1.9', fontFamily:'sans-serif'}}>The drive to perform has overridden your ability to simply exist without producing. That's a different kind of exhaustion — and it deserves a different kind of healing.</p>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
          {[['📚','Academic Burnout','Exhaustion from relentless studying and pressure to perform.'],['🧠','Mental Fatigue','When your brain stops working even for things you enjoy.'],['💭','Identity Loss','Losing yourself so gradually you don\'t notice until you\'re gone.'],['🌿','Recovery','Finding your way back — slowly, gently, without pressure.']].map(([icon, title, desc]) => (
            <div key={title} style={{background:'#F5F0E8', padding:'28px 24px', borderRadius:'20px', border:'1px solid rgba(196,168,130,0.2)'}}>
              <p style={{fontSize:'1.8rem', marginBottom:'12px'}}>{icon}</p>
              <p style={{fontSize:'1rem', color:'#6B4F3A', marginBottom:'8px', fontWeight:'500'}}>{title}</p>
              <p style={{fontSize:'0.82rem', color:'#9C8878', lineHeight:'1.7', fontFamily:'sans-serif'}}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SIGNS */}
      <div style={{padding:'120px 80px', background:'#F5F0E8'}}>
        <p style={{fontSize:'0.72rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'#C9948A', marginBottom:'20px', fontFamily:'sans-serif'}}>Signs — The Part Nobody Talks About</p>
        <h2 style={{fontSize:'3rem', lineHeight:'1.1', color:'#6B4F3A', marginBottom:'16px', fontWeight:'500', maxWidth:'600px'}}>Recognizing it is the<br/><span style={{fontStyle:'italic'}}>first act of healing.</span></h2>
        <p style={{color:'#5C4A38', lineHeight:'1.8', maxWidth:'560px', marginBottom:'60px', fontFamily:'sans-serif'}}>Most students spend months not knowing they're burned out. These are the signs that get missed.</p>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'24px'}}>
          {[['01','You apologize for existing','Constantly saying sorry for your feelings, your needs, your presence.','rgba(201,148,138,0.1)','#C9948A'],['02','Nothing feels exciting','The things you loved feel hollow. This is emotional exhaustion, not personality.','rgba(196,168,130,0.15)','#C4A882'],['03','You feel guilty for resting','Every moment of stillness feels like failure. Your nervous system has forgotten what safe feels like.','rgba(138,158,133,0.1)','#8A9E85'],['04','Can\'t concentrate anymore','Even things you enjoy require enormous effort. Your brain is running on empty.','rgba(196,168,130,0.15)','#C4A882'],['05','Your worth = your grades','Every bad result feels like a verdict on who you are as a person.','rgba(201,148,138,0.1)','#C9948A'],['06','Physical symptoms','Headaches, fatigue, sleep issues. Your body keeps score when your mind won\'t.','rgba(138,158,133,0.1)','#8A9E85']].map(([num, title, desc, bg, border]) => (
            <div key={num} style={{padding:'36px 32px', borderRadius:'24px', background:bg, border:`1px solid ${border}30`}}>
              <p style={{fontSize:'3rem', fontWeight:'600', color:'#6B4F3A', opacity:0.15, lineHeight:'1', marginBottom:'16px'}}>{num}</p>
              <p style={{fontSize:'1.1rem', color:'#6B4F3A', marginBottom:'10px', fontWeight:'500'}}>{title}</p>
              <p style={{fontSize:'0.85rem', color:'#5C4A38', lineHeight:'1.75', fontFamily:'sans-serif'}}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RECOVERY STAGES */}
      <div style={{background:'#6B4F3A', padding:'120px 80px'}}>
        <p style={{fontSize:'0.72rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'#C4A882', marginBottom:'20px', fontFamily:'sans-serif'}}>The Recovery Program</p>
        <h2 style={{fontSize:'3rem', color:'#F5F0E8', marginBottom:'60px', fontWeight:'500', lineHeight:'1.1'}}>Four stages.<br/><span style={{fontStyle:'italic', color:'#C4A882'}}>One return to yourself.</span></h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0'}}>
          {[['01','🔍','Recognize','Name what happened. Stop explaining the hurt away.','#C9948A'],['02','🌊','Rest','Not just sleep. True, guilt-free restoration.','#C4A882'],['03','🌱','Rebuild','Rediscover who you are outside of performance.','#8A9E85'],['04','✨','Reclaim','Take back your voice, your joy, your softness.','#C4A882']].map(([num, icon, title, desc, color]) => (
            <div key={num} style={{padding:'40px 32px', borderRight:'1px solid rgba(255,255,255,0.06)'}}>
              <p style={{fontSize:'0.68rem', letterSpacing:'0.2em', textTransform:'uppercase', color:color, marginBottom:'20px', fontFamily:'sans-serif'}}>Stage {num}</p>
              <p style={{fontSize:'2rem', marginBottom:'16px'}}>{icon}</p>
              <p style={{fontSize:'1.4rem', fontStyle:'italic', color:'#F5F0E8', marginBottom:'12px'}}>{title}</p>
              <p style={{fontSize:'0.85rem', color:'rgba(245,240,232,0.5)', lineHeight:'1.8', fontFamily:'sans-serif'}}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{padding:'120px 80px', textAlign:'center', background:'#FBF8F3'}}>
        <p style={{fontSize:'0.72rem', letterSpacing:'0.25em', textTransform:'uppercase', color:'#C9948A', marginBottom:'20px', fontFamily:'sans-serif'}}>Start Here</p>
        <h2 style={{fontSize:'3rem', color:'#6B4F3A', marginBottom:'20px', fontWeight:'500', lineHeight:'1.1'}}>Where are you<br/><span style={{fontStyle:'italic'}}>right now?</span></h2>
        <p style={{color:'#5C4A38', maxWidth:'480px', margin:'0 auto 48px', lineHeight:'1.8', fontFamily:'sans-serif'}}>A short, honest check-in to help you understand what you're going through — and where to start.</p>
        <Link href="/assessment" style={{background:'#6B4F3A', color:'white', padding:'18px 52px', borderRadius:'100px', textDecoration:'none', fontSize:'1rem', fontFamily:'sans-serif'}}>Take the Assessment →</Link>
      </div>

      {/* FOOTER */}
      <footer style={{background:'#2C2018', padding:'48px 80px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <p style={{fontSize:'1.6rem', fontStyle:'italic', color:'#C4A882'}}>Calf</p>
          <p style={{fontSize:'0.78rem', color:'rgba(245,240,232,0.3)', marginTop:'6px', fontFamily:'sans-serif'}}>Find your way back to yourself.</p>
        </div>
        <p style={{fontSize:'0.78rem', color:'rgba(245,240,232,0.3)', fontFamily:'sans-serif'}}>Built by <span style={{color:'#C4A882'}}>Bhargava</span></p>
      </footer>

    </div>
  )
}
