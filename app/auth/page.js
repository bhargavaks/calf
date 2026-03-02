'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAuth = async () => {
    setLoading(true)
    setMessage('')

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
      else window.location.href = '/dashboard'
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Check your email to confirm your account!')
    }
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh', background:'#F5F0E8', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'sans-serif'}}>
      <div style={{background:'white', padding:'48px', borderRadius:'24px', width:'100%', maxWidth:'420px', boxShadow:'0 20px 60px rgba(0,0,0,0.08)'}}>
        <h1 style={{fontFamily:'Georgia', fontSize:'2rem', color:'#6B4F3A', marginBottom:'8px'}}>{isLogin ? 'Welcome back' : 'Join Calf'}</h1>
        <p style={{color:'#9C8878', fontSize:'0.9rem', marginBottom:'32px'}}>{isLogin ? 'Sign in to continue your recovery.' : 'Start your journey back to yourself.'}</p>
        
        <input
          type="email" placeholder="Email"
          value={email} onChange={e => setEmail(e.target.value)}
          style={{width:'100%', padding:'14px', border:'1px solid #E8E0D5', borderRadius:'12px', marginBottom:'12px', fontSize:'0.95rem', outline:'none'}}
        />
        <input
          type="password" placeholder="Password"
          value={password} onChange={e => setPassword(e.target.value)}
          style={{width:'100%', padding:'14px', border:'1px solid #E8E0D5', borderRadius:'12px', marginBottom:'24px', fontSize:'0.95rem', outline:'none'}}
        />

        <button
          onClick={handleAuth} disabled={loading}
          style={{width:'100%', padding:'16px', background:'#6B4F3A', color:'white', border:'none', borderRadius:'100px', fontSize:'1rem', cursor:'pointer', marginBottom:'16px'}}>
          {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
        </button>

        <p style={{textAlign:'center', fontSize:'0.85rem', color:'#9C8878'}}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)} style={{color:'#C9948A', cursor:'pointer', fontWeight:'500'}}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </span>
        </p>

        {message && <p style={{marginTop:'16px', textAlign:'center', fontSize:'0.85rem', color:'#C9948A'}}>{message}</p>}
      </div>
    </div>
  )
}