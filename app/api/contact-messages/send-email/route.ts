import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { Resend } from 'resend'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { to, subject, message, originalMessage } = await request.json()

    if (!to || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const resendApiKey = process.env.RESEND_API_KEY

    if (!resendApiKey) {
      console.warn('Resend API key not configured, skipping email send')
      return NextResponse.json({ success: true, note: 'Email not sent - Resend not configured' })
    }

    const resend = new Resend(resendApiKey)

    // Send email to the user
    await resend.emails.send({
      from: 'noreply@gspa.org',
      to: to,
      subject: `Re: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Response from Global Security Practitioners Alliance</h2>

          <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3>Your Original Message:</h3>
            <p style="white-space: pre-wrap;">${originalMessage}</p>
          </div>

          <div style="background-color: #e8f4fd; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #1a73e8;">
            <h3>Our Response:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

          <p style="color: #666; font-size: 14px;">
            This is an automated response from the Global Security Practitioners Alliance.
            If you have any further questions, please don't hesitate to contact us.
          </p>

          <p style="color: #666; font-size: 14px;">
            Best regards,<br>
            Global Security Practitioners Alliance Team
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
