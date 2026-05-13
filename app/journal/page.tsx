'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { getSupabase } from '../lib/supabase'

export default function Journal() {
  const supabase = getSupabase()
  const [user, setUser] = useState<any>(null)
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user)
        loadEntries(data.user.id)
      } else {
        setLoading(false)
      }
    })
  }, [])

  async function loadEntries(uid: string) {
    const { data } = await supabase
      .from('recovery_tasks')
      .select('*')
      .eq('user_id', uid)
      .not('journal_entry', 'is', null)
      .order('completed_date', { ascending: false })

    if (data) {
      setEntries(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#e8f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
        <div>Loading your journal...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: '#e8f0e8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
        <h2>Please sign in to view your journal</h2>
        <Link href="/auth" style={{ color: '#5a8a5a', textDecoration: 'none', marginTop: '16px' }}>Go to Auth</Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#e8f0e8', color: '#2c4a2c', fontFamily: 'Georgia, serif', padding: '0' }}>
      {/* Header */}
      <div style={{
        background: '#f4f7f4',
        borderBottom: '2px solid #b8d4b8',
        padding: '20px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href="/dashboard" style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c4a2c', textDecoration: 'none' }}>
          ← Back to Dashboard
        </Link>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>My Journal</h1>
        <div></div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', opacity: 0.7 }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📖</div>
            <p>No journal entries yet. Complete some tasks on your dashboard to start reflecting!</p>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '16px', marginBottom: '24px', opacity: 0.8 }}>
              {entries.length} reflection{entries.length !== 1 ? 's' : ''} from your recovery journey
            </p>
            {entries.map((entry, i) => (
              <div key={entry.id} style={{
                background: '#f4f7f4',
                border: '1.5px solid #b8d4b8',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '20px',
                boxShadow: '0 2px 12px rgba(90,138,90,0.1)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
                    {entry.title}
                  </h3>
                  <span style={{ fontSize: '13px', opacity: 0.6 }}>
                    {new Date(entry.completed_date).toLocaleDateString()}
                  </span>
                </div>
                {entry.description && (
                  <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '16px', lineHeight: 1.5 }}>
                    {entry.description}
                  </p>
                )}
                <div style={{
                  background: '#e8f0e8',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  fontSize: '15px',
                  fontStyle: 'italic',
                  lineHeight: 1.6,
                  borderLeft: '4px solid #5a8a5a',
                }}>
                  "{entry.journal_entry}"
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}