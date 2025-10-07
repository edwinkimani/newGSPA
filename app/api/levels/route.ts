import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '@/lib/auth/config'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(request.url)
    const moduleId = url.searchParams.get('moduleId')

    if (!moduleId) return NextResponse.json({ error: 'Module ID is required' }, { status: 400 })

    const levels = await prisma.level.findMany({
      where: {
        moduleId
      },
      orderBy: { orderIndex: 'asc' },
      include: {
        subTopics: {
          include: {
            _count: {
              select: { contents: true }
            }
          }
        }
      }
    })

    console.log('Fetching levels for moduleId:', moduleId, 'Found:', levels.length)
    levels.forEach(level => {
      console.log('Level:', level.id, level.title, 'learningObjectives:', level.learningObjectives, 'type:', typeof level.learningObjectives)
    })

    return NextResponse.json(levels)
  } catch (error) {
    console.error('Error fetching levels:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { title, description, orderIndex, isActive, estimatedDuration, learningObjectives, moduleId } = body

    if (!title || !moduleId) {
      return NextResponse.json({ error: 'Title and moduleId are required' }, { status: 400 })
    }

    const level = await prisma.level.create({
      data: {
        title,
        description,
        orderIndex: orderIndex || 0,
        isActive: isActive ?? true,
        estimatedDuration,
        learningObjectives,
        moduleId
      }
    })

    console.log('Created level:', level.id, level.title)

    return NextResponse.json(level)
  } catch (error) {
    console.error('Error creating level:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { id, title, description, orderIndex, isActive, estimatedDuration, learningObjectives } = body

    if (!id) {
      return NextResponse.json({ error: 'Level ID is required' }, { status: 400 })
    }

    const level = await prisma.level.update({
      where: { id },
      data: {
        title,
        description,
        orderIndex,
        isActive,
        estimatedDuration,
        learningObjectives
      }
    })

    console.log('Updated level:', level.id, level.title)

    return NextResponse.json(level)
  } catch (error) {
    console.error('Error updating level:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

