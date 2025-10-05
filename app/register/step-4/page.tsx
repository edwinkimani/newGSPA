"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RegistrationProgress } from "@/components/registration-progress"
import { CheckCircle2, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const stepTitles = ["Personal Info", "Professional Info", "Documents", "Review"]

export default function RegisterStep4() {
  const router = useRouter()
  const [allData, setAllData] = useState<any>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const step1Data = JSON.parse(localStorage.getItem("registration-step-1") || "{}")
      const step2Data = JSON.parse(localStorage.getItem("registration-step-2") || "{}")
      const step3Data = JSON.parse(localStorage.getItem("registration-step-3") || "{}")

      setAllData({
        ...step1Data,
        ...step2Data,
        ...step3Data,
      })
    }
  }, [])

  // Helper function to convert base64 to blob
  const base64ToBlob = (base64: string, mimeType: string = 'image/jpeg') => {
    // Remove data URL prefix if present
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '')
    const byteCharacters = atob(base64Data)
    const byteArrays = []
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512)
      const byteNumbers = new Array(slice.length)
      
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i)
      }
      
      const byteArray = new Uint8Array(byteNumbers)
      byteArrays.push(byteArray)
    }
    
    return new Blob(byteArrays, { type: mimeType })
  }

  // Improved upload function
  const uploadImageToStorage = async (base64Data: string, folder: string, fileName: string, mimeType: string = 'image/jpeg') => {
    try {
      if (!base64Data) return null

      const blob = base64ToBlob(base64Data, mimeType)
      const file = new File([blob], fileName, { type: mimeType })

      const { data, error } = await supabase.storage
        .from('documents')
        .upload(`${folder}/${fileName}`, file, { cacheControl: '3600', upsert: true })

      if (error) {
        console.error(`[v0] ${folder} upload error:`, error)
        throw error
      }

      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(`${folder}/${fileName}`)
      return urlData?.publicUrl || null
    } catch (err) {
      console.error(`[v0] ${folder} processing error:`, err)
      throw err
    }
  }

  const handleSubmit = async (e?: React.SyntheticEvent) => {
    if (e && typeof (e as any).preventDefault === 'function') (e as any).preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      console.log('[v0] Starting registration process')
      console.log('[v0] Registration data:', allData)

      // Upload images first (if any)
      let passportPhotoUrl: string | null = null
      let signatureUrl: string | null = null

      try {
        if (typeof window !== 'undefined') {
          const tempPhoto = localStorage.getItem('temp-passport-photo')
          if (tempPhoto) {
            passportPhotoUrl = await uploadImageToStorage(tempPhoto, 'passports', `passport-${Date.now()}.jpg`, 'image/jpeg')
          }
        }
      } catch (photoErr) {
        console.error('[v0] Passport upload failed, continuing without it', photoErr)
      }

      try {
        if (typeof window !== 'undefined') {
          const tempSignature = localStorage.getItem('temp-signature')
          if (tempSignature) {
            signatureUrl = await uploadImageToStorage(tempSignature, 'signatures', `signature-${Date.now()}.png`, 'image/png')
          }
        }
      } catch (sigErr) {
        console.error('[v0] Signature upload failed, continuing without it', sigErr)
      }

      // Call REST signup endpoint
      const signupPayload = {
        email: allData.email,
        password: allData.password,
        firstName: allData.firstName,
        lastName: allData.lastName,
        phoneNumber: allData.phone,
        dateOfBirth: allData.dateOfBirth,
        nationality: allData.nationality,
        gender: allData.gender,
        designation: allData.designation,
        organizationName: allData.organization,
        documentType: allData.documentType,
        documentNumber: allData.documentNumber,
        declarationAccepted: !!allData.declarationAccepted,
        passportPhotoUrl,
        signatureUrl
      }

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupPayload)
      })

      const result = await res.json()
      if (!res.ok) {
        console.error('[v0] Signup failed', result)
        setError(result?.error || 'Registration failed')
        return
      }

      // persist pending registration (for email confirmation flow)
      if (typeof window !== 'undefined') {
        localStorage.setItem('pending-registration', JSON.stringify({ id: result.id, ...allData, passportPhotoUrl, signatureUrl }))

        // cleanup temp images
        localStorage.removeItem('temp-passport-photo')
        localStorage.removeItem('temp-signature')
      }

      setSubmitSuccess(true)
    } catch (err: any) {
      console.error('[v0] Registration submission error:', err)
      setError(err?.message || 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const goBack = () => {
    router.push("/register/step-3")
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-foreground">Check Your Email!</h2>
              <p className="text-muted-foreground">
                We've sent a confirmation link to {allData.email}. Please check your email and click the link to verify your account. Once verified, you'll be able to proceed with payment and access the security aptitude test.
              </p>
              <Button onClick={() => router.push("/")} className="w-full">
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isSubmitting) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-card rounded-lg p-8 shadow-2xl max-w-sm w-full mx-4">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <h3 className="text-xl font-semibold text-foreground">Submitting Registration</h3>
            <p className="text-muted-foreground">
              Please wait while we process your information and create your account...
            </p>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <RegistrationProgress currentStep={4} totalSteps={4} stepTitles={stepTitles} />

      <div className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl md:text-2xl font-bold text-foreground">Review Your Information</CardTitle>
              <CardDescription className="text-sm md:text-base">Please review all details before submitting</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Personal Information */}
              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-3 text-sm md:text-base">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs md:text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {allData.firstName} {allData.lastName}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {allData.email}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {allData.phone}
                  </div>
                  <div>
                    <span className="font-medium">Date of Birth:</span> {allData.dateOfBirth}
                  </div>
                  <div>
                    <span className="font-medium">Nationality:</span> {allData.nationality}
                  </div>
                  <div>
                    <span className="font-medium">Gender:</span> {allData.gender}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Password:</span> ********
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-3 text-sm md:text-base">Professional Information</h3>
                <div className="grid grid-cols-1 gap-2 text-xs md:text-sm">
                  <div>
                    <span className="font-medium">Designation:</span> {allData.designation}
                  </div>
                  <div>
                    <span className="font-medium">Organization:</span> {allData.organization}
                  </div>
                </div>
              </div>

              {/* Document Information */}
              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-3 text-sm md:text-base">Document Information</h3>
                <div className="grid grid-cols-1 gap-2 text-xs md:text-sm">
                  <div>
                    <span className="font-medium">Document Type:</span> {allData.documentType}
                  </div>
                  <div>
                    <span className="font-medium">Document Number:</span> {allData.documentNumber}
                  </div>
                  <div>
                    <span className="font-medium">Declaration:</span>{" "}
                    {allData.declarationAccepted ? "Accepted" : "Not Accepted"}
                  </div>
                  <div>
                    <span className="font-medium">Signature:</span> {typeof window !== 'undefined' && localStorage.getItem("temp-signature") ? "✓ Provided" : "Not provided"}
                  </div>
                  <div>
                    <span className="font-medium">Passport Photo:</span> {typeof window !== 'undefined' && localStorage.getItem("temp-passport-photo") ? "✓ Uploaded" : "Not uploaded"}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
                <Button type="button" variant="outline" onClick={goBack} className="px-6 md:px-8">
                  Previous
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="px-6 md:px-8">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Complete Registration"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
