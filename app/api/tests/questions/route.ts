import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '@/lib/auth/config'

// GET /api/tests/questions - Get all test questions
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // determine role-based visibility
  let where: any = { isActive: true }
  const authProfile = await prisma.profile.findUnique({ where: { id: session.user.id }, include: { role: true } })
  if (authProfile?.role?.name === 'admin') where = {}

  const questions = await prisma.testQuestion.findMany({ where, orderBy: { createdAt: 'desc' }, include: { options: true } })
    return NextResponse.json(questions)
  } catch (error) {
    console.error('Error fetching test questions:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/tests/questions - Create a new test question (admin and master_practitioner only)
export async function POST(request: Request) {
  try {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const authProfile = await prisma.profile.findUnique({ where: { id: session.user.id }, include: { role: true } })
  if (!authProfile || !['admin', 'master_practitioner'].includes(authProfile.role?.name || '')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    // body can include options array
    const { options, modelType, modelId, ...questionData } = body
    const question = await prisma.testQuestion.create({
      data: {
        ...questionData,
        modelType,
        modelId,
        options: { create: options || [] }
      },
      include: { options: true }
    })
    return NextResponse.json(question)
  } catch (error) {
    console.error('Error creating test question:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
