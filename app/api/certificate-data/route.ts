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

    const userId = session.user.id

    // Get user's profile
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      include: { role: true }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get all user's enrollments
    const enrollments = await prisma.moduleEnrollment.findMany({
      where: { userId },
      include: {
        module: {
          include: {
            levels: {
              include: {
                subTopics: {
                  include: {
                    subTopicTest: true
                  }
                },
                levelTest: true
              }
            }
          }
        }
      }
    })

    const certificateData = {
      user: {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        role: profile.role?.name || 'practitioner'
      },
      modules: [] as any[]
    }

    // Process each enrolled module
    for (const enrollment of enrollments) {
      const moduleData = {
        id: enrollment.module.id,
        title: enrollment.module.title,
        levels: [] as any[],
        averageScore: 0,
        totalHours: enrollment.module.estimatedDuration || 0,
        completedAt: enrollment.completedAt
      }

      let totalScore = 0
      let scoreCount = 0

      // Process levels in this module
      for (const level of enrollment.module.levels) {
        const levelData = {
          id: level.id,
          title: level.title,
          subTopics: [] as any[],
          levelTest: null as any,
          averageScore: 0,
          estimatedDuration: level.estimatedDuration || 0
        }

        let levelScore = 0
        let levelScoreCount = 0

        // Get sub-topic test results for this level
        for (const subTopic of level.subTopics) {
          const subTopicResult = await prisma.subTopicTestResult.findUnique({
            where: {
              userId_subTopicTestId: {
                userId,
                subTopicTestId: subTopic.subTopicTest?.id || ''
              }
            }
          })

          if (subTopicResult) {
            levelData.subTopics.push({
              id: subTopic.id,
              title: subTopic.title,
              score: subTopicResult.score,
              passed: subTopicResult.passed,
              timeSpent: subTopicResult.timeSpent,
              completedAt: subTopicResult.completedAt
            })

            levelScore += subTopicResult.score
            levelScoreCount++
            totalScore += subTopicResult.score
            scoreCount++
          }
        }

        // Get level test result
        if (level.levelTest) {
          const levelResult = await prisma.$queryRaw`
            SELECT * FROM LevelTestResult
            WHERE userId = ${userId} AND levelTestId = ${level.levelTest.id}
            ORDER BY completedAt DESC LIMIT 1
          ` as any[]

          if (levelResult && levelResult.length > 0) {
            const result = levelResult[0]
            levelData.levelTest = {
              score: result.score,
              passed: result.passed,
              timeSpent: result.timeSpent,
              completedAt: result.completedAt
            }

            levelScore += result.score
            levelScoreCount++
            totalScore += result.score
            scoreCount++
          }
        }

        // Calculate level average
        levelData.averageScore = levelScoreCount > 0 ? Math.round(levelScore / levelScoreCount) : 0
        moduleData.levels.push(levelData)
      }

      // Calculate module average
      moduleData.averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0
      certificateData.modules.push(moduleData)
    }

    return NextResponse.json(certificateData)
  } catch (error) {
    console.error('Error fetching certificate data:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
