import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '@/lib/auth/config'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const levelId = searchParams.get('levelId')

    if (!levelId) {
      return NextResponse.json({ error: 'levelId is required' }, { status: 400 })
    }

    const test = await prisma.levelTest.findUnique({
      where: { levelId }
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
        })
      )
      // Filter out null values (in case some IDs don't exist)
      resolvedQuestions = resolvedQuestions.filter(q => q !== null)
    }

    return NextResponse.json({
      ...test,
      questions: resolvedQuestions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options ? q.options.map((opt: any) => ({
          id: opt.id,
          optionText: opt.optionText,
          optionLetter: opt.optionLetter,
          isCorrect: opt.isCorrect
        })).sort((a: any, b: any) => (a.optionLetter || '').localeCompare(b.optionLetter || '')) : []
      }))
    })
  } catch (error) {
    console.error('Error fetching level test:', error)
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
    const { levelId, title, description, questions = [], totalQuestions, passingScore, timeLimit, isActive } = body

    if (!levelId || !title) {
      return NextResponse.json({ error: 'levelId and title are required' }, { status: 400 })
    }

    // Check if user is master practitioner
    const userProfile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    })

    if (userProfile?.role?.name !== 'master_practitioner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if test already exists for this level
    const existingTest = await prisma.levelTest.findUnique({
      where: { levelId }
    })

    if (existingTest) {
      return NextResponse.json({ error: 'Test already exists for this level' }, { status: 400 })
    }

    const test = await prisma.levelTest.create({
      data: {
        levelId,
        title,
        description,
        questions,
        totalQuestions,
        passingScore: passingScore || 70,
        timeLimit: timeLimit || 1800,
        isActive: isActive ?? true
      }
    })

    return NextResponse.json(test)
  } catch (error) {
    console.error('Error creating level test:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
