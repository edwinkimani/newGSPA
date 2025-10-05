"use client"

import { cn } from "@/lib/utils"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RegistrationProgress } from "@/components/registration-progress"
import { SignaturePad } from "@/components/signature-pad"
import { PhotoUpload } from "@/components/photo-upload"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

interface Step3Form {
  documentType: string
  documentNumber: string
  passportPhoto?: File | null
  signature?: string | null
  declarationAccepted: boolean
}

const stepTitles = ["Personal Info", "Professional Info", "Documents", "Review"]

export default function RegisterStep3() {
  const router = useRouter()
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Step3Form>({
    mode: "onSubmit",
  })

  useEffect(() => {
    const saved = localStorage.getItem("registration-step-3")
    if (saved) {
      const data = JSON.parse(saved)
      Object.keys(data).forEach((key) => {
        if (key !== "passportPhoto") {
          setValue(key as keyof Step3Form, data[key])
        }
      })
    }
  }, [setValue])

  const formData = watch()
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const dataToSave = { ...formData }
      delete dataToSave.passportPhoto // Don't save file to localStorage
      localStorage.setItem("registration-step-3", JSON.stringify(dataToSave))
    }, 1000)
    return () => clearTimeout(timeoutId)
  }, [formData])

  const onSubmit = async (data: Step3Form) => {
    setIsUploading(true)

    try {
      // Store files locally for upload after authentication in step 4
      const dataToSave = {
        ...data,
        passportPhotoFile: photoFile, // Store the actual file
        signatureData: data.signature, // Keep base64 signature
      }

      // Remove non-serializable data for localStorage
      const localStorageData = { ...dataToSave }
      delete (localStorageData as any).passportPhotoFile // Files can't be stored in localStorage

      localStorage.setItem("registration-step-3", JSON.stringify(localStorageData))

      // Store files separately (in memory for now, will be uploaded in step 4)
      if (photoFile) {
        // Convert file to base64 for temporary storage
        const reader = new FileReader()
        reader.onload = () => {
          localStorage.setItem("temp-passport-photo", reader.result as string)
        }
        reader.readAsDataURL(photoFile)
      }

      if (data.signature) {
        localStorage.setItem("temp-signature", data.signature)
      }

      router.push("/register/step-4")
    } catch (error: any) {
      console.error("Error saving documents:", error)
      alert("Failed to save documents. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const goBack = () => {
    router.push("/register/step-2")
  }

  return (
    <div className="min-h-screen bg-background">
      <RegistrationProgress currentStep={3} totalSteps={4} stepTitles={stepTitles} />

      <div className="py-6 px-4 sm:py-8">
        <div className="max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-6 md:pb-8">
              <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Documents & Verification
              </CardTitle>
              <CardDescription className="text-base md:text-lg">
                Upload your documents and provide your digital signature
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 sm:space-y-6 md:space-y-8 px-4 sm:px-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 md:space-y-8">
                {/* Document Information */}
                <div className="bg-muted rounded-xl p-6 space-y-6">
                  <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                    Document Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label>Document Type *</Label>
                      <Controller
                        name="documentType"
                        control={control}
                        rules={{ required: "Please select a document type" }}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className={cn("h-12 bg-input", errors.documentType ? "border-red-500" : "")}>
                              <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="passport">Passport</SelectItem>
                              <SelectItem value="national_id">National ID</SelectItem>
                              <SelectItem value="drivers_license">Driver's License</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.documentType && <p className="text-sm text-red-600">{errors.documentType.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="documentNumber">Document Number *</Label>
                      <Input
                        id="documentNumber"
                        {...register("documentNumber", {
                          required: "Document number is required",
                          minLength: { value: 3, message: "Document number must be at least 3 characters" },
                        })}
                        placeholder="Enter document number"
                        className={cn("h-12 bg-input text-foreground ", errors.documentNumber ? "border-red-500" : "")}
                      />
                      {errors.documentNumber && <p className="text-sm text-red-600">{errors.documentNumber.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="bg-muted rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 mb-6">
                    Passport Photo
                  </h3>
                  <Controller
                    name="passportPhoto"
                    control={control}
                    rules={{
                      required: "Passport photo is required",
                      validate: () => {
                        if (!photoFile) return "Please upload a passport photo"
                        if (!(photoFile instanceof File)) return "Invalid file format"
                        if (!photoFile.type.startsWith("image/")) return "Please upload an image file"
                        if (photoFile.size > 5 * 1024 * 1024) return "File size must be less than 5MB"
                        return true
                      },
                    }}
                    render={({ field }) => (
                      <PhotoUpload
                        onPhotoChange={(file) => {
                          console.log("[v0] Photo file selected:", file) // Debug log
                          setPhotoFile(file)
                          field.onChange(file)
                        }}
                        value={photoFile} // Use photoFile state instead of field.value for better sync
                        required
                        error={errors.passportPhoto?.message}
                      />
                    )}
                  />
                </div>

                {/* Digital Signature */}
                <div className="bg-muted rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 mb-6">
                    Digital Signature
                  </h3>
                  <Controller
                    name="signature"
                    control={control}
                    rules={{ required: "Digital signature is required" }}
                    render={({ field }) => (
                      <SignaturePad
                        onSignatureChange={field.onChange}
                        value={field.value}
                        required
                        error={errors.signature?.message}
                      />
                    )}
                  />
                </div>

                {/* Declaration */}
                <div className="bg-muted border border-border rounded-xl p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <Controller
                      name="declarationAccepted"
                      control={control}
                      rules={{
                        required: "You must accept the declaration",
                        validate: (value) => value === true || "You must accept the declaration",
                      }}
                      render={({ field }) => (
                        <Checkbox
                          id="declaration"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-1"
                        />
                      )}
                    />
                    <div className="space-y-2 md:space-y-3">
                      <Label htmlFor="declaration" className="text-sm md:text-base font-semibold text-foreground">
                        Declaration & Agreement *
                      </Label>
                      <div className="text-xs md:text-sm text-muted-foreground space-y-2">
                        <p>
                          I hereby declare that all information provided is true and accurate to the best of my
                          knowledge. I understand that any false information may result in disqualification from the
                          certification process and may have legal consequences.
                        </p>
                        <p>
                          By signing above, I agree to the terms and conditions of the Global Security Practitioners
                          Alliance and consent to the processing of my personal data for certification purposes.
                        </p>
                      </div>
                      {errors.declarationAccepted && (
                        <p className="text-sm text-red-600">{errors.declarationAccepted.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
                  <Button type="button" variant="outline" onClick={goBack} className="px-6 md:px-8 py-3 bg-transparent">
                    Previous
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUploading}
                    className="px-6 md:px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Review & Submit"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
