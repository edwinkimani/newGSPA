import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma/client"
import { authOptions } from '@/lib/auth/config'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const url = new URL(request.url)
    const subTopicId = url.searchParams.get('subTopicId')

    if (!subTopicId) {
      return NextResponse.json({ error: "Sub-topic ID is required" }, { status: 400 })
    }

    // Get the sub-topic test
    const subTopicTest = await prisma.subTopicTest.findUnique({
      where: { subTopicId },
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

    if (!subTopicTest) {
      return NextResponse.json({ error: "Sub-topic test not found" }, { status: 404 })
    }

    // Parse questions from JSON and resolve question IDs to full objects
    let questions: any[] = []
    if (subTopicTest.questions && Array.isArray(subTopicTest.questions)) {
      // Check if questions are stored as full objects or just IDs
      if (subTopicTest.questions.length > 0 && typeof subTopicTest.questions[0] === 'string') {
        // Questions are stored as IDs - resolve to full objects
        const questionIds = subTopicTest.questions as string[]
        const resolvedQuestions = await Promise.all(
          questionIds.map(async (questionId: string) => {
            const question = await prisma.testQuestion.findUnique({
              where: { id: questionId },
              include: { options: true }
            })
            return question
          })
        )
        questions = resolvedQuestions.filter(q => q !== null)
      } else {
        // Questions are stored as full objects
        questions = subTopicTest.questions
      }
    } else if (typeof subTopicTest.questions === 'string') {
      try {
        const parsedQuestions = JSON.parse(subTopicTest.questions)
        if (Array.isArray(parsedQuestions)) {
          if (parsedQuestions.length > 0 && typeof parsedQuestions[0] === 'string') {
            // Questions are stored as IDs in JSON string
            const questionIds = parsedQuestions as string[]
            const resolvedQuestions = await Promise.all(
              questionIds.map(async (questionId: string) => {
                const question = await prisma.testQuestion.findUnique({
                  where: { id: questionId },
                  include: { options: true }
                })
                return question
              })
            )
            questions = resolvedQuestions.filter(q => q !== null)
          } else {
            // Questions are stored as full objects in JSON string
            questions = parsedQuestions
          }
        }
      } catch (error) {
        console.error('Error parsing questions JSON:', error)
      }
    }

    // Format the response
    const formattedTest = {
      id: subTopicTest.id,
      title: subTopicTest.title,
      description: subTopicTest.description,
      totalQuestions: questions.length, // Use actual resolved questions count
      passingScore: subTopicTest.passingScore,
      timeLimit: subTopicTest.timeLimit,
      questions: questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options ? q.options.map((opt: any) => ({
          id: opt.id,
          optionText: opt.optionText,
          optionLetter: opt.optionLetter,
          isCorrect: opt.isCorrect
        })).sort((a: any, b: any) => (a.optionLetter || '').localeCompare(b.optionLetter || '')) : []
      }))
    }

    return NextResponse.json(formattedTest)
  } catch (error) {
    console.error("Error fetching sub-topic test:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const { subTopicId, title, description, questions, totalQuestions, passingScore, timeLimit, isActive } = body

    if (!subTopicId) {
      return NextResponse.json({ error: "Sub-topic ID is required" }, { status: 400 })
    }

    // Check if sub-topic exists
    const subTopic = await prisma.subTopic.findUnique({
      where: { id: subTopicId }
    })

    if (!subTopic) {
      return NextResponse.json({ error: "Sub-topic not found" }, { status: 404 })
    }

    // Check if a test already exists for this sub-topic
    const existingTest = await prisma.subTopicTest.findUnique({
      where: { subTopicId }
    })

    if (existingTest) {
      return NextResponse.json({ error: "A test already exists for this sub-topic" }, { status: 409 })
    }

    // Create the sub-topic test
    const subTopicTest = await prisma.subTopicTest.create({
      data: {
        subTopicId,
        title: title || `Test for ${subTopic.title}`,
        description: description || `Test questions for ${subTopic.title}`,
        questions: questions || [],
        totalQuestions: totalQuestions || (questions ? questions.length : 0),
        passingScore: passingScore || 70,
        timeLimit: timeLimit || 600, // 10 minutes default
        isActive: isActive !== undefined ? isActive : true
      },
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

    return NextResponse.json(subTopicTest, { status: 201 })
  } catch (error) {
    console.error("Error creating sub-topic test:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Catch-all handlers for unsupported methods
export async function PUT(request: Request) {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'Only GET and POST requests are supported for this endpoint',
    method: 'PUT'
  }, {
    status: 405,
    headers: {
      'Allow': 'GET, POST'
    }
  })
}

export async function PATCH(request: Request) {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'Only GET and POST requests are supported for this endpoint',
    method: 'PATCH'
  }, {
    status: 405,
    headers: {
      'Allow': 'GET, POST'
    }
  })
}

export async function DELETE(request: Request) {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'Only GET and POST requests are supported for this endpoint',
    method: 'DELETE'
  }, {
    status: 405,
    headers: {
      'Allow': 'GET, POST'
    }
  })
}
