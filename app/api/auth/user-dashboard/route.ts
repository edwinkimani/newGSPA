import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '../[...nextauth]/route'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch user with profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true
      }
    })

    if (!user || !user.profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Fetch latest test attempt
    const testAttemptData = await prisma.testAttempt.findFirst({
      where: { userId },
      orderBy: { completedAt: 'desc' }
    })

    // Fetch ongoing test
    const ongoingTestData = await prisma.ongoingTest.findUnique({
      where: { userId }
    })

    // Fetch user enrollments
    const enrollments = await prisma.moduleEnrollment.findMany({
      where: {
        userId,
        paymentStatus: 'COMPLETED'
      },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            difficultyLevel: true,
            estimatedDuration: true,
            instructorName: true,
            price: true,
            currency: true,
            isActive: true
          }
        }
      },
      orderBy: { enrollmentDate: 'desc' }
    })

    // Format profile data to match frontend interface
    const profile = {
      id: user.profile.id,
      first_name: user.profile.firstName || '',
      last_name: user.profile.lastName || '',
      email: user.email,
      membership_fee_paid: user.profile.membershipFeePaid || false,
      payment_status: user.profile.paymentStatus || 'pending',
      test_completed: user.profile.testCompleted || false,
      test_score: user.profile.testScore || null,
      certificate_issued: user.profile.certificateIssued || false,
      certificate_url: user.profile.certificateUrl || null,
      certificate_available_at: user.profile.certificateAvailableAt?.toISOString() || null,
      created_at: user.createdAt.toISOString()
    }

    // Format test attempt to match frontend interface
    const testAttempt = testAttemptData ? {
      id: testAttemptData.id,
      score: testAttemptData.score,
      total_questions: testAttemptData.totalQuestions,
      passed: testAttemptData.passed,
      completed_at: testAttemptData.completedAt.toISOString()
    } : null

    // Format ongoing test to match frontend interface
    const ongoingTest = ongoingTestData ? {
      id: ongoingTestData.id,
      user_id: ongoingTestData.userId,
      questions_data: ongoingTestData.questionsData,
      answers_data: ongoingTestData.answersData,
      current_question: ongoingTestData.currentQuestion,
      time_left: ongoingTestData.timeLeft,
      test_started: ongoingTestData.testStarted,
      started_at: ongoingTestData.startedAt.toISOString(),
      updated_at: ongoingTestData.updatedAt.toISOString()
    } : null

    // Format enrollments to match frontend interface
    const formattedEnrollments = enrollments.map(enrollment => ({
      id: enrollment.id,
      module_id: enrollment.moduleId,
      module_title: enrollment.module?.title || 'Unknown Module',
      progress_percentage: enrollment.progressPercentage,
      payment_status: enrollment.paymentStatus,
      completed_at: enrollment.completedAt?.toISOString() || null,
      exam_date: enrollment.examDate?.toISOString() || null,
      exam_completed: enrollment.examCompleted || false,
      completedSubTopics: enrollment.completedSubTopics || []
    }))

    return NextResponse.json({
      profile,
      testAttempt,
      ongoingTest,
      enrollments: formattedEnrollments
    })
  } catch (error) {
    console.error('Error fetching user dashboard data:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
