"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

export default function VerifyEmailPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const token = params?.get('token')
    if (!token) {
      setError('Verification token missing')
      setLoading(false)
      return
    }

    ;(async () => {
      try {
        const res = await fetch(`/api/auth/confirm?token=${encodeURIComponent(token)}`)
        const data = await res.json()
        if (!res.ok) {
          setError(data?.error || 'Verification failed')
          setLoading(false)
          return
        }

        // store token for subsequent API calls
        if (data?.token) {
          try { localStorage.setItem('auth_token', data.token) } catch {}
        }

        setSuccess(true)
        setLoading(false)

        // small delay for UX then redirect
        setTimeout(() => {
          // prefer redirect to dashboard if profile exists
          if (data?.profile) router.push('/dashboard')
          else router.push('/')
        }, 1200)
      } catch (err: any) {
        console.error('Verification error', err)
        setError(err?.message || 'Verification failed')
        setLoading(false)
      }
    })()
  }, [params, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>Please wait while we verify your email address.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            {loading && (
              <>
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <p className="mt-4 text-sm text-muted-foreground">Verifying your account...</p>
              </>
            )}

            {error && (
              <div className="space-y-4">
                <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                <p className="text-sm text-red-700">{error}</p>
                <div className="pt-4">
                  <Button onClick={() => router.push('/register/step-4')}>Return to Registration</Button>
                </div>
              </div>
            )}

            {success && (
              <div className="space-y-4">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                <p className="text-sm text-foreground">Your email has been verified. Redirecting...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
