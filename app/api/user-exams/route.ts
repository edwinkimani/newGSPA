import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '../auth/[...nextauth]/route'

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

    const userExams = await prisma.userExam.findMany({
      include: {
        user: {
          include: {
            profile: true
          }
        },
        examConfiguration: true
      },
      orderBy: { assignedAt: 'desc' }
    })

    // Format the response to match the expected structure
    const formattedUserExams = userExams.map((exam: any) => ({
      id: exam.id,
      user_id: exam.userId,
      exam_configuration_id: exam.examConfigurationId,
      assigned_at: exam.assignedAt,
      available_from: exam.availableFrom,
      available_until: exam.availableUntil,
      is_completed: exam.isCompleted,
      completed_at: exam.completedAt,
      score: exam.score,
      passed: exam.passed,
      user_name: exam.user.profile ? `${exam.user.profile.firstName} ${exam.user.profile.lastName}` : 'Unknown',
      user_email: exam.user.email || 'Unknown'
    }))

    return NextResponse.json(formattedUserExams)
  } catch (error) {
    console.error('Error fetching user exams:', error)
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
    const { userId, examConfigurationId, availableFrom, availableUntil } = body

    if (!userId || !examConfigurationId) {
      return NextResponse.json({ error: 'userId and examConfigurationId are required' }, { status: 400 })
    }

    const userExam = await prisma.userExam.create({
      data: {
        userId,
        examConfigurationId,
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        availableUntil: availableUntil ? new Date(availableUntil) : null
      }
    })

    return NextResponse.json(userExam)
  } catch (error) {
    console.error('Error creating user exam:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
