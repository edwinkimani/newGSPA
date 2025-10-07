import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '@/lib/auth/config'

export const runtime = 'nodejs'

// GET /api/admin/roles/[id]/permissions - Get permissions for a role (admin only)
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

    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId: params.id },
      include: {
        permission: true
      }
    })

    return NextResponse.json(rolePermissions)
  } catch (error) {
    console.error('Error fetching role permissions:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/admin/roles/[id]/permissions - Assign permission to role (admin only)
export async function POST(
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
    const { permissionId } = body

    if (!permissionId) {
      return NextResponse.json({ error: 'Permission ID is required' }, { status: 400 })
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: params.id }
    })
    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    // Check if permission exists
    const permission = await prisma.permission.findUnique({
      where: { id: permissionId }
    })
    if (!permission) {
      return NextResponse.json({ error: 'Permission not found' }, { status: 404 })
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId: params.id,
          permissionId: permissionId
        }
      }
    })
    if (existingAssignment) {
      return NextResponse.json({ error: 'Permission already assigned to role' }, { status: 400 })
    }

    const rolePermission = await prisma.rolePermission.create({
      data: {
        roleId: params.id,
        permissionId: permissionId
      },
      include: {
        permission: true,
        role: true
      }
    })

    return NextResponse.json(rolePermission)
  } catch (error) {
    console.error('Error assigning permission to role:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE /api/admin/roles/[id]/permissions - Remove permission from role (admin only)
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

    const body = await request.json()
    const { permissionId } = body

    if (!permissionId) {
      return NextResponse.json({ error: 'Permission ID is required' }, { status: 400 })
    }

    // Check if assignment exists
    const existingAssignment = await prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId: params.id,
          permissionId: permissionId
        }
      }
    })
    if (!existingAssignment) {
      return NextResponse.json({ error: 'Permission not assigned to role' }, { status: 404 })
    }

    await prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId: params.id,
          permissionId: permissionId
        }
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error removing permission from role:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
