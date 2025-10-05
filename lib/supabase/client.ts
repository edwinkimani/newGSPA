import { createBrowserClient } from "@supabase/ssr"

// Minimal stub client returned when Supabase env is not configured.
function makeStubClient() {
  const err = { message: 'Supabase not configured' }
  return {
    auth: {
      signUp: async () => ({ data: null, error: err }),
      getUser: async () => ({ data: { user: null }, error: null }),
    },
    storage: {
      from: (/* bucket: string */) => ({
        upload: async () => ({ data: null, error: err }),
        getPublicUrl: (_: string) => ({ data: { publicUrl: '' } }),
        remove: async () => ({ data: null, error: err }),
      }),
    },
    from: () => ({ select: async () => ({ data: null, error: err }) }),
  }
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Do not throw for missing env in environments where Supabase Storage isn't used.
    // Return a lightweight stub to avoid runtime crashes; callers should handle missing data.
    console.warn('[v0] Supabase not configured — returning stub client')
    return makeStubClient() as any
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
