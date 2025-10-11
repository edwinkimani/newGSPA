"use client"

import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { fetchJson, apiFetch } from '@/lib/api/client'
import { useRouter } from "next/navigation"
import { signIn } from 'next-auth/react'

interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  membership_fee_paid: boolean
  payment_status: string
}

interface Module {
  id: string
  title: string
  price_kes: number
  price_usd: number
}

export default function PaymentPage() {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [module, setModule] = useState<Module | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [paymentSuccess, setPaymentSuccess] = useState(false)
    const [paymentType, setPaymentType] = useState<'membership' | 'test' | 'retake' | 'module'>('membership')
    const [initializingPayment, setInitializingPayment] = useState(false)
    const [isClient, setIsClient] = useState(false)
    const router = useRouter()
  // use REST API client

   const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_your_key_here"
     const MEMBERSHIP_FEE = 7000 // 70 USD in cents
     const TEST_FEE = 6500 // 65 USD in cents
     const RETAKE_FEE = 4550 // 45 USD in cents

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const getUserProfile = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      console.log('Payment page URL params:', Object.fromEntries(urlParams.entries()))

      const requestedType = urlParams.get('type') as 'membership' | 'test' | 'retake' | 'module' | null
      const moduleId = urlParams.get('moduleId')
      const reference = urlParams.get('reference') || urlParams.get('trxref')

      // Set payment type from URL if returning from payment (fallback)
      if (reference && requestedType) {
        setPaymentType(requestedType)
      }

      // Handle payment verification if returning from Paystack
      if (reference) {
        console.log('Processing payment return with reference:', reference)

        // No need to wait for module loading anymore - we get it from verification metadata

        try {
          const verifyResponse = await fetch(`/api/paystack/verify?reference=${reference}`)
          console.log('Verify response status:', verifyResponse.status)
          const verifyData = await verifyResponse.json()
          console.log('Verify response data:', verifyData)

          if (verifyResponse.ok && verifyData.data.status === 'success') {
            console.log('Payment verification successful, processing success...')

            // Extract payment type and module ID from Paystack metadata
            const metadata = verifyData.data.metadata || {}
            const paymentTypeFromMeta = metadata.payment_type || requestedType
            const moduleIdFromMeta = metadata.module_id
            const moduleIdFromUrl = urlParams.get('moduleId') // Also check URL params

            console.log('Payment metadata:', { paymentTypeFromMeta, moduleIdFromMeta, moduleIdFromUrl })

            // Update payment type if different
            if (paymentTypeFromMeta && paymentTypeFromMeta !== paymentType) {
              setPaymentType(paymentTypeFromMeta)
            }

            // Load module if it's a module payment and we have moduleId
            const moduleIdToUse = moduleIdFromMeta || moduleIdFromUrl
            if (paymentTypeFromMeta === 'module' && moduleIdToUse && !module) {
              try {
                const moduleData = await fetchJson(`/api/modules/${moduleIdToUse}`)
                setModule(moduleData)
                console.log('Loaded module from metadata/URL:', moduleData)
              } catch (err) {
                console.error('Failed to load module from metadata/URL:', err)
              }
            }

            // Payment successful, proceed with success handling
            await handlePaymentSuccess({ reference })
            return
          } else {
            console.log('Payment verification failed:', verifyData)
            alert(`Payment verification failed: ${verifyData.message || 'Unknown error'}. Please contact support.`)
            router.push('/payment')
            return
          }
        } catch (error) {
          console.error('Payment verification error:', error)
          alert('Payment verification failed. Please contact support.')
          router.push('/payment')
          return
        }
      }

      const registrationUserId = localStorage.getItem('registration-user-id')

      if (registrationUserId) {
        try {
          const profile = await fetchJson(`/api/profiles/${registrationUserId}`)
          if (profile) {
            setUser(profile)

            if (profile.membership_fee_paid && profile.payment_status === 'COMPLETED' && !requestedType) {
              router.push('/test')
              return
            }

            setPaymentType(requestedType || (profile.membership_fee_paid ? 'test' : 'membership'))
            setIsLoading(false)
            return
          }
        } catch (err) {
          // continue to auth flow
        }
      }

      const authRes = await fetch('/api/auth/user')
      if (authRes.status === 401) {
        router.push('/auth/login')
        return
      }
      const authData = await authRes.json()
      const profile = authData.profile
      if (!profile) {
        router.push('/register')
        return
      }
      setUser(profile)

      // Handle module payment - fetch module details
      if (requestedType === 'module' && moduleId) {
        try {
          const moduleData = await fetchJson(`/api/modules/${moduleId}`)
          setModule(moduleData)
          setPaymentType('module')
        } catch (err) {
          alert('Module not found')
          router.push('/modules')
          return
        }
      } else {
        if (profile.membership_fee_paid && profile.payment_status === 'COMPLETED' && !requestedType) {
          router.push('/test')
        }

        setPaymentType(requestedType || (profile.membership_fee_paid ? 'test' : 'membership'))
      }

      setIsLoading(false)
    }

    getUserProfile()
  }, [router, isClient])

  const handlePaymentSuccess = async (reference: any) => {
    console.log('handlePaymentSuccess called with reference:', reference)
    if (!user) {
      console.log('No user found, returning')
      return
    }

    try {
  if (paymentType === 'module' && module) {
       console.log('Handling module payment for module:', module)
       // Handle module enrollment
       const examDate = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('examDate') : null

       const enrollmentData = {
         moduleId: module.id,
         paymentReference: reference.reference,
         examDate: examDate
       }

       console.log('Creating enrollment with data:', enrollmentData)
       const res = await apiFetch('/api/user-enrollments', { method: 'POST', body: JSON.stringify(enrollmentData), headers: { 'Content-Type': 'application/json' } })
       console.log('Enrollment API response status:', res.status)
       if (!res.ok) {
         const errorText = await res.text()
         console.error('Enrollment failed:', errorText)
         throw new Error('Enrollment failed')
       }

       console.log('Setting payment success to true')
       setPaymentSuccess(true)

       setTimeout(() => {
         console.log('Redirecting to module page:', `/dashboard/my-modules/${module.id}`)
         router.push(`/dashboard/my-modules/${module.id}`)
       }, 3000)
      } else {
        // Handle other payment types
        const updateData: any = {}

        if (paymentType === 'membership') {
          updateData.membershipFeePaid = true;
          updateData.paymentStatus = "COMPLETED";
          updateData.paymentReference = reference.reference;
        } else if (paymentType === 'test') {
          updateData.paymentStatus = "COMPLETED";
          updateData.paymentReference = reference.reference;
        } else if (paymentType === 'retake') {
          updateData.paymentStatus = "COMPLETED";
          updateData.testCompleted = false; // Allow retake
          updateData.testScore = null;
          updateData.paymentReference = reference.reference;
        }

        const res = await apiFetch(`/api/profiles/${user.id}`, { method: 'PUT', body: JSON.stringify(updateData), headers: { 'Content-Type': 'application/json' } })
        if (!res.ok) throw new Error('Failed to update profile after payment')

        // Refresh NextAuth session to update membership status
        if (paymentType === 'membership') {
          try {
            await signIn('credentials', {
              email: user.email,
              password: 'verified-user', // Special password for session refresh
              redirect: false,
            })
            console.log('Session refreshed after membership payment')
          } catch (sessionError) {
            console.error('Failed to refresh session:', sessionError)
          }
        }

        setPaymentSuccess(true)

        localStorage.setItem("paid-user-id", user.id)
        localStorage.removeItem("registration-user-id")

        setTimeout(() => {
          if (paymentType === 'membership') {
            // Redirect to dashboard with success parameter to bypass middleware check temporarily
            router.push("/dashboard?payment=success")
          } else {
            router.push("/test")
          }
        }, 3000)
      }
    } catch (error) {
      console.error("Payment update error:", error)
      alert("Payment was successful but there was an error updating your status. Please contact support.")
    }
  }

  const handlePaymentClose = () => {
    console.log("Payment cancelled")
  }

  const handleInitializePayment = async () => {
    if (!user) return

    setInitializingPayment(true)
    try {
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          amount: getAmount(),
          reference: paystackConfig.reference,
          metadata: paystackConfig.metadata,
          callback_url: `${window.location.origin}/payment`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment')
      }

      // Redirect to Paystack payment page
      window.location.href = data.data.authorization_url
    } catch (error) {
      console.error('Payment initialization error:', error)
      alert('Failed to initialize payment. Please try again.')
    } finally {
      setInitializingPayment(false)
    }
  }

  const getAmount = () => {
    switch (paymentType) {
      case 'membership': return MEMBERSHIP_FEE
      case 'test': return TEST_FEE
      case 'retake': return RETAKE_FEE
      case 'module': return module ? module.price_usd * 100 : 0 // Convert to cents
      default: return MEMBERSHIP_FEE
    }
  }

  const getPaymentTitle = () => {
    switch (paymentType) {
      case 'membership': return 'Membership Fee'
      case 'test': return 'Security Aptitude Test Fee'
      case 'retake': return 'Test Retake Fee'
      case 'module': return module ? `${module.title} Enrollment` : 'Module Fee'
      default: return 'Fee'
    }
  }

  const paystackConfig = {
    reference: `GSPA-${paymentType}-${module?.id || ''}-${user?.id}-${Date.now()}`,
    email: user?.email || "",
    amount: getAmount(),
    publicKey: PAYSTACK_PUBLIC_KEY,
    currency: "USD",
    metadata: {
      user_id: user?.id,
      payment_type: paymentType,
      module_id: module?.id || null,
      examDate: paymentType === 'module' && typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('examDate') : null,
      custom_fields: [
        {
          display_name: getPaymentTitle(),
          variable_name: "payment_type",
          value: paymentType,
        },
      ],
    },
    // Store payment type in reference for redirect handling
    payment_type: paymentType,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading payment details...</p>
            {/* Debug info */}
            {typeof window !== 'undefined' && (
              <div className="mt-4 p-4 bg-muted rounded text-sm text-left max-w-md">
                <p><strong>URL Params:</strong></p>
                <pre className="text-xs">{JSON.stringify(Object.fromEntries(new URLSearchParams(window.location.search)), null, 2)}</pre>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please complete your registration first.</AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    )
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center py-20">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
              <CardDescription>
                {paymentType === 'membership'
                  ? 'Your membership payment has been processed successfully. You are now a GSPA member and can access the dashboard.'
                  : paymentType === 'test'
                  ? 'Your payment has been processed successfully. You can now access the security aptitude test.'
                  : paymentType === 'retake'
                  ? 'Your retake payment has been processed successfully. You can now retake the security aptitude test.'
                  : paymentType === 'module' && module
                  ? `Your enrollment in "${module.title}" has been processed successfully. You can now access the module content.`
                  : 'Your payment has been processed successfully.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => {
                if (paymentType === 'module' && module) {
                  router.push(`/dashboard/my-modules/${module.id}`)
                } else if (paymentType === 'membership') {
                  router.push("/dashboard")
                } else {
                  router.push("/test")
                }
              }} className="w-full">
                {paymentType === 'module' && module
                  ? `Start ${module.title}`
                  : paymentType === 'membership'
                  ? 'Go to Dashboard'
                  : 'Start Security Test'
                }
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        <section className="py-20 lg:py-32 bg-gradient-to-br from-background via-background to-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl lg:text-6xl font-bold text-balance mb-6">Complete Payment</h1>
              <p className="text-xl text-muted-foreground text-pretty mb-8 leading-relaxed">
                Secure your certification journey with our trusted payment system.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <CreditCard className="h-6 w-6" />
                  {getPaymentTitle()} Payment
                </CardTitle>
                <CardDescription>
                  {paymentType === 'membership'
                    ? 'Complete your membership payment to become a GSPA member and access the security aptitude test.'
                    : paymentType === 'test'
                    ? 'Complete your payment to access the security aptitude test and earn your certification.'
                    : 'Complete your payment to retake the security aptitude test.'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Applicant Information</h3>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Name:</strong> {user.first_name} {user.last_name}
                    </p>
                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>
                  </div>
                </div>

                <div className="border rounded-lg p-6">
                   <div className="flex justify-between items-center mb-4">
                     <span className="text-lg font-semibold">{getPaymentTitle()}</span>
                     <span className="text-2xl font-bold">${getAmount() / 100}</span>
                   </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {paymentType === 'membership'
                      ? 'This fee covers GSPA membership, access to the security aptitude test, and membership benefits.'
                      : paymentType === 'test'
                      ? 'This fee covers the security aptitude test (30 questions), immediate results, and certificate issuance upon passing.'
                      : 'This fee covers the retake of the security aptitude test with a new set of questions.'
                    }
                  </p>

                  <Alert>
                     <AlertCircle className="h-4 w-4" />
                     <AlertDescription>
                       Payment is processed securely through Paystack. We accept Visa, Mastercard, and other major cards. All amounts in USD.
                     </AlertDescription>
                   </Alert>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleInitializePayment}
                    disabled={initializingPayment}
                    className="w-full h-12 px-4 py-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {initializingPayment ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Initializing Payment...
                      </>
                    ) : (
                      `Pay $${getAmount() / 100} with Paystack`
                    )}
                  </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  <p>By proceeding with payment, you agree to our terms and conditions.</p>
                  <p className="mt-2">
                    {paymentType === 'membership'
                      ? 'After payment, you become a GSPA member and can access the dashboard to take the security aptitude test.'
                      : paymentType === 'test'
                      ? 'After payment, you can take the 30-question security aptitude test and receive immediate results.'
                      : 'After payment, you can retake the security aptitude test with a new set of questions.'
                    } All payments are processed in USD.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
