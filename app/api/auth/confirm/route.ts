import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { verifyToken as verifyJwt, generateToken } from '@/lib/auth/auth-utils'
import { profileToClient } from '@/lib/api/serializers'

async function handleToken(token?: string) {
  if (!token) return { status: 400, body: { error: 'Token is required' } }

  // ensure token is a valid JWT
  const payload = verifyJwt(token)
  if (!payload) return { status: 400, body: { error: 'Invalid or expired token' } }

  // find user by stored verifyToken
  const user = await prisma.user.findUnique({ where: { verifyToken: token } })
  if (!user) return { status: 404, body: { error: 'Token not found' } }

  // mark user as verified and clear the verify token
  await prisma.user.update({ where: { id: user.id }, data: { isVerified: true, verifyToken: null } })

  // load profile
  const profile = await prisma.profile.findUnique({ where: { id: user.id }, include: { role: true } })

  // generate auth JWT for client (auto-login)
  const authToken = generateToken({ sub: user.id, email: user.email }, '7d')

  return { status: 200, body: { token: authToken, profile: profileToClient(profile), id: user.id, email: user.email } }
}

export async function GET(request: Request) {
  try {
    // Expect path-style token or query param; extract from request url path
    const url = new URL(request.url)
    // path may be like /api/auth/confirm/<token> or query param
    const pathParts = url.pathname.split('/').filter(Boolean)
    // find last segment as token if present
    let token: string | undefined = undefined
    if (pathParts.length >= 4) {
      token = pathParts[pathParts.length - 1]
    }
    if (!token) token = url.searchParams.get('token') || undefined

    const result = await handleToken(token)

    if (result.status !== 200) {
      return NextResponse.json(result.body, { status: result.status })
    }

    // Return JSON response for programmatic handling
    // The client will handle the redirect to avoid NextAuth interception
    return NextResponse.json(result.body, { status: result.status })
  } catch (error) {
    console.error('Confirm GET error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const token = body?.token
    const result = await handleToken(token)
    return NextResponse.json(result.body, { status: result.status })
  } catch (error) {
    console.error('Confirm POST error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
