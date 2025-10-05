import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if email exists in User table using Prisma
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    const exists = !!existingUser

    return NextResponse.json({ exists })
  } catch (error) {
    console.error('Error in check-email API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
