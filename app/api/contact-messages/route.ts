import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '@/lib/auth/config'

// GET /api/contact-messages - Get all contact messages (admin only)
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: session.user.id }, include: { role: true } })
    if (!profile || profile.role?.name !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      include: { respondedBy: true }
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching contact messages:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PATCH /api/contact-messages - Update message status or add response
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const profile = await prisma.profile.findUnique({ where: { id: session.user.id }, include: { role: true } })
    if (!profile || profile.role?.name !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { id, status, adminResponse } = body

    if (!id) return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })

    const updateData: any = {}

    if (status) {
      updateData.status = status.toUpperCase()
    }

    if (adminResponse) {
      updateData.adminResponse = adminResponse
      updateData.respondedAt = new Date()
      updateData.respondedById = session.user.id
      updateData.status = 'RESPONDED'
    }

    const updatedMessage = await prisma.contactMessage.update({
      where: { id },
      data: updateData,
      include: { respondedBy: true }
    })

    return NextResponse.json(updatedMessage)
  } catch (error) {
    console.error('Error updating contact message:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
