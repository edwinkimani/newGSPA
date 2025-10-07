import { verifyToken } from '@/lib/auth/auth-utils'
import { NextRequest } from 'next/server'

export interface AuthUser {
  id?: string
  email?: string
}

export function getUserFromAuthHeader(req: Request | NextRequest): AuthUser | null {
  const auth = (req as any).headers?.get ? (req as any).headers.get('authorization') || (req as any).headers.get('Authorization') : undefined
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : auth
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload || typeof payload !== 'object') return null
  return { id: (payload as any).sub || (payload as any).id, email: (payload as any).email }
}
