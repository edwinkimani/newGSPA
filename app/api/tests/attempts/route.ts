import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { getUserFromAuthHeader } from '@/lib/server/auth'

// GET /api/tests/attempts - Get all test attempts for the current user
export async function GET(request: Request) {
  try {
  const authUser = getUserFromAuthHeader(request)
  if (!authUser || !authUser.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = authUser.id as string

  const attempts = await prisma.testAttempt.findMany({ where: { userId }, orderBy: { completedAt: 'desc' } })
    return NextResponse.json(attempts)
  } catch (error) {
    console.error('Error fetching test attempts:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/tests/attempts - Submit a new test attempt
export async function POST(request: Request) {
  try {
    const authUser = getUserFromAuthHeader(request)
    if (!authUser || !authUser.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userId = authUser.id as string

    const body = await request.json()
    const { answersData, questionsData, score } = body
    const totalQuestions = Array.isArray(questionsData) ? questionsData.length : 0
    const passed = typeof score === 'number' ? score >= 70 : false

    // Transaction: create attempt and update profile test status
    const result = await prisma.$transaction(async (tx) => {
      const attempt = await tx.testAttempt.create({ data: {
        userId: userId,
        questionsData: questionsData as any,
        answersData: answersData as any,
        score: score || 0,
        totalQuestions: totalQuestions,
        passed: passed,
        completedAt: new Date(),
      }})

      // Update profile with score and completion flag
  await tx.profile.updateMany({ where: { id: userId }, data: { testCompleted: true, testScore: score || 0, certificateIssued: passed } })

      return attempt
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error submitting test attempt:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
