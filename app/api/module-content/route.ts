import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '@/lib/auth/config'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(request.url)
    const levelId = url.searchParams.get('levelId')

    if (!levelId) return NextResponse.json({ error: 'Level ID is required' }, { status: 400 })

    // Get subtopics for the level
    const subtopics = await prisma.subTopic.findMany({
      where: { levelId },
      orderBy: { orderIndex: 'asc' }
    })

    // Get content for all subtopics
    const subtopicIds = subtopics.map(s => s.id)
    const allContent = await prisma.subTopicContent.findMany({
      where: { subTopicId: { in: subtopicIds } },
      orderBy: { orderIndex: 'asc' }
    })

    // Structure: [{ id, title, ...subtopic, content: [ ... ] }]
    const result = subtopics.map(subtopic => ({
      id: subtopic.id,
      title: subtopic.title,
      description: subtopic.description,
      orderIndex: subtopic.orderIndex,
      content: allContent
        .filter(c => c.subTopicId === subtopic.id)
        .map(c => ({
          id: c.id,
          title: c.title,
          description: c.description,
          orderIndex: c.orderIndex,
          publishedAt: c.publishedAt
        }))
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching module content:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
