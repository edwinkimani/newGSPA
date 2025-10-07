import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '@/lib/auth/config'

export async function GET(request: Request, { params }: { params: { id: string } }) {
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

    const { id } = params
    const [type, modelId] = id.split('-')

    let questions: any[] = []

    switch (type) {
      case 'subtopic':
        const subTopicTest = await prisma.subTopicTest.findUnique({
          where: { id: modelId }
        })
        questions = subTopicTest?.questions ? JSON.parse(JSON.stringify(subTopicTest.questions)) : []
        break
      case 'level':
        const levelTest = await prisma.levelTest.findUnique({
          where: { id: modelId }
        })
        questions = levelTest?.questions ? JSON.parse(JSON.stringify(levelTest.questions)) : []
        break
      case 'module':
        const moduleTest = await prisma.moduleTest.findUnique({
          where: { id: modelId }
        })
        questions = moduleTest?.questions ? JSON.parse(JSON.stringify(moduleTest.questions)) : []
        break
      case 'exam':
        const examConfig = await prisma.examConfiguration.findUnique({
          where: { id: modelId }
        })
        questions = examConfig?.questions ? JSON.parse(JSON.stringify(examConfig.questions)) : []
        break
      default:
        return NextResponse.json({ error: 'Invalid model type' }, { status: 400 })
    }

    return NextResponse.json(questions)
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
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

    const { id } = params
    const [type, modelId] = id.split('-')

    const body = await request.json()
    const { question, optionA, optionB, optionC, optionD, correctAnswer, category, difficulty } = body

    if (!question || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (!['A', 'B', 'C', 'D'].includes(correctAnswer.toUpperCase())) {
      return NextResponse.json({ error: 'Correct answer must be A, B, C, or D' }, { status: 400 })
    }

    const newQuestion = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question,
      options: {
        A: optionA,
        B: optionB,
        C: optionC,
        D: optionD
      },
      correctAnswer: correctAnswer.toUpperCase(),
      category: category || 'General',
      difficulty: difficulty || 'medium'
    }

    let updatedModel

    switch (type) {
      case 'subtopic':
        const subTopicTest = await prisma.subTopicTest.findUnique({
          where: { id: modelId }
        })
        const currentQuestions = subTopicTest?.questions ? JSON.parse(JSON.stringify(subTopicTest.questions)) : []
        updatedModel = await prisma.subTopicTest.update({
          where: { id: modelId },
          data: {
            questions: [...currentQuestions, newQuestion],
            totalQuestions: currentQuestions.length + 1
          }
        })
        break
      case 'level':
        const levelTest = await prisma.levelTest.findUnique({
          where: { id: modelId }
        })
        const levelQuestions = levelTest?.questions ? JSON.parse(JSON.stringify(levelTest.questions)) : []
        updatedModel = await prisma.levelTest.update({
          where: { id: modelId },
          data: {
            questions: [...levelQuestions, newQuestion],
            totalQuestions: levelQuestions.length + 1
          }
        })
        break
      case 'module':
        const moduleTest = await prisma.moduleTest.findUnique({
          where: { id: modelId }
        })
        const moduleQuestions = moduleTest?.questions ? JSON.parse(JSON.stringify(moduleTest.questions)) : []
        updatedModel = await prisma.moduleTest.update({
          where: { id: modelId },
          data: {
            questions: [...moduleQuestions, newQuestion],
            totalQuestions: moduleQuestions.length + 1
          }
        })
        break
      case 'exam':
        const examConfig = await prisma.examConfiguration.findUnique({
          where: { id: modelId }
        })
        const examQuestions = examConfig?.questions ? JSON.parse(JSON.stringify(examConfig.questions)) : []
        updatedModel = await prisma.examConfiguration.update({
          where: { id: modelId },
          data: {
            questions: [...examQuestions, newQuestion],
            totalQuestions: examQuestions.length + 1
          }
        })
        break
      default:
        return NextResponse.json({ error: 'Invalid model type' }, { status: 400 })
    }

    return NextResponse.json(newQuestion)
  } catch (error) {
    console.error('Error adding question:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
