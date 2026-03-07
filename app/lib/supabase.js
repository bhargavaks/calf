import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

Then in `app/auth/page.tsx` remove the `if (!supabase)` check — it's no longer needed since supabase can't be null anymore.

Save both files, then:
```
