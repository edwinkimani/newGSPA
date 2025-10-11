import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const subtopic = await prisma.subTopic.findUnique({
      where: { id: params.id },
      include: {
        contents: {
          where: { isPublished: true },
          orderBy: { orderIndex: 'asc' }
        }
      }
    })

    if (!subtopic) {
      return NextResponse.json({ error: 'Subtopic not found' }, { status: 404 })
    }

    return NextResponse.json(subtopic)
  } catch (error) {
    console.error('Error fetching subtopic:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// Catch-all handler for unsupported methods
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Check if subtopic exists
    const existingSubtopic = await prisma.subTopic.findUnique({
      where: { id: params.id }
    })

    if (!existingSubtopic) {
      return NextResponse.json({ error: 'Subtopic not found' }, { status: 404 })
    }

    // Build update data object with only provided fields
    const updateData: any = {
      updatedAt: new Date()
    }

    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.orderIndex !== undefined) updateData.orderIndex = body.orderIndex
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.estimatedDuration !== undefined) updateData.estimatedDuration = body.estimatedDuration
    if (body.learningObjectives !== undefined) updateData.learningObjectives = body.learningObjectives
    if (body.readingMaterial !== undefined) updateData.readingMaterial = body.readingMaterial
    if (body.attachments !== undefined) updateData.attachments = body.attachments
    if (body.externalLinks !== undefined) updateData.externalLinks = body.externalLinks

    // Update the subtopic
    const updatedSubtopic = await prisma.subTopic.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json(updatedSubtopic)
  } catch (error) {
    console.error('Error updating subtopic:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'Only GET, PUT and DELETE requests are supported for this endpoint',
    method: 'POST'
  }, {
    status: 405,
    headers: {
      'Allow': 'GET, PUT, DELETE'
    }
  })
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if subtopic exists
    const existingSubtopic = await prisma.subTopic.findUnique({
      where: { id: params.id }
    })

    if (!existingSubtopic) {
      return NextResponse.json({ error: 'Subtopic not found' }, { status: 404 })
    }

    // Delete the subtopic (cascade will handle related records)
    await prisma.subTopic.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Subtopic deleted successfully' })
  } catch (error) {
    console.error('Error deleting subtopic:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  return NextResponse.json({
    error: 'Method not allowed',
    message: 'Only GET, PUT and DELETE requests are supported for this endpoint',
    method: 'PATCH'
  }, {
    status: 405,
    headers: {
      'Allow': 'GET, PUT, DELETE'
    }
  })
}