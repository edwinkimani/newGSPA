import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma/client'
import { authOptions } from '@/lib/auth/config'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = params.id

    // Verify the user is issuing their own certificate
    if (session.user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { id: userId }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check if certificate can be issued
    if (!profile.testCompleted) {
      return NextResponse.json({ error: 'Test not completed' }, { status: 400 })
    }

    if (profile.certificateIssued) {
      return NextResponse.json({ error: 'Certificate already issued' }, { status: 400 })
    }

    // Check if 48 hours have passed since test completion
    if (!profile.certificateAvailableAt) {
      return NextResponse.json({ error: 'Certificate not yet available' }, { status: 400 })
    }

    const now = new Date()
    const availableAt = new Date(profile.certificateAvailableAt)

    if (now < availableAt) {
      return NextResponse.json({
        error: 'Certificate not yet available',
        availableAt: availableAt.toISOString()
      }, { status: 400 })
    }

    // Issue the certificate
    const updatedProfile = await prisma.profile.update({
      where: { id: userId },
      data: {
        certificateIssued: true,
        certificateUrl: `certificate-${userId}.pdf`
      }
    })

    return NextResponse.json({
      success: true,
      certificateUrl: updatedProfile.certificateUrl,
      issuedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Certificate issuance error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}