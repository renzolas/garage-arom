import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
```

4. Clic en **"Commit changes"** → **"Commit directly to main"** → **"Commit changes"**

---

Cuando termines, tu repo debería verse así:
```
app/
  globals.css
  layout.tsx
  page.tsx
  vehicles/
    [id]/
      page.tsx
lib/
  supabase.ts
package.json
next.config.js
tsconfig.json
...
