import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '@/lib/auth/config'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const subTopic = await prisma.subTopic.findUnique({
      where: { id: params.id },
      include: {
        contents: {
          orderBy: { orderIndex: 'asc' }
        },
        subTopicTest: true,
        level: {
          include: {
            module: true
          }
        }
      }
    })

    if (!subTopic) {
      return NextResponse.json({ error: 'Sub-topic not found' }, { status: 404 })
    }

    return NextResponse.json(subTopic)
  } catch (error) {
    console.error('Error fetching sub-topic:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is master practitioner
    const userProfile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    })

    if (userProfile?.role?.name !== 'master_practitioner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, orderIndex, isActive, estimatedDuration, learningObjectives, readingMaterial } = body

    const subTopic = await prisma.subTopic.update({
      where: { id: params.id },
      data: {
        title,
        description,
        orderIndex,
        isActive,
        estimatedDuration,
        learningObjectives,
        readingMaterial,
        // attachments: body.attachments,
        // externalLinks: body.externalLinks
      },
      include: {
        contents: true,
        subTopicTest: true
      }
    })

    return NextResponse.json(subTopic)
  } catch (error) {
    console.error('Error updating sub-topic:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is master practitioner
    const userProfile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    })

    if (userProfile?.role?.name !== 'master_practitioner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.subTopic.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Sub-topic deleted successfully' })
  } catch (error) {
    console.error('Error deleting sub-topic:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}