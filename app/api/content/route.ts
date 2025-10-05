import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '../auth/[...nextauth]/route'

// GET /api/content - Get all content or content for a specific module/level
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(request.url)
    const moduleId = url.searchParams.get('moduleId')
    const levelId = url.searchParams.get('levelId')

    let where: any = {}

    if (moduleId) {
      where.moduleId = moduleId
    }

    if (levelId) {
      where.levelId = levelId
    }

    const content = await prisma.moduleContent.findMany({
      where,
      orderBy: { orderIndex: 'asc' },
      include: {
        module: { select: { title: true } },
        level: { select: { title: true } },
        createdBy: { select: { email: true } }
      }
    })

    return NextResponse.json(content)
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/content - Create new content (master practitioner only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: session.user.id }, include: { role: true } })
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const roleName = profile.role?.name || ''
    if (roleName !== 'master_practitioner') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { moduleId, levelId, ...contentData } = body

    if (!moduleId) return NextResponse.json({ error: 'Module ID is required' }, { status: 400 })

    const content = await prisma.moduleContent.create({
      data: {
        ...contentData,
        moduleId,
        levelId: levelId || null,
        createdById: session.user.id
      }
    })

    return NextResponse.json(content)
  } catch (error) {
    console.error('Error creating content:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT /api/content - Update content (master practitioner only)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: session.user.id }, include: { role: true } })
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const roleName = profile.role?.name || ''
    if (roleName !== 'master_practitioner') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) return NextResponse.json({ error: 'Content ID is required' }, { status: 400 })

    const content = await prisma.moduleContent.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(content)
  } catch (error) {
    console.error('Error updating content:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE /api/content - Delete content (master practitioner only)
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: session.user.id }, include: { role: true } })
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const roleName = profile.role?.name || ''
    if (roleName !== 'master_practitioner') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'Content ID is required' }, { status: 400 })

    await prisma.moduleContent.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting content:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
