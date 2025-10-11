import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma/client"
import { authOptions } from '@/lib/auth/config'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const url = new URL(request.url)
    const userId = url.searchParams.get('userId') || session.user.id
    const type = url.searchParams.get('type') || 'all'

    // Check permissions - users can only see their own results unless they're admin
    const profile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      include: { role: true },
    })

    const isAdminOrMaster = ["admin", "master_practitioner"].includes(profile?.role?.name || "")
    if (userId !== session.user.id && !isAdminOrMaster) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const results: any[] = []

    // Fetch level test results
    if (type === 'all' || type === 'level') {
      const levelResults = await prisma.levelTestResult.findMany({
        where: { userId },
        include: {
          levelTest: true,
          level: true,
          module: true
        },
        orderBy: { completedAt: 'desc' }
      })

      levelResults.forEach(result => {
        results.push({
          id: result.id,
          type: 'level',
          testId: result.levelTestId,
          testTitle: result.levelTest.title,
          testDescription: result.levelTest.description,
          score: result.score,
          totalQuestions: result.totalQuestions,
          correctAnswers: result.correctAnswers,
          passed: result.passed,
          completedAt: result.completedAt.toISOString(),
          module: {
            id: result.module.id,
            title: result.module.title
          },
          level: {
            id: result.level.id,
            title: result.level.title
          },
          subtopic: null
        })
      })
    }

    // Fetch subtopic test results
    if (type === 'all' || type === 'subtopic') {
      const subtopicResults = await prisma.subTopicTestResult.findMany({
        where: { userId },
        include: {
          subTopicTest: true,
          subTopic: true,
          level: true,
          module: true
        },
        orderBy: { completedAt: 'desc' }
      })

      subtopicResults.forEach(result => {
        results.push({
          id: result.id,
          type: 'subtopic',
          testId: result.subTopicTestId,
          testTitle: result.subTopicTest.title,
          testDescription: result.subTopicTest.description,
          score: result.score,
          totalQuestions: result.totalQuestions,
          correctAnswers: result.correctAnswers,
          passed: result.passed,
          completedAt: result.completedAt.toISOString(),
          module: {
            id: result.module.id,
            title: result.module.title
          },
          level: {
            id: result.level.id,
            title: result.level.title
          },
          subtopic: {
            id: result.subTopic.id,
            title: result.subTopic.title
          }
        })
      })
    }

    // Sort all results by completedAt descending
    results.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error fetching test results:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}