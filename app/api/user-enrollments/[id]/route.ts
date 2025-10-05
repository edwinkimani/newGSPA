import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '../../auth/[...nextauth]/route'

// GET /api/user-enrollments/[id] - Get specific enrollment
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const enrollment = await prisma.moduleEnrollment.findUnique({
      where: { id: params.id },
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
            currency: true
          }
        }
      }
    })

    if (!enrollment) return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })

    // Check if user owns this enrollment or is admin/master practitioner
    const profile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    })

    const isAdminOrMaster = ['admin', 'master_practitioner'].includes(profile?.role?.name || '')
    if (enrollment.userId !== session.user.id && !isAdminOrMaster) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(enrollment)
  } catch (error) {
    console.error('Error fetching enrollment:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PATCH /api/user-enrollments/[id] - Update enrollment (e.g., schedule exam)
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const enrollment = await prisma.moduleEnrollment.findUnique({
      where: { id: params.id }
    })

    if (!enrollment) return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })

    // Check if user owns this enrollment or is admin/master practitioner
    const profile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    })

    const isAdminOrMaster = ['admin', 'master_practitioner'].includes(profile?.role?.name || '')
    if (enrollment.userId !== session.user.id && !isAdminOrMaster) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { examDate, progressPercentage } = body

    const updateData: any = {}

    if (examDate !== undefined) {
      updateData.examDate = examDate ? new Date(examDate) : null
    }

    if (progressPercentage !== undefined) {
      updateData.progressPercentage = Math.max(0, Math.min(100, progressPercentage))
    }

    const updatedEnrollment = await prisma.moduleEnrollment.update({
      where: { id: params.id },
      data: updateData,
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
            currency: true
          }
        }
      }
    })

    return NextResponse.json(updatedEnrollment)
  } catch (error) {
    console.error('Error updating enrollment:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
