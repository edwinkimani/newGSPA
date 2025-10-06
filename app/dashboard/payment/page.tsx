"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react" // Keep import but don't use

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
   const router = useRouter()
   const searchParams = useSearchParams()
   const supabase = createClient()

  const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_your_key_here"
   const MEMBERSHIP_FEE = 7000 // 70 USD in cents
   const TEST_FEE = 6500 // 65 USD in cents
   const RETAKE_FEE = 4550 // 45 USD in cents

  useEffect(() => {
    const getUserProfile = async () => {
      const requestedType = searchParams.get('type') as 'membership' | 'test' | 'retake' | 'module' | null
      const requestedModuleId = searchParams.get('moduleId')
      const requestedExamDate = searchParams.get('examDate')
      const reference = searchParams.get('reference')

      // Handle payment verification if returning from Paystack
      if (reference) {
        try {
          const verifyResponse = await fetch(`/api/paystack/verify?reference=${reference}`)
          const verifyData = await verifyResponse.json()

          if (verifyResponse.ok && verifyData.data.status === 'success') {
            // Payment successful, proceed with success handling
            await handlePaymentSuccess({ reference })
            return
          } else {
            alert('Payment verification failed. Please contact support.')
            router.push('/dashboard/payment')
            return
          }
        } catch (error) {
          console.error('Payment verification error:', error)
          alert('Payment verification failed. Please contact support.')
          router.push('/dashboard/payment')
          return
        }
      }

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

        // Fetch module data
        try {
          const moduleResponse = await fetch(`/api/modules/${requestedModuleId}`, {
            credentials: 'include'
          })
          if (moduleResponse.ok) {
            const moduleInfo = await moduleResponse.json()
            setModuleData(moduleInfo)
          } else {
            console.error('Failed to fetch module data:', moduleResponse.status)
            // Try to get module data from enrollment if fetch fails
            try {
              const enrollmentResponse = await fetch('/api/user-enrollments', {
                credentials: 'include'
              })
              if (enrollmentResponse.ok) {
                const enrollments = await enrollmentResponse.json()
                const userEnrollment = enrollments.find((e: any) => e.moduleId === requestedModuleId)
                if (userEnrollment) {
                  setModuleData(userEnrollment.module)
                }
              }
            } catch (enrollmentError) {
              console.error('Failed to fetch enrollment data:', enrollmentError)
            }
          }
        } catch (error) {
          console.error('Error fetching module data:', error)
          // Fallback: try to get from enrollment
          try {
            const enrollmentResponse = await fetch('/api/user-enrollments', {
              credentials: 'include'
            })
            if (enrollmentResponse.ok) {
              const enrollments = await enrollmentResponse.json()
              const userEnrollment = enrollments.find((e: any) => e.moduleId === requestedModuleId)
              if (userEnrollment) {
                setModuleData(userEnrollment.module)
              }
            }
          } catch (enrollmentError) {
            console.error('Failed to fetch enrollment data:', enrollmentError)
          }
        } finally {
          setModuleDataLoading(false)
        }
      } else {
        // Handle other payment types
        if (profile.membership_fee_paid && profile.payment_status === "completed" && !requestedType) {
          // Default to retake if test completed and failed, else test
          if (profile.test_completed) {
            setPaymentType('retake')
          } else {
            setPaymentType('test')
          }
        } else {
          setPaymentType(requestedType || (profile.membership_fee_paid ? 'test' : 'membership'))
        }
      }

      setIsLoading(false)
    }

    getUserProfile()
  }, [router, searchParams])

  const handlePaymentSuccess = async (reference: any) => {
    if (!user) return

    try {
      if (paymentType === 'module' && moduleId) {
        // Complete the module enrollment
        console.log('Completing module enrollment:', { moduleId, reference: reference.reference, examDate })
        const response = await fetch('/api/user-enrollments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            moduleId: moduleId,
            paymentReference: reference.reference,
            paymentStatus: 'COMPLETED',
            examDate: examDate
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error('Enrollment completion failed:', errorData)
          throw new Error(errorData.error || `Failed to complete enrollment (${response.status})`)
        }
        console.log('Enrollment completed successfully')
      } else {
        // Handle other payment types
        const updateData: any = {}

        if (paymentType === 'membership') {
          updateData.membership_fee_paid = true
          updateData.membership_payment_reference = reference.reference
        } else if (paymentType === 'test') {
          updateData.payment_status = "completed"
          updateData.payment_reference = reference.reference
        } else if (paymentType === 'retake') {
          updateData.payment_status = "completed"
          updateData.test_completed = false // Allow retake
          updateData.test_score = null
          updateData.payment_reference = reference.reference
        }

        // Update Supabase profile
        const { error } = await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", user.id)

        if (error) throw error

        // Also update Prisma profile for membership payment
        if (paymentType === 'membership' && user?.id) {
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
            // Don't throw here, Supabase update succeeded
          }
        }
      }

      setPaymentSuccess(true)

      localStorage.setItem("paid-user-id", user.id)

      setTimeout(() => {
        router.push("/dashboard?payment=success")
      }, 3000)
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
          return moduleData.price * 100 // Convert to cents
        }
        // If module data not available, show loading or error
        return 0 // This will prevent payment until data loads
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
    currency: "USD",
    metadata: {
      user_id: user?.id,
      payment_type: paymentType,
      module_id: moduleId,
      exam_date: examDate,
      custom_fields: [
        {
          display_name: getPaymentTitle(),
          variable_name: "payment_type",
          value: paymentType,
        },
      ],
    },
  }

  if (isLoading || (paymentType === 'module' && moduleDataLoading)) {
    return (
      <div className="flex items-center justify-center py-8">
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
      <div className="flex items-center justify-center py-8">
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
              <Button onClick={() => router.push("/dashboard?payment=success")} className="w-full">
                Return to Dashboard
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
                className="w-full h-12 px-4 py-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
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

            <div className="text-center text-sm text-muted-foreground">
              <p>By proceeding with payment, you agree to our terms and conditions.</p>
              <p className="mt-2">
                {paymentType === 'membership'
                  ? 'After payment, you become a GSPA member and can access the dashboard to take the security aptitude test.'
                  : paymentType === 'test'
                  ? 'After payment, you can take the 30-question security aptitude test and receive immediate results.'
                  : paymentType === 'retake'
                  ? 'After payment, you can retake the security aptitude test with a new set of questions.'
                  : paymentType === 'module'
                  ? `After payment, you can access the ${moduleData?.title} module and start your learning journey with structured content and assessments.`
                  : 'After payment, you will have access to the requested service.'
                } All payments are processed in USD.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
