import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '../auth/[...nextauth]/route'


// GET /api/users - Get all users (admin only)
export async function GET() {
  try {
    // Get session using NextAuth
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // load profile to check role
    const authProfile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    })
    if (!authProfile || (authProfile.role?.name !== 'admin' && authProfile.role?.name !== 'master_practitioner')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await prisma.profile.findMany({
      orderBy: { createdAt: 'desc' },
      include: { role: true }
    })
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/users - Create a new user profile
export async function POST(request: Request) {
  try {
    // Get session using NextAuth
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const profile = await prisma.profile.upsert({
      where: { id: session.user.id },
      update: { ...body },
      create: { id: session.user.id, email: session.user.email || body.email || '', ...body }
    })

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error creating user profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
