import { NextRequest, NextResponse } from 'next/server'
import { sendVerificationEmail } from '@/lib/auth/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Generate a test token
    const testToken = 'test-verification-token-123'

    // Send test verification email
    await sendVerificationEmail(email, testToken)

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      testToken,
      verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email/${testToken}`
    })
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
