import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '../auth/[...nextauth]/route'

// GET /api/modules - Get all modules
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const active = url.searchParams.get('active')

    // Allow unauthenticated access for active modules only
    if (active !== 'true') {
      const session = await getServerSession(authOptions)
      if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const whereClause = active === 'true' ? { isActive: true } : {}

    const modules = await prisma.module.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: { questions: { select: { id: true } }, enrollments: true }
    })

    return NextResponse.json(modules)
  } catch (error) {
    console.error('Error fetching modules:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/modules - Create a new module (admin/master practitioner only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: session.user.id }, include: { role: true } })
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const roleName = profile.role?.name || ''
    if (!['admin', 'master_practitioner'].includes(roleName)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const module = await prisma.module.create({ data: { ...body, createdById: session.user.id } })
    return NextResponse.json(module)
  } catch (error) {
    console.error('Error creating module:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT /api/modules - Update a module (admin/master practitioner only)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: session.user.id }, include: { role: true } })
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const roleName = profile.role?.name || ''
    if (!['admin', 'master_practitioner'].includes(roleName)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) return NextResponse.json({ error: 'Module ID is required' }, { status: 400 })

    const module = await prisma.module.update({
      where: { id },
      data: updateData
    })
    return NextResponse.json(module)
  } catch (error) {
    console.error('Error updating module:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE /api/modules - Delete a module (admin/master practitioner only)
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: session.user.id }, include: { role: true } })
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const roleName = profile.role?.name || ''
    if (!['admin', 'master_practitioner'].includes(roleName)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'Module ID is required' }, { status: 400 })

    await prisma.module.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting module:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
