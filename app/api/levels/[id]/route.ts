import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const levelId = params.id

    if (!levelId) {
      return NextResponse.json({ error: 'Level ID is required' }, { status: 400 })
    }

    // Check if user is master practitioner
    const userProfile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    })

    if (userProfile?.role?.name !== 'master_practitioner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete the level (cascade will handle sub-topics and content)
    const level = await prisma.level.delete({
      where: { id: levelId }
    })

    console.log('Deleted level:', level.id, level.title)

    return NextResponse.json({ message: 'Level deleted successfully' })
  } catch (error) {
    console.error('Error deleting level:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}