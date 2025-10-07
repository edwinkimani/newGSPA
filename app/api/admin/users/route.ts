import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '@/lib/auth/config'
import bcrypt from 'bcryptjs'

// POST /api/admin/users - Create a new user (admin only)
export async function POST(request: Request) {
  try {
    // Get session using NextAuth
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const authProfile = await prisma.profile.findUnique({
      where: { id: session.user.id },
      include: { role: true }
    })
    if (!authProfile || authProfile.role?.name !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      nationality,
      gender,
      designation,
      organizationName,
      documentType,
      documentNumber,
      roleId
    } = body

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !roleId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user and profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword
        }
      })

      // Create profile
      const profileData: any = {
        id: user.id,
        email,
        firstName,
        lastName,
        phoneNumber: phoneNumber || null,
        nationality: nationality || null,
        gender: gender ? gender.toUpperCase() as any : null,
        designation: designation || null,
        organizationName: organizationName || null,
        documentType: documentType ? documentType.toUpperCase().replace('_', '_') as any : null,
        documentNumber: documentNumber || null,
        roleId: roleId,
        membershipFeePaid: false,
        paymentStatus: 'PENDING' as any,
        testCompleted: false,
        certificateIssued: false
      }

      // Only add dateOfBirth if provided
      if (dateOfBirth) {
        profileData.dateOfBirth = new Date(dateOfBirth)
      }

      const profile = await tx.profile.create({
        data: profileData,
        include: {
          role: true
        }
      })

      return { user, profile }
    })

    return NextResponse.json({
      id: result.user.id,
      email: result.user.email,
      profile: result.profile
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
