import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma/client"
import { authOptions } from '@/lib/auth/config'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { levelTestId, moduleId, levelId, score, totalQuestions, correctAnswers, answers, passed } = body

    if (!levelTestId || !moduleId || !levelId || score === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already has a result for this level test
    const existingResult = await prisma.levelTestResult.findUnique({
      where: {
        userId_levelTestId: {
          userId: session.user.id,
          levelTestId,
        },
      },
    })

    let result
    if (existingResult) {
      // Update existing result
      result = await prisma.levelTestResult.update({
        where: {
          id: existingResult.id,
        },
        data: {
          score,
          totalQuestions,
          correctAnswers,
          answers,
          passed,
          completedAt: new Date(),
        },
      })
    } else {
      // Create new result
      result = await prisma.levelTestResult.create({
        data: {
          userId: session.user.id,
          levelTestId,
          moduleId,
          levelId,
          score,
          totalQuestions,
          correctAnswers,
          answers,
          passed,
        },
      })
    }

    // Update ModuleEnrollment levelTestScores JSON column
    const enrollment = await prisma.moduleEnrollment.findUnique({
      where: {
        userId_moduleId: {
          userId: session.user.id,
          moduleId,
        },
      },
    })

    if (enrollment) {
      // Use type assertion since Prisma client may not be regenerated yet
      const enrollmentWithScores = enrollment as any
      const currentLevelTestScores = enrollmentWithScores.levelTestScores ? JSON.parse(enrollmentWithScores.levelTestScores as string) : {}

      // Update level test score
      currentLevelTestScores[levelId] = {
        score,
        passed,
        completedAt: new Date().toISOString(),
        totalQuestions,
        correctAnswers
      }

      // Update the levelTestScores JSON column
      await prisma.moduleEnrollment.update({
        where: {
          id: enrollment.id,
        },
        data: {
          levelTestScores: JSON.stringify(currentLevelTestScores),
        } as any,
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error saving level test result:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const url = new URL(request.url)
    const levelTestId = url.searchParams.get('levelTestId')
    const userId = url.searchParams.get('userId') || session.user.id

    // Check permissions - users can only see their own results unless they're admin
    const profile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      include: { role: true },
    })

    const isAdminOrMaster = ["admin", "master_practitioner"].includes(profile?.role?.name || "")
    if (userId !== session.user.id && !isAdminOrMaster) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (levelTestId) {
      // Get specific test result
      const result = await prisma.levelTestResult.findUnique({
        where: {
          userId_levelTestId: {
            userId,
            levelTestId,
          },
        },
        include: {
          levelTest: true,
          level: true,
          module: true,
        },
      })

      if (!result) {
        return NextResponse.json({ error: "Test result not found" }, { status: 404 })
      }

      return NextResponse.json(result)
    } else {
      // Get all test results for the user
      const results = await prisma.levelTestResult.findMany({
        where: { userId },
        include: {
          levelTest: true,
          level: true,
          module: true
        },
        orderBy: { completedAt: 'desc' }
      })

      return NextResponse.json(results.map(result => ({
        id: result.id,
        score: result.score,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        answers: result.answers,
        passed: result.passed,
        completedAt: result.completedAt,
        levelTest: {
          id: result.levelTest.id,
          title: result.levelTest.title,
          description: result.levelTest.description
        },
        level: {
          id: result.level.id,
          title: result.level.title
        },
        module: {
          id: result.module.id,
          title: result.module.title
        }
      })))
    }
  } catch (error) {
    console.error("Error fetching level test result:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
