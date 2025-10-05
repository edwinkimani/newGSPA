import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { verifyPassword, generateToken } from '@/lib/auth/auth-utils'
import { profileToClient } from '@/lib/api/serializers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })

    // find user by email
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const ok = await verifyPassword(password, user.password)
    if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    // load profile if exists
    const profile = await prisma.profile.findUnique({ where: { id: user.id }, include: { role: true } })

    const token = generateToken({ sub: user.id, email: user.email }, '7d')

    // Create response with token in httpOnly cookie
    const response = NextResponse.json({ token, profile: profileToClient(profile), id: user.id, email: user.email })

    // Set httpOnly cookie for middleware
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Signin error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
