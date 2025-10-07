import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '@/lib/auth/config'

// GET /api/admin/roles/[id] - Get a specific role (admin only)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const role = await prisma.role.findUnique({
      where: { id: params.id },
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

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    return NextResponse.json(role)
  } catch (error) {
    console.error('Error fetching role:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PATCH /api/admin/roles/[id] - Update a role (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const { displayName, description } = body

    if (!displayName) {
      return NextResponse.json({ error: 'Display name is required' }, { status: 400 })
    }

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id: params.id }
    })
    if (!existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    // Prevent updating system roles' names
    if (existingRole.isSystem && body.name && body.name !== existingRole.name) {
      return NextResponse.json({ error: 'Cannot change name of system roles' }, { status: 400 })
    }

    const updatedRole = await prisma.role.update({
      where: { id: params.id },
      data: {
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

    return NextResponse.json(updatedRole)
  } catch (error) {
    console.error('Error updating role:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE /api/admin/roles/[id] - Delete a role (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Check if role exists and is not a system role
    const role = await prisma.role.findUnique({
      where: { id: params.id }
    })
    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    if (role.isSystem) {
      return NextResponse.json({ error: 'Cannot delete system roles' }, { status: 400 })
    }

    // Check if role has users assigned
    const userCount = await prisma.profile.count({
      where: { roleId: params.id }
    })
    if (userCount > 0) {
      return NextResponse.json({ error: 'Cannot delete role with assigned users' }, { status: 400 })
    }

    await prisma.role.delete({
      where: { id: params.id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting role:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
