import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const content = await prisma.subTopicContent.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        subTopicId: true
      }
    })

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 })
    }

    return NextResponse.json(content)
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}