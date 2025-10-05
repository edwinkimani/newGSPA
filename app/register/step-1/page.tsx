"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RegistrationProgress } from "@/components/registration-progress"
import { PhoneInput } from "@/components/ui/phone-input"
import { Loader2 } from "lucide-react"   // ✅ spinner icon

interface Step1Form {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

const stepTitles = ["Personal Info", "Professional Info", "Documents", "Review"]

export default function RegisterStep1() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)  // ✅ spinner state

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
  } = useForm<Step1Form>({
    mode: "onSubmit",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  })

  // Load saved data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("registration-step-1")
    const signupData = localStorage.getItem("temp-signup-data")

    let formData = {}

    if (saved) {
      formData = { ...formData, ...JSON.parse(saved) }
    }

    if (signupData) {
      const signup = JSON.parse(signupData)
      formData = { ...formData, email: signup.email, password: signup.password, confirmPassword: signup.password }
      // Clear the temp signup data after using it
      localStorage.removeItem("temp-signup-data")
    }

    if (Object.keys(formData).length > 0) {
      reset(formData)
    }
  }, [reset])

  // Auto-save form data
  const formData = watch()
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem("registration-step-1", JSON.stringify(formData))
    }, 1000)
    return () => clearTimeout(timeoutId)
  }, [formData])

  const onSubmit = (data: Step1Form) => {
    setIsLoading(true)   // ✅ show spinner
    localStorage.setItem("registration-step-1", JSON.stringify(data))

    // simulate async work (e.g., API call) before navigating
    setTimeout(() => {
      router.push("/register/step-2")
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-background">
      <RegistrationProgress currentStep={1} totalSteps={4} stepTitles={stepTitles} />

      <div className="py-8 px-4 sm:py-12">
        <div className="max-w-md sm:max-w-lg md:max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-6 md:pb-8">
              <CardTitle className="text-2xl md:text-3xl font-bold">Personal Information</CardTitle>
              <CardDescription className="text-base md:text-lg">Let's start with your basic details</CardDescription>
            </CardHeader>

            <CardContent className="pt-0 px-4 sm:px-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 md:space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
                    <Input
                      id="firstName"
                      {...register("firstName", {
                        required: "First name is required",
                        minLength: { value: 2, message: "Must be at least 2 characters" },
                      })}
                      placeholder="John"
                      className={`h-12 bg-input text-foreground ${errors.firstName ? "border-destructive" : ""}`}
                    />
                    {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
                    <Input
                      id="lastName"
                      {...register("lastName", {
                        required: "Last name is required",
                        minLength: { value: 2, message: "Must be at least 2 characters" },
                      })}
                      placeholder="Doe"
                      className={`h-12 bg-input text-foreground ${errors.lastName ? "border-destructive" : ""}`}
                    />
                    {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email address",
                      },
                      validate: async (value) => {
                        if (!value) return true
                        try {
                          const response = await fetch('/api/check-email', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ email: value }),
                          })

                          const result = await response.json()

                          if (result.exists) {
                            return "This email address is already registered"
                          }
                          return true
                        } catch (error) {
                          // If API fails, allow registration to continue
                          console.error('Email check failed:', error)
                          return true
                        }
                      }
                    })}
                    placeholder="john.doe@example.com"
                    className={`h-12 bg-input text-foreground ${errors.email ? "border-destructive" : ""}`}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Phone Number *</Label>
                  <Controller
                    name="phone"
                    control={control}
                    rules={{
                      required: "Phone number is required",
                      validate: (value) => {
                        if (!value || value.trim().length < 5) {
                          return "Please enter a valid phone number"
                        }
                        return true
                      }
                    }}
                    render={({ field }) => (
                      <PhoneInput
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Enter phone number"
                        className={errors.phone ? "border-destructive" : ""}
                      />
                    )}
                  />
                  {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-medium">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 8, message: "Password must be at least 8 characters" },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
                      }
                    })}
                    placeholder="Create a strong password"
                    className={`h-12 bg-input text-foreground ${errors.password ? "border-destructive" : ""}`}
                  />
                  {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) => {
                        if (value !== watch("password")) {
                          return "Passwords do not match"
                        }
                        return true
                      }
                    })}
                    placeholder="Confirm your password"
                    className={`h-12 bg-input text-foreground ${errors.confirmPassword ? "border-destructive" : ""}`}
                  />
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
                </div>

                {/* ✅ Submit Button with Spinner */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 text-sm md:text-base font-medium flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Continue to Professional Info"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
