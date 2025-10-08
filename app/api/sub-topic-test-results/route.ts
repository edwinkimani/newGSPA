import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '@/lib/auth/config'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const levelId = url.searchParams.get('levelId')

    if (!userId || !levelId) {
      return NextResponse.json({ error: 'userId and levelId are required' }, { status: 400 })
    }

    // Only allow users to fetch their own results
    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results = await prisma.$queryRaw`
      SELECT str.*, stt.subTopicId
      FROM SubTopicTestResult str
      JOIN SubTopicTest stt ON str.subTopicTestId = stt.id
      WHERE str.userId = ${userId} AND str.levelId = ${levelId}
      ORDER BY str.completedAt DESC
    ` as any[]

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error fetching sub-topic test results:', error)
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
    const {
      subTopicTestId,
      moduleId,
      levelId,
      subTopicId,
      score,
      totalQuestions,
      correctAnswers,
      answers,
      passed,
      timeSpent
    } = body

    if (!subTopicTestId || !moduleId || !levelId || !subTopicId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Use raw SQL query to avoid Prisma client type issues
    const existingResult = await prisma.$queryRaw`
      SELECT id FROM SubTopicTestResult
      WHERE userId = ${session.user.id} AND subTopicTestId = ${subTopicTestId}
    ` as any[]

    let result
    if (existingResult && existingResult.length > 0) {
      // Update existing result
      result = await prisma.$queryRaw`
        UPDATE SubTopicTestResult
        SET score = ${score}, totalQuestions = ${totalQuestions}, correctAnswers = ${correctAnswers},
            answers = ${JSON.stringify(answers)}, passed = ${passed}, timeSpent = ${timeSpent},
            completedAt = NOW()
        WHERE id = ${existingResult[0].id}
      `
    } else {
      // Create new result
      result = await prisma.$queryRaw`
        INSERT INTO SubTopicTestResult
        (id, userId, subTopicTestId, moduleId, levelId, subTopicId, score, totalQuestions, correctAnswers, answers, passed, timeSpent, completedAt, createdAt)
        VALUES
        (UUID(), ${session.user.id}, ${subTopicTestId}, ${moduleId}, ${levelId}, ${subTopicId}, ${score}, ${totalQuestions}, ${correctAnswers}, ${JSON.stringify(answers)}, ${passed}, ${timeSpent}, NOW(), NOW())
      `
    }

    // If the user passed the test, mark the subtopic as completed in their enrollment
    if (passed) {
      try {
        // Find the user's enrollment for this module
        const enrollment = await prisma.moduleEnrollment.findUnique({
          where: {
            userId_moduleId: {
              userId: session.user.id,
              moduleId: moduleId,
            },
          },
          include: {
            module: {
              include: {
                levels: {
                  include: {
                    subTopics: true,
                  },
                },
              },
            },
          },
        })

        if (enrollment) {
          // Get current completed subtopics array
          const completedSubTopics = enrollment.completedSubTopics as string[] || []

          // Add the subtopicId if it's not already completed
          if (!completedSubTopics.includes(subTopicId)) {
            const updatedCompletedSubTopics = [...completedSubTopics, subTopicId]

            // Check if all subtopics in this level are now completed
            const level = enrollment.module.levels.find(l => l.id === levelId)
            if (level) {
              const levelSubTopicIds = level.subTopics.map(st => st.id)
              const completedLevelSubTopics = updatedCompletedSubTopics.filter(stId => levelSubTopicIds.includes(stId))

              const levelCompleted = levelSubTopicIds.length > 0 && levelSubTopicIds.every(stId => completedLevelSubTopics.includes(stId))

              if (levelCompleted) {
                console.log(`Level ${levelId} completed by user ${session.user.id}. Level test should be triggered.`)
                // TODO: Trigger level test notification/email to user
              }
            }

            // Check if all levels in the module are now completed
            const allLevelsCompleted = enrollment.module.levels.every(level => {
              const levelSubTopicIds = level.subTopics.map(st => st.id)
              const completedLevelSubTopics = updatedCompletedSubTopics.filter(stId => levelSubTopicIds.includes(stId))
              return levelSubTopicIds.length > 0 && levelSubTopicIds.every(stId => completedLevelSubTopics.includes(stId))
            })

            if (allLevelsCompleted) {
              console.log(`Module ${moduleId} completed by user ${session.user.id}. Module test should be scheduled.`)
              // TODO: Schedule module test for exam date
            }

            // Update the enrollment
            await prisma.moduleEnrollment.update({
              where: { id: enrollment.id },
              data: {
                completedSubTopics: updatedCompletedSubTopics,
              },
            })

            console.log(`Marked subtopic ${subTopicId} as completed for user ${session.user.id} in module ${moduleId}`)
          }
        }
      } catch (enrollmentError) {
        console.error('Error updating enrollment progress:', enrollmentError)
        // Don't fail the test result save if enrollment update fails
      }
    }

    return NextResponse.json({ success: true, message: 'Test result saved successfully' })
  } catch (error) {
    console.error('Error saving sub-topic test result:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
