import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '../auth/[...nextauth]/route'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { contentId, completed = true } = body

    if (!contentId) {
      return NextResponse.json({ error: 'contentId is required' }, { status: 400 })
    }

    // Check if this is a subtopic content
    const subTopicContent = await prisma.subTopicContent.findUnique({
      where: { id: contentId },
      include: {
        subTopic: {
          include: {
            level: {
              include: {
                module: true
              }
            }
          }
        }
      }
    })

    if (!subTopicContent) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    // Get user's enrollment for this module
    const enrollment = await prisma.moduleEnrollment.findUnique({
      where: {
        userId_moduleId: {
          userId: session.user.id,
          moduleId: subTopicContent.subTopic.level.module.id
        }
      }
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'User not enrolled in this module' }, { status: 403 })
    }

    // For subtopic content progress, we'll store in the completedSubTopics JSON field
    // Structure: { subtopics: string[], contentProgress: { [contentId]: { completed, completedAt } } }

    // Get current progress data from completedSubTopics
    const currentData = (enrollment.completedSubTopics as any) || {}

    // Ensure it's an object with the right structure
    const progressData = typeof currentData === 'object' && !Array.isArray(currentData)
      ? currentData
      : { subtopics: Array.isArray(currentData) ? currentData : [] }

    // Update progress for this content
    if (!progressData.contentProgress) {
      progressData.contentProgress = {}
    }

    progressData.contentProgress[contentId] = {
      completed: completed,
      completedAt: completed ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString()
    }

    // Update the enrollment with the progress data
    await prisma.moduleEnrollment.update({
      where: { id: enrollment.id },
      data: {
        completedSubTopics: progressData
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving user progress:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const enrollmentId = searchParams.get('enrollmentId')

    if (!enrollmentId) {
      return NextResponse.json({ error: 'enrollmentId is required' }, { status: 400 })
    }

    // Get enrollment to access completedSubTopics
    const enrollment = await prisma.moduleEnrollment.findFirst({
      where: {
        id: enrollmentId,
        userId: session.user.id
      },
      select: {
        completedSubTopics: true
      }
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })
    }

    // Extract content progress from completedSubTopics
    const progressData = (enrollment.completedSubTopics as any) || {}
    const contentProgress = typeof progressData === 'object' && !Array.isArray(progressData)
      ? (progressData.contentProgress || {})
      : {}

    // Convert to the expected format
    const progress = Object.entries(contentProgress).map(([contentId, data]: [string, any]) => ({
      content_id: contentId,
      completed: data.completed,
      completed_at: data.completedAt
    }))

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error fetching user progress:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
