'use client'
export const dynamic = 'force-dynamic'
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [cursorPos, setCursorPos] = useState({ x: -200, y: -200 })

  useEffect(() => {
    const move = (e: MouseEvent) => setCursorPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  const handleAuth = async () => {
    console.log('supabase:', !!supabase, process.env.NEXT_PUBLIC_SUPABASE_URL)
    if (!email || !password) { setMessage('Please enter your email and password.'); return }
    if (!supabase) { setMessage('Loading... please try again in a second.'); setTimeout(() => window.location.reload(), 1500); return }
    setLoading(true)
    setMessage('')

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out. Please try again.')), 10000)
    )

    try {
      if (isLogin) {
        const result = await Promise.race([
          supabase.auth.signInWithPassword({ email, password }),
          timeout
        ]) as Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>
        if (result.error) setMessage(result.error.message)
        else window.location.href = '/dashboard'
      } else {
        const result = await Promise.race([
          supabase.auth.signUp({ email, password }),
          timeout
        ]) as Awaited<ReturnType<typeof supabase.auth.signUp>>
        if (result.error) setMessage(result.error.message)
        else setMessage('Account created! You can now sign in.')
      }
    } catch (err: unknown) {
      if (err instanceof Error) setMessage(err.message)
      else setMessage('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAuth()
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Syne:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #F5F0E8; --bg2: #EDE8DC;
          --border: rgba(90,110,85,0.14); --ink: #2E3528;
          --muted: rgba(46,53,40,0.5); --green: #4A8A5A; --terracotta: #B5654A;
        }
        html, body { height: 100%; }
        body { background: var(--bg); font-family: 'Syne', sans-serif; cursor: none; overflow-x: hidden; }
        .cursor { position: fixed; width: 9px; height: 9px; background: var(--green); border-radius: 50%; pointer-events: none; z-index: 9999; }
        .cursor-ring { position: fixed; width: 34px; height: 34px; border: 1.5px solid rgba(74,138,90,0.4); border-radius: 50%; pointer-events: none; z-index: 9998; transition: left 0.1s ease, top 0.1s ease; }
        body::before { content: ''; position: fixed; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); opacity: 0.025; pointer-events: none; z-index: 9997; }
        .auth-wrap { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; }
        .auth-left { background: var(--bg2); padding: 3rem; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; border-right: 1px solid var(--border); }
        .orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; animation: orbFloat 14s ease-in-out infinite; }
        .orb1 { width: 400px; height: 400px; background: rgba(122,158,124,0.2); top: -100px; left: -100px; }
        .orb2 { width: 300px; height: 300px; background: rgba(200,149,106,0.15); bottom: -80px; right: -80px; animation-delay: -6s; }
        .left-logo { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 700; font-style: italic; color: var(--ink); text-decoration: none; letter-spacing: -0.02em; z-index: 1; }
        .left-logo span { color: var(--green); }
        .left-content { z-index: 1; }
        .left-quote { font-family: 'Playfair Display', serif; font-size: clamp(1.8rem, 3vw, 2.8rem); font-weight: 700; line-height: 1.15; letter-spacing: -0.03em; color: var(--ink); margin-bottom: 1.2rem; }
        .left-quote em { font-style: italic; color: var(--green); }
        .left-sub { font-size: 0.95rem; color: var(--muted); line-height: 1.75; max-width: 360px; }
        .left-footer { font-size: 0.75rem; color: var(--muted); z-index: 1; }
        .auth-right { display: flex; align-items: center; justify-content: center; padding: 3rem 2rem; }
        .auth-card { width: 100%; max-width: 400px; animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        .auth-card-tag { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--green); border: 1.5px solid rgba(74,138,90,0.25); border-radius: 100px; padding: 0.3rem 0.85rem; margin-bottom: 1.8rem; background: rgba(74,138,90,0.07); }
        .auth-title { font-family: 'Playfair Display', serif; font-size: 2.2rem; font-weight: 700; line-height: 1.1; letter-spacing: -0.03em; color: var(--ink); margin-bottom: 0.6rem; }
        .auth-title em { font-style: italic; color: var(--green); }
        .auth-sub { font-size: 0.9rem; color: var(--muted); line-height: 1.6; margin-bottom: 2.2rem; }
        .field { margin-bottom: 1rem; }
        .field label { display: block; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); margin-bottom: 0.5rem; }
        .field input { width: 100%; padding: 0.85rem 1rem; background: #FFFFFF; border: 1.5px solid var(--border); border-radius: 12px; font-family: 'Syne', sans-serif; font-size: 0.95rem; color: var(--ink); outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .field input::placeholder { color: rgba(46,53,40,0.3); }
        .field input:focus { border-color: rgba(74,138,90,0.5); box-shadow: 0 0 0 3px rgba(74,138,90,0.08); }
        .btn-submit { width: 100%; padding: 0.95rem; background: var(--ink); color: var(--bg); font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 700; border: none; border-radius: 100px; cursor: pointer; margin-top: 0.5rem; margin-bottom: 1.2rem; transition: background 0.2s, transform 0.15s, box-shadow 0.2s; }
        .btn-submit:hover:not(:disabled) { background: var(--green); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(74,138,90,0.2); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .toggle-text { text-align: center; font-size: 0.85rem; color: var(--muted); }
        .toggle-link { color: var(--terracotta); cursor: pointer; font-weight: 600; background: none; border: none; font-family: 'Syne', sans-serif; font-size: 0.85rem; padding: 0; transition: opacity 0.2s; }
        .toggle-link:hover { opacity: 0.75; }
        .auth-message { margin-top: 1rem; padding: 0.8rem 1rem; border-radius: 10px; font-size: 0.85rem; text-align: center; background: rgba(74,138,90,0.08); border: 1px solid rgba(74,138,90,0.2); color: var(--green); }
        .auth-message.error { background: rgba(181,101,74,0.08); border-color: rgba(181,101,74,0.2); color: var(--terracotta); }
        .spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(245,240,232,0.3); border-top-color: #F5F0E8; border-radius: 50%; animation: spin 0.7s linear infinite; margin-right: 8px; vertical-align: middle; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes orbFloat { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(20px,-15px) scale(1.04); } 66% { transform: translate(-15px,10px) scale(0.97); } }
        @media (max-width: 768px) {
          body { cursor: auto; }
          .cursor, .cursor-ring { display: none; }
          .auth-wrap { grid-template-columns: 1fr; }
          .auth-left { display: none; }
          .auth-right { padding: 4rem 1.5rem 2rem; align-items: flex-start; }
        }
      `}</style>

      <div className="cursor" style={{ left: cursorPos.x - 4, top: cursorPos.y - 4 }} />
      <div className="cursor-ring" style={{ left: cursorPos.x - 17, top: cursorPos.y - 17 }} />

      <div className="auth-wrap">
        <div className="auth-left">
          <div className="orb orb1" />
          <div className="orb orb2" />
          <a href="/" className="left-logo">calf<span>.</span></a>
          <div className="left-content">
            <h2 className="left-quote">
              recovery is not linear.<br />
              and that&apos;s <em>okay.</em>
            </h2>
            <p className="left-sub">
              Calf helps you track burnout, understand what&apos;s going on,
              and find your way back — one honest check-in at a time.
            </p>
          </div>
          <p className="left-footer">free · no ads · built by a student</p>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-card-tag">
              🌿 {isLogin ? 'welcome back' : 'get started'}
            </div>
            <h1 className="auth-title">
              {isLogin
                ? <>good to see<br />you <em>again.</em></>
                : <>let&apos;s get<br />you <em>started.</em></>}
            </h1>
            <p className="auth-sub">
              {isLogin
                ? 'Sign in to continue your recovery journey.'
                : "Create your account. It's free, always."}
            </p>

            <div className="field">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKey}
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKey}
              />
            </div>

            <button className="btn-submit" onClick={handleAuth} disabled={loading}>
              {loading
                ? <><span className="spinner" />{isLogin ? 'signing in...' : 'creating account...'}</>
                : isLogin ? 'sign in →' : 'create account →'}
            </button>

            <p className="toggle-text">
              {isLogin ? "don't have an account? " : 'already have an account? '}
              <button className="toggle-link" onClick={() => { setIsLogin(!isLogin); setMessage('') }}>
                {isLogin ? 'sign up' : 'sign in'}
              </button>
            </p>

            {message && (
              <div className={`auth-message ${
                message.toLowerCase().includes('error') ||
                message.toLowerCase().includes('invalid') ||
                message.toLowerCase().includes('already') ||
                message.toLowerCase().includes('timed') ||
                message.toLowerCase().includes('wrong') ||
                message.toLowerCase().includes('connection')
                  ? 'error' : ''
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
