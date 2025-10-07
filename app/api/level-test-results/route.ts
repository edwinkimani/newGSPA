import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '@/lib/auth/config'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      levelTestId,
      moduleId,
      levelId,
      score,
      totalQuestions,
      correctAnswers,
      answers,
      passed,
      timeSpent
    } = body

    if (!levelTestId || !moduleId || !levelId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Use raw SQL query to avoid Prisma client type issues until schema is regenerated
    const existingResult = await prisma.$queryRaw`
      SELECT id FROM LevelTestResult
      WHERE userId = ${session.user.id} AND levelTestId = ${levelTestId}
    ` as any[]

    let result
    if (existingResult && existingResult.length > 0) {
      // Update existing result
      result = await prisma.$queryRaw`
        UPDATE LevelTestResult
        SET score = ${score}, totalQuestions = ${totalQuestions}, correctAnswers = ${correctAnswers},
            answers = ${JSON.stringify(answers)}, passed = ${passed}, timeSpent = ${timeSpent},
            completedAt = NOW()
        WHERE id = ${existingResult[0].id}
      `
    } else {
      // Create new result
      result = await prisma.$queryRaw`
        INSERT INTO LevelTestResult
        (id, userId, levelTestId, moduleId, levelId, score, totalQuestions, correctAnswers, answers, passed, timeSpent, completedAt, createdAt)
        VALUES
        (UUID(), ${session.user.id}, ${levelTestId}, ${moduleId}, ${levelId}, ${score}, ${totalQuestions}, ${correctAnswers}, ${JSON.stringify(answers)}, ${passed}, ${timeSpent}, NOW(), NOW())
      `
    }

    // If the user passed the level test, check if all levels are completed for module test scheduling
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

          // Check if all levels in the module are now completed (all their subtopics completed)
          const allLevelsCompleted = enrollment.module.levels.every(level => {
            const levelSubTopicIds = level.subTopics?.map((st: any) => st.id) || []
            const completedLevelSubTopics = completedSubTopics.filter(stId => levelSubTopicIds.includes(stId))
            return levelSubTopicIds.length > 0 && levelSubTopicIds.every(stId => completedLevelSubTopics.includes(stId))
          })

          if (allLevelsCompleted && enrollment.examDate) {
            console.log(`All levels completed for module ${moduleId} by user ${session.user.id}. Module test scheduled for ${enrollment.examDate}`)
            // TODO: Send notification/email about module test scheduling
          }
        }
      } catch (enrollmentError) {
        console.error('Error checking module completion:', enrollmentError)
        // Don't fail the test result save if enrollment check fails
      }
    }

    return NextResponse.json({ success: true, message: 'Level test result saved successfully' })
  } catch (error) {
    console.error('Error saving level test result:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
