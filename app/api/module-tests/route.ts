import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const moduleId = searchParams.get('moduleId')

    if (moduleId) {
      // Get specific test by moduleId
      const test = await prisma.moduleTest.findUnique({
        where: { moduleId },
        include: {
          module: true
        }
      })

      if (!test) {
        return NextResponse.json(null)
      }

      // Resolve question IDs to full question objects
      let resolvedQuestions = []
      if (test.questions && Array.isArray(test.questions)) {
        resolvedQuestions = await Promise.all(
          test.questions.map(async (question: any) => {
            if (typeof question === 'string') {
              // It's a question ID, fetch the full question
              const fullQuestion = await prisma.testQuestion.findUnique({
                where: { id: question }
              })
              return fullQuestion
            } else {
              // It's already a full question object
              return question
            }
          })
        )
        // Filter out null values (in case some IDs don't exist)
        resolvedQuestions = resolvedQuestions.filter(q => q !== null)
      }

      return NextResponse.json({
        ...test,
        questions: resolvedQuestions
      })
    } else {
      // Get all module tests
      const tests = await prisma.moduleTest.findMany({
        include: {
          module: true
        },
        orderBy: { createdAt: 'desc' }
      })

      // Resolve questions for each test
      const testsWithQuestions = await Promise.all(
        tests.map(async (test) => {
          let resolvedQuestions = []
          if (test.questions && Array.isArray(test.questions)) {
            resolvedQuestions = await Promise.all(
              test.questions.map(async (question: any) => {
                if (typeof question === 'string') {
                  const fullQuestion = await prisma.testQuestion.findUnique({
                    where: { id: question }
                  })
                  return fullQuestion
                } else {
                  return question
                }
              })
            )
            resolvedQuestions = resolvedQuestions.filter(q => q !== null)
          }

          return {
            ...test,
            questions: resolvedQuestions
          }
        })
      )

      return NextResponse.json(testsWithQuestions)
    }
  } catch (error) {
    console.error('Error fetching module test:', error)
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
    const { moduleId, title, description, questions = [], totalQuestions, passingScore, timeLimit, isActive } = body

    console.log('[v0] Creating module test with questions:', questions)
    console.log('[v0] Questions array length:', questions.length)

    if (!moduleId || !title) {
      return NextResponse.json({ error: 'moduleId and title are required' }, { status: 400 })
    }

    // Check if user is master practitioner
    const userProfile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      include: { role: true },
    })

    if (userProfile?.role?.name !== 'master_practitioner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if test already exists for this module
    const existingTest = await prisma.moduleTest.findUnique({
      where: { moduleId }
    })

    if (existingTest) {
      return NextResponse.json({ error: 'Test already exists for this module' }, { status: 400 })
    }

    const questionIds = Array.isArray(questions) ? questions : []

    console.log('[v0] Processed question IDs:', questionIds)

    const test = await prisma.moduleTest.create({
      data: {
        moduleId,
        title,
        description,
        questions: questionIds, // Use the processed questionIds array
        totalQuestions,
        passingScore: passingScore || 70,
        timeLimit: timeLimit || 3600,
        isActive: isActive ?? true,
      },
    })

    console.log('[v0] Created module test:', test)
    console.log('[v0] Test questions field:', test.questions)

    return NextResponse.json(test)
  } catch (error) {
    console.error('Error creating module test:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()

    if (!id) {
      return NextResponse.json({ error: 'Test ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { title, description, questions = [], totalQuestions, passingScore, timeLimit, isActive } = body

    console.log('[v0] Updating module test with questions:', questions)
    console.log('[v0] Questions array length:', questions.length)

    // Check if user is master practitioner
    const userProfile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      include: { role: true },
    })

    if (userProfile?.role?.name !== 'master_practitioner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if test exists
    const existingTest = await prisma.moduleTest.findUnique({
      where: { id },
    })

    if (!existingTest) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    const questionIds = Array.isArray(questions) ? questions : []

    console.log('[v0] Processed question IDs for update:', questionIds)

    const test = await prisma.moduleTest.update({
      where: { id },
      data: {
        title,
        description,
        questions: questionIds, // Use the processed questionIds array
        totalQuestions,
        passingScore: passingScore || 70,
        timeLimit: timeLimit || 3600,
        isActive: isActive ?? true,
      },
    })

    console.log('[v0] Updated module test:', test)
    console.log('[v0] Updated test questions field:', test.questions)

    return NextResponse.json(test)
  } catch (error) {
    console.error('Error updating module test:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}