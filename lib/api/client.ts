export function getAuthToken(): string | null {
  try {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token') || null
  } catch { return null }
}

export async function apiFetch(path: string, opts: RequestInit = {}) {
  const token = getAuthToken()
  const headers = Object.assign({}, opts.headers || {}, {
    'Content-Type': 'application/json',
  })
  if (token) (headers as any)['Authorization'] = `Bearer ${token}`

  const res = await fetch(path, Object.assign({}, opts, { headers }))
  if (res.status === 401) {
    // let the caller handle unauthenticated flows
    return res
  }
  return res
}

export async function fetchJson(path: string, opts: RequestInit = {}) {
  const res = await apiFetch(path, opts)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API error ${res.status}: ${text}`)
  }
  return res.json()
}
