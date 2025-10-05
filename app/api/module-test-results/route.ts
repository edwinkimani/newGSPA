import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '../auth/[...nextauth]/route'
import { generateCertificateHTML } from '@/components/certificate-HTML'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      moduleTestId,
      moduleId,
      score,
      totalQuestions,
      correctAnswers,
      answers,
      passed,
      timeSpent
    } = body

    if (!moduleTestId || !moduleId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Use raw SQL query to avoid Prisma client type issues
    const existingResult = await prisma.$queryRaw`
      SELECT id FROM SubTopicTestResult
      WHERE userId = ${session.user.id} AND subTopicTestId = ${moduleTestId}
    ` as any[]

    let result
    if (existingResult && existingResult.length > 0) {
      // Update existing result
      result = await prisma.$queryRaw`
        UPDATE SubTopicTestResult
        SET score = ${score}, totalQuestions = ${totalQuestions}, correctAnswers = ${correctAnswers},
            answers = ${JSON.stringify(answers)}, passed = ${passed}, timeSpent = ${timeSpent},
            completedAt = NOW()
        WHERE id = ${existingResult[0].id}
      `
    } else {
      // Create new result
      result = await prisma.$queryRaw`
        INSERT INTO SubTopicTestResult
        (id, userId, subTopicTestId, moduleId, levelId, subTopicId, score, totalQuestions, correctAnswers, answers, passed, timeSpent, completedAt, createdAt)
        VALUES
        (UUID(), ${session.user.id}, ${moduleTestId}, ${moduleId}, NULL, NULL, ${score}, ${totalQuestions}, ${correctAnswers}, ${JSON.stringify(answers)}, ${passed}, ${timeSpent}, NOW(), NOW())
      `
    }

    // If the user passed the module test, generate certificate
    if (passed) {
      try {
        // Get user profile
        const userProfile = await prisma.profile.findUnique({
          where: { id: session.user.id }
        })

        if (userProfile) {
          // Calculate certificate available date (48 hours from now)
          const certificateAvailableAt = new Date()
          certificateAvailableAt.setHours(certificateAvailableAt.getHours() + 48)

          // Generate certificate HTML - map Prisma profile to expected interface
          const certificateUser = {
            id: userProfile.id,
            first_name: userProfile.firstName,
            last_name: userProfile.lastName,
            email: userProfile.email,
            test_score: score,
            test_completed: true,
            certificate_issued: true,
            certificate_available_at: certificateAvailableAt.toISOString(),
            signature_data: userProfile.signatureData,
            created_at: userProfile.createdAt.toISOString()
          }

          const certificateHTML = generateCertificateHTML(certificateUser, {
            score,
            passed: true,
            correctAnswers,
            totalQuestions,
            userId: session.user.id
          })

          // Update user profile to mark certificate as issued and set available date (48 hours from now)
          // certificateAvailableAt is already declared above

          await prisma.profile.update({
            where: { id: session.user.id },
            data: {
              certificateIssued: true,
              certificateAvailableAt,
              testCompleted: true,
              testScore: score
            }
          })

          // Update enrollment to mark as completed
          await prisma.moduleEnrollment.updateMany({
            where: {
              userId: session.user.id,
              moduleId: moduleId
            },
            data: {
              examCompleted: true,
              examScore: score,
              completedAt: new Date()
            }
          })

          console.log(`Certificate generated for user ${session.user.id}. Available at: ${certificateAvailableAt}`)
          // TODO: Send email notification about certificate availability
        }
      } catch (certificateError) {
        console.error('Error generating certificate:', certificateError)
        // Don't fail the test result save if certificate generation fails
      }
    }

    return NextResponse.json({ success: true, message: 'Module test result saved successfully' })
  } catch (error) {
    console.error('Error saving module test result:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}