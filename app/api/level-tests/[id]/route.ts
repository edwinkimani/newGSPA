import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const test = await prisma.levelTest.findUnique({
      where: { id: params.id }
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
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
  } catch (error) {
    console.error('Error fetching level test:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, questions = [], totalQuestions, passingScore, timeLimit, isActive } = body

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    // Check if user is master practitioner
    const userProfile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    })

    if (userProfile?.role?.name !== 'master_practitioner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const test = await prisma.levelTest.update({
      where: { id: params.id },
      data: {
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
    console.error('Error updating level test:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is master practitioner
    const userProfile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    })

    if (userProfile?.role?.name !== 'master_practitioner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.levelTest.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Test deleted successfully' })
  } catch (error) {
    console.error('Error deleting level test:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
