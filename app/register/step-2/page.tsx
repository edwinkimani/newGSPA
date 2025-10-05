"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import countriesData from "@/lib/countries.json"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RegistrationProgress } from "@/components/registration-progress"
import { Loader2 } from "lucide-react"

interface Step2Form {
  nationality: string
  gender: string
  dateOfBirth: string
  designation: string
  organization: string
}

const stepTitles = ["Personal Info", "Professional Info", "Documents", "Review"]

export default function RegisterStep2() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [countries, setCountries] = useState<
    { name: string; code: string; flag: string }[]
  >([])
  const [loadingCountries, setLoadingCountries] = useState(true)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Step2Form>({
    mode: "onSubmit",
  })

  // Load saved data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("registration-step-2")
    if (saved) {
      const data = JSON.parse(saved)
      Object.keys(data).forEach((key) => {
        setValue(key as keyof Step2Form, data[key])
      })
    }
  }, [setValue])

  // Fetch countries from REST API with fallback
  useEffect(() => {
  async function loadCountries() {
    try {
      const formatted = countriesData
        .map((c: any) => ({
          name: c.name.common,
          code: c.cca2,
          flag: c.flags?.svg || c.flags?.png || "",
        }))
        .sort((a: any, b: any) => a.name.localeCompare(b.name))

      setCountries(formatted)
    } catch (err) {
      console.error("Error loading countries:", err)
    } finally {
      setLoadingCountries(false)
    }
  }
  loadCountries()
}, [])


  // Auto-save form data
  const formData = watch()
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem("registration-step-2", JSON.stringify(formData))
    }, 1000)
    return () => clearTimeout(timeoutId)
  }, [formData])

  const onSubmit = async (data: Step2Form) => {
    setIsLoading(true)
    try {
      localStorage.setItem("registration-step-2", JSON.stringify(data))
      await new Promise((resolve) => setTimeout(resolve, 1000)) // simulate processing
      router.push("/register/step-3")
    } finally {
      setIsLoading(false)
    }
  }

  const goBack = () => {
    router.push("/register/step-1")
  }

  return (
    <div className="min-h-screen bg-background">
      <RegistrationProgress
        currentStep={2}
        totalSteps={4}
        stepTitles={stepTitles}
      />

      <div className="py-8 px-4 sm:py-12">
        <div className="max-w-md sm:max-w-lg md:max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-6 md:pb-8">
              <CardTitle className="text-2xl md:text-3xl font-bold">
                Professional Information
              </CardTitle>
              <CardDescription className="text-base md:text-lg">
                Tell us about your background and role
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0 px-4 sm:px-6">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 sm:space-y-6 md:space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Nationality */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Nationality *</Label>
                    <Controller
                      name="nationality"
                      control={control}
                      rules={{ required: "Please select your nationality" }}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={loadingCountries}
                        >
                          <SelectTrigger
                            className={`h-12 bg-input ${errors.nationality ? "border-destructive" : ""
                              }`}
                          >
                            <SelectValue
                              placeholder={
                                loadingCountries
                                  ? "Loading countries..."
                                  : "Select nationality"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((c) => (
                              <SelectItem
                                key={c.code}
                                value={c.code.toLowerCase()}
                              >
                                <div className="flex items-center gap-2">
                                  {c.flag.startsWith('http') ? (
                                    <img
                                      src={c.flag}
                                      alt={`${c.name} flag`}
                                      className="w-5 h-4 object-cover rounded-sm"
                                    />
                                  ) : (
                                    <span className="text-lg">{c.flag}</span>
                                  )}
                                  <span>{c.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.nationality && (
                      <p className="text-sm text-destructive">
                        {errors.nationality.message}
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Gender *</Label>
                    <Controller
                      name="gender"
                      control={control}
                      rules={{ required: "Please select your gender" }}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger
                            className={`h-12 bg-input ${errors.gender ? "border-destructive" : ""
                              }`}
                          >
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.gender && (
                      <p className="text-sm text-destructive">
                        {errors.gender.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="space-y-3">
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                    Date of Birth *
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...register("dateOfBirth", {
                      required: "Date of birth is required",
                    })}
                    className={`h-12 bg-input text-foreground ${errors.dateOfBirth ? "border-destructive" : ""
                      }`}
                    max={new Date(
                      new Date().setFullYear(new Date().getFullYear() - 18)
                    )
                      .toISOString()
                      .split("T")[0]}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-destructive">
                      {errors.dateOfBirth.message}
                    </p>
                  )}
                </div>

                {/* Designation */}
                <div className="space-y-3">
                  <Label htmlFor="designation" className="text-sm font-medium">
                    Designation/Role *
                  </Label>
                  <Input
                    id="designation"
                    {...register("designation", {
                      required: "Designation is required",
                      minLength: {
                        value: 2,
                        message: "Designation must be at least 2 characters",
                      },
                    })}
                    placeholder="Security Manager"
                    className={`h-12 bg-input text-foreground ${errors.designation ? "border-destructive" : ""
                      }`}
                  />
                  {errors.designation && (
                    <p className="text-sm text-destructive">
                      {errors.designation.message}
                    </p>
                  )}
                </div>

                {/* Organization */}
                <div className="space-y-3">
                  <Label htmlFor="organization" className="text-sm font-medium">
                    Organization *
                  </Label>
                  <Input
                    id="organization"
                    {...register("organization", {
                      required: "Organization is required",
                      minLength: {
                        value: 2,
                        message: "Organization must be at least 2 characters",
                      },
                    })}
                    placeholder="ABC Corporation"
                    className={`h-12 bg-input text-foreground ${errors.organization ? "border-destructive" : ""
                      }`}
                  />
                  {errors.organization && (
                    <p className="text-sm text-destructive">
                      {errors.organization.message}
                    </p>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 md:pt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goBack}
                    className="px-6 md:px-8"
                  >
                    Previous
                  </Button>

                  <Button
                    type="submit"
                    className="px-6 md:px-8 flex items-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Continue to Documents"
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
