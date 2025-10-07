import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '@/lib/auth/config'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const test = await prisma.subTopicTest.findUnique({
      where: { id: params.id },
      include: {
        subTopic: {
          include: {
            level: {
              include: {
                module: true
              }
            }
          }
        }
      }
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    return NextResponse.json(test)
  } catch (error) {
    console.error('Error fetching sub-topic test:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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
    const { title, description, questions = [], totalQuestions, passingScore, timeLimit, isActive } = body

    const test = await prisma.subTopicTest.update({
      where: { id: params.id },
      data: {
        title,
        description,
        questions,
        totalQuestions,
        passingScore,
        timeLimit,
        isActive
      }
    })

    return NextResponse.json(test)
  } catch (error) {
    console.error('Error updating sub-topic test:', error)
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

    await prisma.subTopicTest.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Test deleted successfully' })
  } catch (error) {
    console.error('Error deleting sub-topic test:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
