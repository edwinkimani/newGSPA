import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '@/lib/auth/config'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subTopicId = params.id

    // Get the subtopic with test
    const subTopic = await prisma.subTopic.findUnique({
      where: { id: subTopicId },
      include: {
        subTopicTest: true,
        level: {
          include: {
            module: true
          }
        }
      }
    })

    if (!subTopic) {
      return NextResponse.json({ error: 'Subtopic not found' }, { status: 404 })
    }

    if (!subTopic.subTopicTest) {
      return NextResponse.json({ error: 'No test available for this subtopic' }, { status: 404 })
    }

    // Check if user is enrolled in this module
    const enrollment = await prisma.moduleEnrollment.findUnique({
      where: {
        userId_moduleId: {
          userId: session.user.id,
          moduleId: subTopic.level.moduleId
        }
      }
    })

    if (!enrollment || enrollment.paymentStatus !== 'COMPLETED') {
      return NextResponse.json({ error: 'User not enrolled in this module' }, { status: 403 })
    }

    // Return test with questions from the JSON field (same as level tests)
    return NextResponse.json({
      ...subTopic.subTopicTest,
      subTopic: {
        id: subTopic.id,
        title: subTopic.title
      },
      module: {
        id: subTopic.level.moduleId,
        title: subTopic.level.module.title
      },
      level: {
        id: subTopic.level.id,
        title: subTopic.level.title
      }
    })
  } catch (error) {
    console.error('Error fetching subtopic test:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
