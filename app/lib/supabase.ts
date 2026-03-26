import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (_client) return _client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.warn('[Calf] Supabase env vars not found. Client not initialized.')
    return null
  }

  _client = createClient(url, key)
  return _client
}

// Keep this for any legacy imports elsewhere — but prefer getSupabase()
export const supabase = typeof window !== 'undefined' ? getSupabase() : null