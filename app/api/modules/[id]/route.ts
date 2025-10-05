import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '../../auth/[...nextauth]/route'

// GET /api/modules/[id] - Get a specific module
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const module = await prisma.module.findUnique({ where: { id: params.id }, include: { questions: true, enrollments: true } })
    if (!module) return NextResponse.json({ error: 'Module not found' }, { status: 404 })
    return NextResponse.json(module)
  } catch (error) {
    console.error('Error fetching module:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PATCH /api/modules/[id] - Update a module (admin/master practitioner only)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: session.user.id }, include: { role: true } })
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const roleName = profile.role?.name || ''
    if (!['admin', 'master_practitioner'].includes(roleName)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const updated = await prisma.module.update({ where: { id: params.id }, data: body })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating module:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE /api/modules/[id] - Delete a module (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: session.user.id }, include: { role: true } })
    if (!profile || profile.role?.name !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await prisma.module.delete({ where: { id: params.id } })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting module:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
