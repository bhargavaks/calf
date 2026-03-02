'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth'; return; }
      setUser(user)

      const { data } = await supabase
        .from('users_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setResults(data || [])
      setLoading(false)
    }
    getUser()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  if (loading) return (
    <div style={{minHeight:'100vh', background:'#F5F0E8', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <p style={{fontFamily:'Georgia', color:'#6B4F3A', fontSize:'1.2rem'}}>Loading your journey...</p>
    </div>
  )

  return (
    <div style={{minHeight:'100vh', background:'#F5F0E8', fontFamily:'sans-serif'}}>
      <nav style={{padding:'20px 48px', background:'rgba(245,240,232,0.9)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(196,168,130,0.2)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <span style={{fontFamily:'Georgia', fontSize:'1.4rem', color:'#6B4F3A', fontWeight:'600'}}>Calf</span>
        <div style={{display:'flex', gap:'24px', alignItems:'center'}}>
          <a href="/assessment" style={{color:'#5C4A38', textDecoration:'none', fontSize:'0.88rem'}}>Take Assessment</a>
          <button onClick={handleSignOut} style={{background:'transparent', border:'1px solid rgba(196,168,130,0.4)', padding:'8px 20px', borderRadius:'100px', cursor:'pointer', color:'#9C8878', fontSize:'0.85rem'}}>Sign Out</button>
        </div>
      </nav>

      <div style={{maxWidth:'800px', margin:'0 auto', padding:'60px 28px'}}>
        <p style={{fontSize:'0.75rem', letterSpacing:'0.2em', textTransform:'uppercase', color:'#C9948A', marginBottom:'12px'}}>Welcome back</p>
        <h1 style={{fontFamily:'Georgia', fontSize:'2.5rem', color:'#6B4F3A', marginBottom:'8px'}}>Your Recovery Journey</h1>
        <p style={{color:'#9C8878', marginBottom:'48px', fontSize:'0.95rem'}}>{user?.email}</p>

        {results.length === 0 ? (
          <div style={{textAlign:'center', padding:'80px 40px', background:'white', borderRadius:'24px', border:'1px solid rgba(196,168,130,0.2)'}}>
            <p style={{fontSize:'2.5rem', marginBottom:'20px'}}>🌿</p>
            <h2 style={{fontFamily:'Georgia', fontSize:'1.5rem', color:'#6B4F3A', marginBottom:'12px'}}>No assessments yet</h2>
            <p style={{color:'#9C8878', marginBottom:'32px', fontSize:'0.92rem'}}>Take your first assessment to understand where you are right now.</p>
            <a href="/assessment" style={{background:'#6B4F3A', color:'white', padding:'14px 36px', borderRadius:'100px', textDecoration:'none', fontSize:'0.92rem'}}>Take Assessment →</a>
          </div>
        ) : (
          <div>
            <h2 style={{fontFamily:'Georgia', fontSize:'1.2rem', color:'#6B4F3A', marginBottom:'24px', fontStyle:'italic'}}>Your assessment history</h2>
            {results.map((r, i) => (
              <div key={i} style={{background:'white', borderRadius:'20px', padding:'28px 32px', marginBottom:'16px', border:'1px solid rgba(196,168,130,0.2)'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
                  <span style={{fontFamily:'Georgia', fontSize:'1.1rem', color:'#6B4F3A', textTransform:'capitalize'}}>{r.result_type}</span>
                  <span style={{fontSize:'0.78rem', color:'#9C8878'}}>{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px'}}>
                  {[['Exhaustion', r.exhaustion_score],['Cognitive', r.cognitive_score],['Self-Worth', r.worth_score],['Recovery', r.recovery_score]].map(([label, score]) => (
                    <div key={label} style={{textAlign:'center', padding:'12px', background:'#F5F0E8', borderRadius:'12px'}}>
                      <p style={{fontSize:'1.3rem', fontWeight:'600', color:'#6B4F3A'}}>{Math.round((score/6)*100)}%</p>
                      <p style={{fontSize:'0.72rem', color:'#9C8878', marginTop:'4px'}}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}