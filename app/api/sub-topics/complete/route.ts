import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '@/lib/auth/config'

// POST /api/sub-topics/complete - Mark a subtopic as completed for a user
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { subTopicId, completed = true } = body

    if (!subTopicId) {
      return NextResponse.json({ error: 'subTopicId is required' }, { status: 400 })
    }

    // Get the subtopic with module info
    const subTopic = await prisma.subTopic.findUnique({
      where: { id: subTopicId },
      include: {
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

    // Check if user is enrolled in this module
    const enrollment = await prisma.moduleEnrollment.findUnique({
      where: {
        userId_moduleId: {
          userId: session.user.id,
          moduleId: subTopic.level.module.id
        }
      }
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'User not enrolled in this module' }, { status: 403 })
    }

    // Store completion data in a JSON field in the enrollment
    // Structure: { subtopics: string[], contentProgress: { [contentId]: { completed, completedAt } } }
    const currentData = (enrollment.completedSubTopics as any) || {}
    const currentCompleted = Array.isArray(currentData) ? currentData : (currentData.subtopics || [])
    let updatedCompleted = [...currentCompleted]

    if (completed && !currentCompleted.includes(subTopicId)) {
      updatedCompleted.push(subTopicId)
    } else if (!completed && currentCompleted.includes(subTopicId)) {
      updatedCompleted = currentCompleted.filter((id: string) => id !== subTopicId)
    }

    // Preserve contentProgress if it exists
    const updatedData = {
      ...currentData,
      subtopics: updatedCompleted
    }

    // Update the enrollment with completed subtopics
    await prisma.moduleEnrollment.update({
      where: { id: enrollment.id },
      data: {
        completedSubTopics: updatedData
      }
    })

    // Calculate and update progress
    await updateModuleProgress(session.user.id, subTopic.level.module.id)

    return NextResponse.json({
      success: true,
      completed,
      subTopicId
    })
  } catch (error) {
    console.error('Error marking subtopic complete:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Helper function to calculate and update module progress
async function updateModuleProgress(userId: string, moduleId: string) {
  try {
    // Get the enrollment with completed subtopics
    const enrollment = await prisma.moduleEnrollment.findUnique({
      where: {
        userId_moduleId: {
          userId,
          moduleId
        }
      },
      include: {
        module: {
          include: {
            levels: {
              include: {
                subTopics: true
              }
            }
          }
        }
      }
    })

    if (!enrollment) return

    // Count total subtopics
    const totalSubtopics = enrollment.module.levels.reduce((total, level) => {
      return total + level.subTopics.length
    }, 0)

    if (totalSubtopics === 0) return

    // Count completed subtopics
    const completedData = (enrollment.completedSubTopics as any) || {}
    const completedSubtopics = Array.isArray(completedData)
      ? completedData.length
      : (completedData.subtopics || []).length

    const progressPercentage = Math.round((completedSubtopics / totalSubtopics) * 100)

    // Update the enrollment progress
    await prisma.moduleEnrollment.update({
      where: { id: enrollment.id },
      data: { progressPercentage: Math.min(100, progressPercentage) }
    })

    console.log(`Updated progress for user ${userId} in module ${moduleId}: ${progressPercentage}% (${completedSubtopics}/${totalSubtopics} subtopics)`)
  } catch (error) {
    console.error('Error updating module progress:', error)
  }
}
