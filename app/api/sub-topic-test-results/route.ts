import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma/client"
import { authOptions } from '@/lib/auth/config'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const {
      subTopicTestId,
      moduleId,
      levelId,
      subtopicId,
      score,
      totalQuestions,
      correctAnswers,
      answers,
      passed
    } = await request.json()

    if (!subTopicTestId || !moduleId || !levelId || !subtopicId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already has a result for this sub-topic test
    const existingResult = await prisma.subTopicTestResult.findFirst({
      where: {
        userId: session.user.id,
        subTopicTestId: subTopicTestId
      }
    })

    let result
    if (existingResult) {
      // Update existing result
      result = await prisma.subTopicTestResult.update({
        where: { id: existingResult.id },
        data: {
          score,
          totalQuestions,
          correctAnswers,
          answers: JSON.stringify(answers),
          passed,
          completedAt: new Date()
        }
      })
    } else {
      // Create new result
      result = await prisma.subTopicTestResult.create({
        data: {
          userId: session.user.id,
          subTopicTestId,
          moduleId,
          levelId,
          subTopicId: subtopicId,
          score,
          totalQuestions,
          correctAnswers,
          answers: JSON.stringify(answers),
          passed,
          completedAt: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      result: {
        id: result.id,
        score: result.score,
        passed: result.passed,
        completedAt: result.completedAt
      }
    })
  } catch (error) {
    console.error("Error saving sub-topic test result:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const url = new URL(request.url)
    const subTopicTestId = url.searchParams.get('subTopicTestId')
    const userId = url.searchParams.get('userId') || session.user.id

    // Check if user is requesting their own data or is admin/master practitioner
    const profile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      include: { role: true },
    })

    const isAdminOrMaster = ["admin", "master_practitioner"].includes(profile?.role?.name || "")
    if (userId !== session.user.id && !isAdminOrMaster) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (subTopicTestId) {
      // Get specific test result
      const result = await prisma.subTopicTestResult.findFirst({
        where: {
          userId: userId,
          subTopicTestId: subTopicTestId
        },
        include: {
          subTopicTest: true,
          subTopic: true,
          level: true,
          module: true
        }
      })

      if (!result) {
        return NextResponse.json({ error: "Test result not found" }, { status: 404 })
      }

      return NextResponse.json({
        id: result.id,
        score: result.score,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        answers: JSON.parse(result.answers as string),
        passed: result.passed,
        completedAt: result.completedAt,
        subTopicTest: {
          id: result.subTopicTest.id,
          title: result.subTopicTest.title,
          description: result.subTopicTest.description
        },
        subTopic: {
          id: result.subTopic.id,
          title: result.subTopic.title
        },
        level: {
          id: result.level.id,
          title: result.level.title
        },
        module: {
          id: result.module.id,
          title: result.module.title
        }
      })
    } else {
      // Get all test results for the user
      const results = await prisma.subTopicTestResult.findMany({
        where: {
          userId: userId
        },
        include: {
          subTopicTest: true,
          subTopic: true,
          level: true,
          module: true
        },
        orderBy: {
          completedAt: 'desc'
        }
      })

      return NextResponse.json(results.map(result => ({
        id: result.id,
        score: result.score,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        answers: JSON.parse(result.answers as string),
        passed: result.passed,
        completedAt: result.completedAt,
        subTopicTest: {
          id: result.subTopicTest.id,
          title: result.subTopicTest.title,
          description: result.subTopicTest.description
        },
        subTopic: {
          id: result.subTopic.id,
          title: result.subTopic.title
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
    console.error("Error fetching sub-topic test result:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
