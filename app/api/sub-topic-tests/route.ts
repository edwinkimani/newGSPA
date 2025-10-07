import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma/client"
import { authOptions } from '@/lib/auth/config'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const subTopicId = searchParams.get("subTopicId")

    if (!subTopicId) {
      return NextResponse.json({ error: "subTopicId is required" }, { status: 400 })
    }

    const test = await prisma.subTopicTest.findUnique({
      where: { subTopicId },
    })

    if (!test) {
      return NextResponse.json(null)
    }

    // Resolve question IDs to full question objects
    let resolvedQuestions = []
    if (test.questions && Array.isArray(test.questions)) {
      resolvedQuestions = await Promise.all(
        test.questions.map(async (question: any) => {
          if (typeof question === "string") {
            // It's a question ID, fetch the full question with options
            const fullQuestion = await prisma.testQuestion.findUnique({
              where: { id: question },
              include: { options: true }
            })
            return fullQuestion
          } else {
            // It's already a full question object
            return question
          }
        }),
      )
      // Filter out null values (in case some IDs don't exist)
      resolvedQuestions = resolvedQuestions.filter((q) => q !== null)
    }

    return NextResponse.json({
      ...test,
      questions: resolvedQuestions,
    })
  } catch (error) {
    console.error("Error fetching sub-topic test:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { subTopicId, title, description, questions = [], totalQuestions, passingScore, timeLimit, isActive } = body

    console.log("[v0] Creating test with questions:", questions)
    console.log("[v0] Questions array length:", questions.length)
    console.log("[v0] Questions array type:", Array.isArray(questions))

    if (!subTopicId || !title) {
      return NextResponse.json({ error: "subTopicId and title are required" }, { status: 400 })
    }

    // Check if user is master practitioner
    const userProfile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      include: { role: true },
    })

    if (userProfile?.role?.name !== "master_practitioner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if test already exists for this sub-topic
    const existingTest = await prisma.subTopicTest.findUnique({
      where: { subTopicId },
    })

    if (existingTest) {
      return NextResponse.json({ error: "Test already exists for this sub-topic" }, { status: 400 })
    }

    const questionIds = Array.isArray(questions) ? questions : []

    console.log("[v0] Processed question IDs:", questionIds)

    const test = await prisma.subTopicTest.create({
      data: {
        subTopicId,
        title,
        description,
        questions: questionIds, // Use the processed questionIds array
        totalQuestions,
        passingScore: passingScore || 70,
        timeLimit: timeLimit || 600,
        isActive: isActive ?? true,
      },
    })

    console.log("[v0] Created test:", test)
    console.log("[v0] Test questions field:", test.questions)

    return NextResponse.json(test)
  } catch (error) {
    console.error("Error creating sub-topic test:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()

    if (!id) {
      return NextResponse.json({ error: "Test ID is required" }, { status: 400 })
    }

    const body = await request.json()
    const { title, description, questions = [], totalQuestions, passingScore, timeLimit, isActive } = body

    console.log("[v0] Updating test with questions:", questions)
    console.log("[v0] Questions array length:", questions.length)

    // Check if user is master practitioner
    const userProfile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      include: { role: true },
    })

    if (userProfile?.role?.name !== "master_practitioner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if test exists
    const existingTest = await prisma.subTopicTest.findUnique({
      where: { id },
    })

    if (!existingTest) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 })
    }

    const questionIds = Array.isArray(questions) ? questions : []

    console.log("[v0] Processed question IDs for update:", questionIds)

    const test = await prisma.subTopicTest.update({
      where: { id },
      data: {
        title,
        description,
        questions: questionIds, // Use the processed questionIds array
        totalQuestions,
        passingScore: passingScore || 70,
        timeLimit: timeLimit || 600,
        isActive: isActive ?? true,
      },
    })

    console.log("[v0] Updated test:", test)
    console.log("[v0] Updated test questions field:", test.questions)

    return NextResponse.json(test)
  } catch (error) {
    console.error("Error updating sub-topic test:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
