import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { hashPassword, generateToken, sendVerificationEmail } from '@/lib/auth/auth-utils'

export async function POST(request: Request) {
  try {
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
      declarationAccepted,
      passportPhotoUrl,
      signatureUrl
    } = body

    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })

    // ensure email unique
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 400 })

    const hashed = await hashPassword(password)
    const verifyToken = generateToken({ email }, '7d')

    // Create user and profile in a transaction to ensure both succeed or fail together
    console.log('🔄 Starting user and profile creation transaction...')
    console.log('📧 Email:', email)
    console.log('👤 Name:', firstName, lastName)

    let user, profile

    try {
      // Create user first
      console.log('👤 Creating user record...')
      user = await prisma.user.create({
        data: {
          email,
          password: hashed,
          verifyToken
        }
      })
      console.log('✅ User created with ID:', user.id)

      // Create profile with id = user.id
      console.log('📋 Creating profile record...')
      profile = await prisma.profile.create({
        data: {
          id: user.id,
          firstName: firstName || '',
          lastName: lastName || '',
          email,
          phoneNumber: phoneNumber || '',
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date(),
          nationality: nationality || '',
          gender: gender ? gender.toUpperCase() : 'OTHER',
          designation: designation || '',
          organizationName: organizationName || '',
          documentType: documentType ? documentType.toUpperCase() : 'PASSPORT',
          documentNumber: documentNumber || '',
          declarationAccepted: !!declarationAccepted,
          passportPhotoUrl: passportPhotoUrl || null,
          signatureData: signatureUrl || null,
          membershipFeePaid: false,
          paymentStatus: 'PENDING'
        }
      })
      console.log('✅ Profile created with ID:', profile.id)
      console.log('🎉 Registration completed successfully!')

    } catch (dbError: any) {
      console.error('❌ Database error during registration:', dbError)

      // If profile creation failed, clean up the user
      if (user && !profile) {
        console.log('🧹 Cleaning up user record due to profile creation failure...')
        await prisma.user.delete({ where: { id: user.id } }).catch(() => {})
      }

      throw new Error(`Registration failed: ${dbError.message}`)
    }

    // send verification email (best effort)
    try {
      await sendVerificationEmail(email, verifyToken)
    } catch (e) {
      console.error('Failed sending verification email', e)
    }

    return NextResponse.json({ id: user.id, email: user.email })
  } catch (error) {
    console.error('Signup error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
