import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '@/lib/auth/config'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: {
          include: {
            role: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Remove sensitive information
    const { password, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify current password
    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password is required to change password' }, { status: 400 })
    }

    const passwordsMatch = await bcrypt.compare(currentPassword, user.password)
    if (!passwordsMatch) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    // Update password
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: await bcrypt.hash(newPassword, 12)
      },
      include: {
        profile: {
          include: {
            role: true
          }
        }
      }
    })

    // Remove sensitive information
    const { password, ...userWithoutPassword } = updatedUser
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
