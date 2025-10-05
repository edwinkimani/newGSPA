"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function VerifyTokenPage() {
  const router = useRouter()
  const params = useParams()
  const token = (params as any)?.token
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setError('Verification token missing')
      setLoading(false)
      return
    }

    ;(async () => {
      try {
        // use POST confirm API for programmatic flow
        const res = await fetch('/api/auth/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        })

        if (!res.ok) {
          const data = await res.json()
          setError(data?.error || 'Verification failed')
          setLoading(false)
          return
        }

        // on success, get the token from JSON response
        const data = await res.json()
        if (data?.token) {
          // navigate to success page with token in URL params to avoid fragment issues
          router.push(`/verify-email/success?token=${encodeURIComponent(data.token)}`)
        } else {
          // fallback
          router.push('/verify-email/success')
        }
      } catch (err: any) {
        console.error('Verification error', err)
        setError(err?.message || 'Verification failed')
        setLoading(false)
      }
    })()
  }, [token, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Verifying…</CardTitle>
          <CardDescription>Please wait while we verify your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            {loading && <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />}
            {error && (
              <div className="space-y-4">
                <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                <p className="text-sm text-red-700">{error}</p>
                <Button onClick={() => router.push('/register/step-4')}>Return to Registration</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
