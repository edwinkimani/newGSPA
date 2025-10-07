import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '@/lib/auth/config'

export const runtime = 'nodejs'

// GET /api/admin/permissions/[id] - Get a specific permission (admin only)
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

    const permission = await prisma.permission.findUnique({
      where: { id: params.id },
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

    if (!permission) {
      return NextResponse.json({ error: 'Permission not found' }, { status: 404 })
    }

    return NextResponse.json(permission)
  } catch (error) {
    console.error('Error fetching permission:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PATCH /api/admin/permissions/[id] - Update a permission (admin only)
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
    const { displayName, description, resource, action } = body

    if (!displayName || !resource || !action) {
      return NextResponse.json({ error: 'Display name, resource, and action are required' }, { status: 400 })
    }

    // Check if permission exists
    const existingPermission = await prisma.permission.findUnique({
      where: { id: params.id }
    })
    if (!existingPermission) {
      return NextResponse.json({ error: 'Permission not found' }, { status: 404 })
    }

    const updatedPermission = await prisma.permission.update({
      where: { id: params.id },
      data: {
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

    return NextResponse.json(updatedPermission)
  } catch (error) {
    console.error('Error updating permission:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE /api/admin/permissions/[id] - Delete a permission (admin only)
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

    // Check if permission exists
    const permission = await prisma.permission.findUnique({
      where: { id: params.id }
    })
    if (!permission) {
      return NextResponse.json({ error: 'Permission not found' }, { status: 404 })
    }

    // Check if permission is assigned to any roles
    const roleCount = await prisma.rolePermission.count({
      where: { permissionId: params.id }
    })
    if (roleCount > 0) {
      return NextResponse.json({ error: 'Cannot delete permission assigned to roles' }, { status: 400 })
    }

    await prisma.permission.delete({
      where: { id: params.id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting permission:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
