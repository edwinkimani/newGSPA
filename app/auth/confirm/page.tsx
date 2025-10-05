"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function ConfirmPage() {
    const router = useRouter()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
   const [message, setMessage] = useState('')
   const supabase = createClient()

   // Helper function to clear all registration-related localStorage items
   const clearRegistrationData = () => {
     const keysToRemove = [
       'registration-step-1',
       'registration-step-2',
       'registration-step-3',
       'temp-signup-data',
       'temp-passport-photo',
       'temp-signature',
       'pending-registration',
       'registration-user-id'
     ]

     keysToRemove.forEach(key => {
       try {
         localStorage.removeItem(key)
       } catch (error) {
         console.warn(`Failed to remove localStorage key ${key}:`, error)
       }
     })

     console.log('Cleared all registration-related localStorage items')
   }

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Check if this is a registration confirmation
        const urlParams = new URLSearchParams(window.location.search)
        const isRegistration = urlParams.get('registration') === 'true'
        console.log('Is registration confirmation:', isRegistration)

        // Get the tokens from URL - try both hash and query parameters
        if (typeof window === 'undefined') return

        console.log('Current URL:', window.location.href)
        console.log('URL search:', window.location.search)
        console.log('URL hash:', window.location.hash)

        let accessToken: string | null = null
        let refreshToken: string | null = null
        let type: string | null = null

        // First try to get tokens from URL hash (Supabase default)
        if (window.location.hash) {
          const hash = window.location.hash.substring(1) // Remove the '#'
          console.log('Hash without #:', hash)

          const hashParams = new URLSearchParams(hash)
          accessToken = hashParams.get('access_token')
          refreshToken = hashParams.get('refresh_token')
          type = hashParams.get('type')
          console.log('Tokens from hash:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type })
        }

        // If not found in hash, try query parameters
        if (!accessToken || !refreshToken) {
          const queryParams = new URLSearchParams(window.location.search)
          accessToken = queryParams.get('access_token') || accessToken
          refreshToken = queryParams.get('refresh_token') || refreshToken
          type = queryParams.get('type') || type
          console.log('Tokens from query params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type })
        }

        console.log('Final extracted tokens:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type })

        if (!accessToken || !refreshToken || type !== 'signup') {
          console.error('Invalid confirmation link - missing tokens or wrong type', {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            type,
            expectedType: 'signup'
          })
          setStatus('error')
          setMessage('Invalid confirmation link. Please check the URL or request a new confirmation email.')
          return
        }

        // Set the session with the tokens from the email link
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        })

        if (error) {
          console.error('Email confirmation error:', error)
          console.error('Error details:', {
            message: error.message,
            status: error.status,
            name: error.name
          })

          // Provide more specific error messages
          let errorMessage = 'Failed to confirm email.'
          if (error.message?.includes('expired') || error.message?.includes('invalid')) {
            errorMessage = 'The confirmation link has expired or is invalid. Please request a new confirmation email.'
          } else if (error.message?.includes('already')) {
            errorMessage = 'This email has already been confirmed. You can now proceed to login.'
          }

          setStatus('error')
          setMessage(errorMessage)
          return
        }

        console.log('Session set successfully:', { user: data.user?.id, session: !!data.session })

        // Email confirmed successfully
        setStatus('success')
        setMessage('Email confirmed successfully!')

        // Check if there's pending registration data
        const pendingData = localStorage.getItem('pending-registration')
        console.log('Pending registration data found:', !!pendingData)

        if (pendingData) {
          const registrationData = JSON.parse(pendingData)
          console.log('Registration data:', registrationData)

          // Get the current user to verify authentication
          const { data: { user }, error: userError } = await supabase.auth.getUser()
          console.log('Current authenticated user:', user?.id)
          console.log('User error:', userError)

          if (userError || !user) {
            throw new Error('User not authenticated')
          }

          // Verify the user ID matches
          if (user.id !== registrationData.userId) {
            console.error('User ID mismatch:', { authenticated: user.id, registration: registrationData.userId })
            throw new Error('User ID mismatch')
          }

          // Now that user is confirmed and signed in, save the profile and upload documents
          await saveProfileData(registrationData, supabase)

          // Clear the pending data
          localStorage.removeItem('pending-registration')
          localStorage.removeItem('registration-step-1')
          localStorage.removeItem('registration-step-2')
          localStorage.removeItem('registration-step-3')
          localStorage.removeItem('temp-passport-photo')
          localStorage.removeItem('temp-signature')

          // Clear all registration data from localStorage after successful confirmation
          clearRegistrationData()

          // Don't auto-redirect - user will click button to proceed to payment
          console.log('Email confirmed successfully - user can now proceed to payment')
        } else {
          console.log('No pending registration data found')

          // Clear any leftover registration data that might exist
          clearRegistrationData()

          // If this is a registration confirmation but no pending data, it might be a cross-tab issue
          if (isRegistration) {
            console.log('This appears to be a registration confirmation but pending data was not found')
            console.log('This might be due to localStorage not being shared between tabs')
            setMessage('Email confirmed successfully! It looks like you clicked the confirmation link in a different tab. Please return to your original registration tab and click "Complete Registration" again, or contact support if you need assistance.')
            setStatus('error') // Show as error so user sees the message
            return
          }

          // No pending registration, just redirect to dashboard
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        }

      } catch (error) {
        console.error('Confirmation error:', error)
        setStatus('error')
        setMessage('An unexpected error occurred')
      }
    }

    handleEmailConfirmation()
  }, [supabase.auth, router])

  const saveProfileData = async (data: any, supabaseClient: any) => {
    try {
      console.log('Saving profile data for user:', data.userId)

      // Check if documents bucket exists and is accessible
      let { data: buckets, error: bucketsError } = await supabaseClient.storage.listBuckets()
      let documentsBucket = buckets?.find((bucket: { name: string }) => bucket.name === 'documents')

      if (bucketsError || !documentsBucket) {
        console.warn('Documents bucket not found or not accessible. Attempting to create it...')
        console.log('Available buckets:', buckets)

        // Try to create the bucket
        try {
          const { data: createData, error: createError } = await supabaseClient.storage.createBucket('documents', {
            public: false,
            allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
            fileSizeLimit: 5242880 // 5MB
          })

          if (createError) {
            console.error('Failed to create documents bucket:', createError)
            console.warn('Skipping file uploads due to bucket creation failure')
            documentsBucket = null
          } else {
            console.log('Successfully created documents bucket:', createData)
            // Re-check buckets to confirm creation
            const { data: updatedBuckets } = await supabaseClient.storage.listBuckets()
            documentsBucket = updatedBuckets?.find((bucket: { name: string }) => bucket.name === 'documents')
          }
        } catch (createErr) {
          console.error('Error creating bucket:', createErr)
          console.warn('Skipping file uploads due to bucket creation failure')
          documentsBucket = null
        }
      }

      // Upload documents if they exist in localStorage and bucket is available
      let passportPhotoUrl = null
      let signatureUrl = null

      if (documentsBucket) {
        // Upload passport photo
        const tempPhoto = localStorage.getItem("temp-passport-photo")
        if (tempPhoto) {
          try {
            console.log('Uploading passport photo...')
            const photoBlob = await fetch(tempPhoto).then(res => res.blob())
            const photoFile = new File([photoBlob], `passport-${data.userId}.jpg`, { type: "image/jpeg" })

            const fileName = `passports/${photoFile.name}`
            console.log('Uploading to path:', fileName)

            const { data: uploadData, error: uploadError } = await supabaseClient.storage
              .from("documents")
              .upload(fileName, photoFile, {
                cacheControl: '3600',
                upsert: true // Allow overwriting existing files
              })

          if (uploadError) {
            console.error("Photo upload error:", uploadError)
            console.error("Error details:", JSON.stringify(uploadError, null, 2))
            // Continue with profile creation even if upload fails
          } else {
            console.log('Photo upload data:', uploadData)
            const { data: { publicUrl } } = supabaseClient.storage
              .from("documents")
              .getPublicUrl(fileName)
            passportPhotoUrl = publicUrl
            console.log('Passport photo uploaded successfully, URL:', passportPhotoUrl)
          }
          } catch (photoError) {
            console.error("Photo processing error:", photoError)
            // Continue with profile creation
          }
        } else {
          console.log('No passport photo found in localStorage')
        }

        // Upload signature
        const tempSignature = localStorage.getItem("temp-signature")
        if (tempSignature) {
          try {
            console.log('Uploading signature...')
            const signatureBlob = await fetch(tempSignature).then(res => res.blob())
            const signatureFile = new File([signatureBlob], `signature-${data.userId}.png`, { type: "image/png" })

            const fileName = `signatures/${signatureFile.name}`
            console.log('Uploading signature to path:', fileName)

            const { data: uploadData, error: uploadError } = await supabaseClient.storage
              .from("documents")
              .upload(fileName, signatureFile, {
                cacheControl: '3600',
                upsert: true // Allow overwriting existing files
              })

          if (uploadError) {
            console.error("Signature upload error:", uploadError)
            console.error("Error details:", JSON.stringify(uploadError, null, 2))
            // Continue with profile creation even if upload fails
          } else {
            console.log('Signature upload data:', uploadData)
            const { data: { publicUrl } } = supabaseClient.storage
              .from("documents")
              .getPublicUrl(fileName)
            signatureUrl = publicUrl
            console.log('Signature uploaded successfully, URL:', signatureUrl)
          }
          } catch (sigError) {
            console.error("Signature processing error:", sigError)
            // Continue with profile creation
          }
        } else {
          console.log('No signature found in localStorage')
        }
      } else {
        console.log('Documents bucket not available, skipping file uploads')
      }

      // Prepare profile data
      const profileData = {
        id: data.userId,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone_number: data.phone,
        date_of_birth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : null, // Format as YYYY-MM-DD
        nationality: data.nationality,
        gender: data.gender,
        designation: data.designation,
        organization_name: data.organization,
        document_type: data.documentType,
        document_number: data.documentNumber,
        declaration_accepted: data.declarationAccepted || false,
        passport_photo_url: passportPhotoUrl || null,
        signature_data: signatureUrl || null,
        membership_fee_paid: false,
        payment_status: "pending",
        test_completed: false,
        certificate_issued: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      console.log('Profile data to save:', profileData)

      // Save profile data directly using the authenticated Supabase client
      console.log('Saving profile directly to database...')
      const { data: savedProfile, error: saveError } = await supabaseClient
        .from("profiles")
        .upsert(profileData)
        .select()

      if (saveError) {
        console.error('Profile save error:', saveError)
        console.error('Error details:', JSON.stringify(saveError, null, 2))
        throw new Error(saveError.message || 'Failed to save profile')
      }

      console.log('Profile saved successfully:', savedProfile)
    } catch (error) {
      console.error('Error saving profile:', error)
      throw error
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            {status === 'loading' && (
              <>
                <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
                <h2 className="text-2xl font-bold text-foreground">Confirming Email</h2>
                <p className="text-muted-foreground">
                  Please wait while we confirm your email address...
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                <h2 className="text-2xl font-bold text-foreground">Email Confirmed!</h2>
                <p className="text-muted-foreground">
                  {message} Your account has been successfully created. To complete your registration and access the security aptitude test, you need to pay the membership fee.
                </p>
                <div className="space-y-2 pt-4">
                  <Button onClick={() => router.push('/payment')} className="w-full">
                    Proceed to Payment ($70 USD)
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/')} className="w-full">
                    Return to Home
                  </Button>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="h-16 w-16 text-destructive mx-auto" />
                <h2 className="text-2xl font-bold text-foreground">Confirmation Failed</h2>
                <p className="text-muted-foreground">
                  {message}
                </p>
                <div className="space-y-2">
                  <Button onClick={() => router.push('/register')} className="w-full">
                    Try Again
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/')} className="w-full">
                    Go Home
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
