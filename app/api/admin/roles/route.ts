import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '../../auth/[...nextauth]/route'

// GET /api/admin/roles - Get all roles (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const authProfile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    })
    if (!authProfile || authProfile.role?.name !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const roles = await prisma.role.findMany({
      include: {
        profiles: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        permissions: {
          include: {
            permission: true
          }
        },
        _count: {
          select: {
            profiles: true,
            permissions: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(roles)
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/admin/roles - Create a new role (admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const authProfile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    })
    if (!authProfile || authProfile.role?.name !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, displayName, description } = body

    if (!name || !displayName) {
      return NextResponse.json({ error: 'Name and display name are required' }, { status: 400 })
    }

    // Check if role name already exists
    const existingRole = await prisma.role.findUnique({
      where: { name }
    })
    if (existingRole) {
      return NextResponse.json({ error: 'Role name already exists' }, { status: 400 })
    }

    const role = await prisma.role.create({
      data: {
        name,
        displayName,
        description: description || null
      },
      include: {
        profiles: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        permissions: {
          include: {
            permission: true
          }
        },
        _count: {
          select: {
            profiles: true,
            permissions: true
          }
        }
      }
    })

    return NextResponse.json(role)
  } catch (error) {
    console.error('Error creating role:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
