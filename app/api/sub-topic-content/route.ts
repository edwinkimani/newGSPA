import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const subTopicId = searchParams.get('subTopicId')

    if (!subTopicId) {
      return NextResponse.json({ error: 'subTopicId is required' }, { status: 400 })
    }

    const contents = await prisma.subTopicContent.findMany({
      where: {
        subTopicId,
        isPublished: true
      },
      orderBy: { orderIndex: 'asc' }
    })

    return NextResponse.json(contents)
  } catch (error) {
    console.error('Error fetching sub-topic content:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { subTopicId, title, description, contentType, contentUrl, contentText, durationMinutes, isRequired, orderIndex, isPublished } = body

    if (!subTopicId || !title) {
      return NextResponse.json({ error: 'subTopicId and title are required' }, { status: 400 })
    }

    // Check if user is master practitioner
    const userProfile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    })

    if (userProfile?.role?.name !== 'master_practitioner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log('Creating content with contentText:', contentText)
    const content = await prisma.subTopicContent.create({
      data: {
        subTopicId,
        title,
        description,
        contentType,
        contentUrl,
        contentText,
        durationMinutes,
        isRequired: isRequired ?? true,
        orderIndex: orderIndex ?? 0,
        isPublished: isPublished ?? false,
        createdById: session.user.id
      }
    })
    console.log('Created content with id:', content.id, 'contentText length:', content.contentText?.length)

    return NextResponse.json(content)
  } catch (error) {
    console.error('Error creating sub-topic content:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
