import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '@/lib/auth/config'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const content = await prisma.subTopicContent.findUnique({
      where: { id: params.id },
      include: {
        subTopic: {
          include: {
            level: {
              include: {
                module: true
              }
            }
          }
        },
        createdBy: {
          include: {
            profile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    })

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    return NextResponse.json(content)
  } catch (error) {
    console.error('Error fetching sub-topic content:', error)
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
    const { title, description, contentType, contentUrl, contentText, durationMinutes, isRequired, orderIndex, isPublished } = body

    console.log('Updating content with contentText:', contentText?.substring(0, 200) + '...')

    const content = await prisma.subTopicContent.update({
      where: { id: params.id },
      data: {
        title,
        description,
        contentType,
        contentUrl,
        contentText,
        durationMinutes,
        isRequired,
        orderIndex,
        isPublished
      }
    })

    console.log('Updated content with id:', content.id, 'contentText length:', content.contentText?.length)

    return NextResponse.json(content)
  } catch (error) {
    console.error('Error updating sub-topic content:', error)
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

    await prisma.subTopicContent.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Content deleted successfully' })
  } catch (error) {
    console.error('Error deleting sub-topic content:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
