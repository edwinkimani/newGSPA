"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"

interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  membership_fee_paid: boolean
  payment_status: string
  test_completed: boolean
}

export default function DashboardPaymentPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentType, setPaymentType] = useState<'membership' | 'test' | 'retake' | 'module'>('membership')
  const [moduleId, setModuleId] = useState<string | null>(null)
  const [examDate, setExamDate] = useState<string | null>(null)
  const [moduleData, setModuleData] = useState<any>(null)
  const [moduleDataLoading, setModuleDataLoading] = useState(false)
  const [initializingPayment, setInitializingPayment] = useState(false)
  const [verifyingPayment, setVerifyingPayment] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_your_key_here"
  const MEMBERSHIP_FEE = 7000
  const TEST_FEE = 6500
  const RETAKE_FEE = 4550

  // Load user data first
  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const requestedType = searchParams.get('type') as 'membership' | 'test' | 'retake' | 'module' | null
        const requestedModuleId = searchParams.get('moduleId')
        const requestedExamDate = searchParams.get('examDate')

        // Use the same authentication as dashboard
        const res = await fetch('/api/auth/user')
        if (res.status === 401) {
          router.push("/auth/login")
          return
        }
        if (!res.ok) {
          router.push("/register")
          return
        }

        const data = await res.json()
        const profile = data.profile

        if (!profile) {
          router.push("/register")
          return
        }

        setUser(profile)

        // Handle module payment
        if (requestedType === 'module' && requestedModuleId) {
          setPaymentType('module')
          setModuleId(requestedModuleId)
          setExamDate(requestedExamDate)
          setModuleDataLoading(true)

          try {
            const moduleResponse = await fetch(`/api/modules/${requestedModuleId}`, {
              credentials: 'include'
            })
            if (moduleResponse.ok) {
              const moduleInfo = await moduleResponse.json()
              setModuleData(moduleInfo)
            }
          } catch (error) {
            console.error('Error fetching module data:', error)
          } finally {
            setModuleDataLoading(false)
          }
        } else {
          // Handle other payment types
          if (profile.membership_fee_paid && profile.payment_status === "completed" && !requestedType) {
            setPaymentType(profile.test_completed ? 'retake' : 'test')
          } else {
            setPaymentType(requestedType || (profile.membership_fee_paid ? 'test' : 'membership'))
          }
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Error loading user profile:', error)
        setIsLoading(false)
      }
    }

    getUserProfile()
  }, [router, searchParams])

  // Verify payment after user data is loaded
  useEffect(() => {
    const verifyPayment = async () => {
      // Don't verify if still loading user data or if user is not loaded
      if (isLoading || !user) return

      const reference = searchParams.get('reference')
      const trxref = searchParams.get('trxref')
      const paymentReference = reference || trxref

      // If no payment reference, we're not returning from Paystack
      if (!paymentReference) return

      // If we already processed this payment, skip
      if (paymentSuccess) return

      console.log('Processing Paystack return with reference:', paymentReference)
      setVerifyingPayment(true)

      try {
        console.log('Calling verify API with reference:', paymentReference)
        const verifyResponse = await fetch(`/api/paystack/verify?reference=${paymentReference}`)
        
        if (!verifyResponse.ok) {
          throw new Error(`HTTP error! status: ${verifyResponse.status}`)
        }
        
        const verifyData = await verifyResponse.json()
        console.log('Verify response data:', verifyData)

        if (verifyData.data && verifyData.data.status === 'success') {
          console.log('Payment verification successful')
          
          // Extract payment info from metadata
          const metadata = verifyData.data.metadata || {}
          const paymentTypeFromMeta = metadata.payment_type || searchParams.get('type') as 'membership' | 'test' | 'retake' | 'module' | null
          const moduleIdFromMeta = metadata.module_id || searchParams.get('moduleId')
          const examDateFromMeta = metadata.exam_date || searchParams.get('examDate')

          console.log('Processing payment success with user:', user.id)
          await handlePaymentSuccess({
            reference: verifyData.data,
            paymentType: paymentTypeFromMeta,
            moduleId: moduleIdFromMeta,
            examDate: examDateFromMeta
          })
        } else {
          console.error('Payment verification failed:', verifyData)

          // Try fallback with URL parameters
          console.log('Trying fallback with URL parameters...')
          const paymentTypeFromUrl = searchParams.get('type') as 'membership' | 'test' | 'retake' | 'module' | null
          const moduleIdFromUrl = searchParams.get('moduleId')
          const examDateFromUrl = searchParams.get('examDate')

          console.log('URL fallback parameters:', { paymentTypeFromUrl, moduleIdFromUrl, examDateFromUrl })

          if (paymentTypeFromUrl) {
            await handlePaymentSuccess({
              reference: { reference: paymentReference },
              paymentType: paymentTypeFromUrl,
              moduleId: moduleIdFromUrl,
              examDate: examDateFromUrl
            })
          } else {
            alert(`Payment verification failed: ${verifyData.message || 'Unknown error'}. Please contact support.`)
            setVerifyingPayment(false)

            // Clean up URL to prevent infinite retry
            const cleanUrl = window.location.pathname
            window.history.replaceState({}, '', cleanUrl)
          }
        }
      } catch (error) {
        console.error('Payment verification error:', error)
        alert('Payment verification failed. Please contact support.')
        setVerifyingPayment(false)
        
        // Clean up URL to prevent infinite retry
        const cleanUrl = window.location.pathname
        window.history.replaceState({}, '', cleanUrl)
      }
    }

    verifyPayment()
  }, [user, isLoading, searchParams, paymentSuccess]) // Add dependencies

  const handlePaymentSuccess = async (params: any) => {
    console.log('handlePaymentSuccess called with params:', params)
    const { reference, paymentType: paymentTypeParam, moduleId: moduleIdParam, examDate: examDateParam } = params
    
    if (!user) {
      console.error('No user found for payment success')
      return
    }

    // Use passed parameters or fall back to state
    const currentPaymentType = paymentTypeParam || paymentType
    const currentModuleId = moduleIdParam || moduleId
    const currentExamDate = examDateParam || examDate

    console.log('Processing payment success:', { 
      currentPaymentType, 
      currentModuleId, 
      currentExamDate, 
      reference: reference.reference,
      userId: user.id 
    })

    try {
      if (currentPaymentType === 'module' && currentModuleId) {
        // Complete the module enrollment
        console.log('Completing module enrollment for module:', currentModuleId)

        const requestBody = {
          moduleId: currentModuleId,
          paymentReference: reference.reference,
          paymentStatus: 'COMPLETED',
          examDate: currentExamDate
        }

        console.log('Sending enrollment request body:', requestBody)

        const response = await fetch('/api/user-enrollments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(requestBody)
        })

        console.log('Enrollment API response status:', response.status)

        const responseText = await response.text()
        console.log('Enrollment API response text:', responseText)

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}`
          try {
            const errorData = JSON.parse(responseText)
            errorMessage = errorData.error || errorMessage
            console.error('Enrollment completion failed - parsed error:', errorData)
          } catch (parseError) {
            console.error('Enrollment completion failed - raw response:', responseText)
            errorMessage = responseText || errorMessage
          }
          throw new Error(`Failed to complete enrollment: ${errorMessage}`)
        }

        try {
          const responseData = JSON.parse(responseText)
          console.log('Enrollment completed successfully:', responseData)
        } catch (parseError) {
          console.log('Enrollment completed (response not JSON):', responseText)
        }
      } else {
        // Handle other payment types
        const updateData: any = {}

        if (currentPaymentType === 'membership') {
          updateData.membership_fee_paid = true
          updateData.membership_payment_reference = reference.reference
        } else if (currentPaymentType === 'test') {
          updateData.payment_status = "completed"
          updateData.payment_reference = reference.reference
        } else if (currentPaymentType === 'retake') {
          updateData.payment_status = "completed"
          updateData.test_completed = false
          updateData.test_score = null
          updateData.payment_reference = reference.reference
        }

        console.log('Updating user profile with:', updateData)
        // Update Supabase profile
        const { error } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", user.id)

        if (error) {
          console.error('Supabase update error:', error)
          throw error
        }

        // Also update Prisma profile for membership payment
        if (currentPaymentType === 'membership') {
          const response = await fetch(`/api/profiles/${user.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              membershipFeePaid: true,
              paymentReference: reference.reference,
            }),
          })

          if (!response.ok) {
            console.error('Failed to update Prisma profile')
          }
        }
      }

      console.log('Payment processing completed successfully')
      setPaymentSuccess(true)
      setVerifyingPayment(false)

      localStorage.setItem("paid-user-id", user.id)

      // Clean up URL parameters to prevent re-verification
      const cleanUrl = window.location.pathname
      window.history.replaceState({}, '', cleanUrl)

      // Redirect after a short delay
      setTimeout(() => {
        console.log('Redirecting to dashboard')
        router.push("/dashboard?payment=success")
      }, 2000)

    } catch (error) {
      console.error("Payment update error:", error)
      setVerifyingPayment(false)
      alert("Payment was successful but there was an error updating your status. Please contact support.")
      
      // Clean up URL even on error
      const cleanUrl = window.location.pathname
      window.history.replaceState({}, '', cleanUrl)
    }
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
          callback_url: `${window.location.origin}/dashboard/payment`,
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
      case 'module':
        if (moduleData && moduleData.price) {
          return moduleData.price * 100
        }
        return 0
      default: return MEMBERSHIP_FEE
    }
  }

  const getPaymentTitle = () => {
    switch (paymentType) {
      case 'membership': return 'Membership Fee'
      case 'test': return 'Security Aptitude Test Fee'
      case 'retake': return 'Test Retake Fee'
      case 'module': return moduleData ? `${moduleData.title} Module` : 'Module Fee'
      default: return 'Fee'
    }
  }

  const paystackConfig = {
    reference: `GSPA-${paymentType}-${moduleId || user?.id}-${Date.now()}`,
    email: user?.email || "",
    amount: getAmount(),
    publicKey: PAYSTACK_PUBLIC_KEY,
    metadata: {
      user_id: user?.id,
      payment_type: paymentType,
      module_id: moduleId,
      exam_date: examDate,
    },
  }

  // Show loading state during verification
  if (verifyingPayment) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying your payment...</p>
          <p className="text-sm text-muted-foreground mt-2">This may take a few moments</p>
        </div>
      </div>
    )
  }

  if (isLoading || (paymentType === 'module' && moduleDataLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {paymentType === 'module' && moduleDataLoading ? 'Loading module details...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please complete your registration first.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (paymentSuccess) {
    return (
      <div className="p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
              <CardDescription>
                {paymentType === 'membership'
                  ? 'Your membership payment has been processed successfully. You are now a GSPA member.'
                  : paymentType === 'test'
                  ? 'Your payment has been processed successfully. You can now access the security aptitude test.'
                  : paymentType === 'retake'
                  ? 'Your retake payment has been processed successfully. You can now retake the security aptitude test.'
                  : paymentType === 'module'
                  ? `Your payment has been processed successfully. You can now access the ${moduleData?.title} module and start learning.`
                  : 'Your payment has been processed successfully.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Redirecting to dashboard...
              </p>
              <Button onClick={() => router.push("/dashboard?payment=success")}>
                Go to Dashboard Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Payment</h1>
          <p className="text-muted-foreground">
            Complete your payment to proceed with your certification journey.
          </p>
        </div>

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
                : paymentType === 'retake'
                ? 'Complete your payment to retake the security aptitude test.'
                : paymentType === 'module'
                ? `Complete your payment to enroll in the ${moduleData?.title} module and start your learning journey.`
                : 'Complete your payment.'
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
                  : paymentType === 'retake'
                  ? 'This fee covers the retake of the security aptitude test with a new set of questions.'
                  : paymentType === 'module'
                  ? `This fee covers enrollment in the ${moduleData?.title} module, including access to all learning materials and assessments.`
                  : 'This fee covers the requested service.'
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
                disabled={getAmount() === 0 || initializingPayment}
                className="w-full h-12"
              >
                {getAmount() === 0 ? 'Loading payment details...' : initializingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initializing Payment...
                  </>
                ) : (
                  `Pay $${getAmount() / 100} with Paystack`
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}