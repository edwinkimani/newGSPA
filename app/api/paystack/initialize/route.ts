import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, amount, reference, metadata, callback_url } = await request.json()

    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
    const PAYSTACK_CURRENCY = process.env.PAYSTACK_CURRENCY || 'USD'

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: 'Paystack secret key not configured' }, { status: 500 })
    }

    // Extract payment type from metadata
    const paymentType = metadata?.payment_type || 'membership'
    const moduleId = metadata?.module_id

    // Use provided callback_url or default to /payment
    const callbackUrl = callback_url
      ? new URL(callback_url)
      : new URL(`${process.env.NEXT_PUBLIC_SITE_URL}/payment`)

    // Ensure type is set
    if (!callbackUrl.searchParams.has('type')) {
      callbackUrl.searchParams.set('type', paymentType)
    }

    // Include moduleId in callback URL for safety
    if (moduleId && !callbackUrl.searchParams.has('moduleId')) {
      callbackUrl.searchParams.set('moduleId', moduleId)
    }
    // Include examDate if provided in metadata
    if (metadata.examDate && !callbackUrl.searchParams.has('examDate')) {
      callbackUrl.searchParams.set('examDate', metadata.examDate)
    }

    const requestData = {
      email,
      amount, // in cents
      reference,
      currency: PAYSTACK_CURRENCY,
      callback_url: callbackUrl.toString(),
      metadata,
    }

    console.log('Paystack initialize request:', requestData)
    console.log('Callback URL:', callbackUrl.toString())

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Paystack initialize error:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      })
      return NextResponse.json({ error: data.message || 'Failed to initialize payment' }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Paystack initialize error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
