import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '@/lib/auth/config'

// GET /api/users/[id] - Get a specific user profile
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Users can only access their own profile unless they're admin
    if (session.user.id !== params.id) {
      const authProfile = await prisma.profile.findUnique({ where: { id: session.user.id }, include: { role: true } })
      if (!authProfile || authProfile.role?.name !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const profile = await prisma.profile.findUnique({ where: { id: params.id } })
    if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PATCH /api/users/[id] - Update a user profile
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (session.user.id !== params.id) {
      const authProfile = await prisma.profile.findUnique({ where: { id: session.user.id }, include: { role: true } })
      if (!authProfile || authProfile.role?.name !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const body = await request.json()
    const updated = await prisma.profile.update({ where: { id: params.id }, data: body })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE /api/users/[id] - Delete a user profile (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const authProfile = await prisma.profile.findUnique({ where: { id: session.user.id }, include: { role: true } })
    if (!authProfile || authProfile.role?.name !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.profile.delete({ where: { id: params.id } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting user profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
