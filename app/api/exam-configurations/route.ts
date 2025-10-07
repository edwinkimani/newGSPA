import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '@/lib/auth/config'

export async function GET(request: Request) {
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

    const examConfigurations = await prisma.examConfiguration.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(examConfigurations)
  } catch (error) {
    console.error('Error fetching exam configurations:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
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

    const body = await request.json()
    const { name, description, questions, totalQuestions, passingScore, timeLimit } = body

    if (!name || !questions || questions.length === 0) {
      return NextResponse.json({ error: 'Name and questions are required' }, { status: 400 })
    }

    const examConfiguration = await prisma.examConfiguration.create({
      data: {
        name,
        description,
        questions,
        totalQuestions,
        passingScore: passingScore || 70,
        timeLimit: timeLimit || 3600,
        createdById: session.user.id
      }
    })

    return NextResponse.json(examConfiguration)
  } catch (error) {
    console.error('Error creating exam configuration:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
