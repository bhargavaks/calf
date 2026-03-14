import { createClient, SupabaseClient } from '@supabase/supabase-js'
 
let supabase: SupabaseClient | null = null
 
if (typeof window !== 'undefined') {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  if (url && key) {
    supabase = createClient(url, key)
  }
}
 
export { supabase }
 
