import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const moduleId = params.id

    // Get questions for this module
    const questions = await prisma.testQuestion.findMany({
      where: {
        moduleId: moduleId,
        isActive: true
      },
      include: {
        options: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to match the expected format
    const formattedQuestions = questions.map(question => ({
      id: question.id,
      question: question.question,
      options: {
        A: question.options.find(opt => opt.optionLetter === 'A')?.optionText || '',
        B: question.options.find(opt => opt.optionLetter === 'B')?.optionText || '',
        C: question.options.find(opt => opt.optionLetter === 'C')?.optionText || '',
        D: question.options.find(opt => opt.optionLetter === 'D')?.optionText || ''
      },
      correctAnswer: question.options.find(opt => opt.isCorrect)?.optionLetter || '',
      category: question.category,
      difficulty: question.difficulty,
      marks: question.marks,
      createdAt: question.createdAt.toISOString()
    }))

    return NextResponse.json(formattedQuestions)
  } catch (error) {
    console.error('Error fetching module questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const moduleId = params.id
    const body = await request.json()

    const {
      question,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      category,
      difficulty,
      marks
    } = body

    // Map difficulty to enum values
    const difficultyEnum = difficulty?.toUpperCase() === 'EASY' ? 'EASY' :
                          difficulty?.toUpperCase() === 'HARD' ? 'HARD' : 'MEDIUM'

    // Create the question
    const newQuestion = await prisma.testQuestion.create({
      data: {
        question,
        category: category || 'General',
        difficulty: difficultyEnum,
        marks: marks || 1,
        moduleId,
        options: {
          create: [
            { optionText: optionA, optionLetter: 'A', isCorrect: correctAnswer === 'A' },
            { optionText: optionB, optionLetter: 'B', isCorrect: correctAnswer === 'B' },
            { optionText: optionC, optionLetter: 'C', isCorrect: correctAnswer === 'C' },
            { optionText: optionD, optionLetter: 'D', isCorrect: correctAnswer === 'D' }
          ]
        }
      },
      include: {
        options: true
      }
    })

    // Format the response
    const formattedQuestion = {
      id: newQuestion.id,
      question: newQuestion.question,
      options: {
        A: newQuestion.options.find(opt => opt.optionLetter === 'A')?.optionText || '',
        B: newQuestion.options.find(opt => opt.optionLetter === 'B')?.optionText || '',
        C: newQuestion.options.find(opt => opt.optionLetter === 'C')?.optionText || '',
        D: newQuestion.options.find(opt => opt.optionLetter === 'D')?.optionText || ''
      },
      correctAnswer: newQuestion.options.find(opt => opt.isCorrect)?.optionLetter || '',
      category: newQuestion.category,
      difficulty: newQuestion.difficulty,
      marks: newQuestion.marks,
      createdAt: newQuestion.createdAt.toISOString()
    }

    return NextResponse.json(formattedQuestion)
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const moduleId = params.id
    const body = await request.json()
    const { questionId, ...updateData } = body

    const {
      question,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      category,
      difficulty,
      marks
    } = updateData

    // Map difficulty to enum values
    const difficultyEnum = difficulty?.toUpperCase() === 'EASY' ? 'EASY' :
                          difficulty?.toUpperCase() === 'HARD' ? 'HARD' : 'MEDIUM'

    // Update the question
    const updatedQuestion = await prisma.testQuestion.update({
      where: { id: questionId },
      data: {
        question,
        category: category || 'General',
        difficulty: difficultyEnum,
        marks: marks || 1,
        moduleId,
        options: {
          deleteMany: {},
          create: [
            { optionText: optionA, optionLetter: 'A', isCorrect: correctAnswer === 'A' },
            { optionText: optionB, optionLetter: 'B', isCorrect: correctAnswer === 'B' },
            { optionText: optionC, optionLetter: 'C', isCorrect: correctAnswer === 'C' },
            { optionText: optionD, optionLetter: 'D', isCorrect: correctAnswer === 'D' }
          ]
        }
      },
      include: {
        options: true
      }
    })

    // Format the response
    const formattedQuestion = {
      id: updatedQuestion.id,
      question: updatedQuestion.question,
      options: {
        A: updatedQuestion.options.find(opt => opt.optionLetter === 'A')?.optionText || '',
        B: updatedQuestion.options.find(opt => opt.optionLetter === 'B')?.optionText || '',
        C: updatedQuestion.options.find(opt => opt.optionLetter === 'C')?.optionText || '',
        D: updatedQuestion.options.find(opt => opt.optionLetter === 'D')?.optionText || ''
      },
      correctAnswer: updatedQuestion.options.find(opt => opt.isCorrect)?.optionLetter || '',
      category: updatedQuestion.category,
      difficulty: updatedQuestion.difficulty,
      marks: updatedQuestion.marks,
      createdAt: updatedQuestion.createdAt.toISOString()
    }

    return NextResponse.json(formattedQuestion)
  } catch (error) {
    console.error('Error updating question:', error)
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const moduleId = params.id
    const body = await request.json()
    const { questionId } = body

    if (!questionId) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 })
    }

    // Delete the question (this will cascade delete the options due to Prisma relations)
    await prisma.testQuestion.delete({
      where: { id: questionId }
    })

    return NextResponse.json({ message: 'Question deleted successfully' })
  } catch (error) {
    console.error('Error deleting question:', error)
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    )
  }
}
