import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '../../auth/[...nextauth]/route'

export const runtime = 'nodejs'

// GET /api/admin/permissions - Get all permissions (admin only)
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

    const permissions = await prisma.permission.findMany({
      include: {
        roles: {
          include: {
            role: true
          }
        },
        _count: {
          select: {
            roles: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(permissions)
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/admin/permissions - Create a new permission (admin only)
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
    const { name, displayName, description, resource, action } = body

    if (!name || !displayName || !resource || !action) {
      return NextResponse.json({ error: 'Name, display name, resource, and action are required' }, { status: 400 })
    }

    // Check if permission name already exists
    const existingPermission = await prisma.permission.findUnique({
      where: { name }
    })
    if (existingPermission) {
      return NextResponse.json({ error: 'Permission name already exists' }, { status: 400 })
    }

    const permission = await prisma.permission.create({
      data: {
        name,
        displayName,
        description: description || null,
        resource,
        action
      },
      include: {
        roles: {
          include: {
            role: true
          }
        },
        _count: {
          select: {
            roles: true
          }
        }
      }
    })

    return NextResponse.json(permission)
  } catch (error) {
    console.error('Error creating permission:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
