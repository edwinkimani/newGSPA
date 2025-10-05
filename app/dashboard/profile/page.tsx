"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Save, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone_number: string
  date_of_birth: string
  nationality: string
  gender: string
  designation: string
  organization_name: string
  document_type: string
  document_number: string
  passport_photo_url: string | null
  signature_data: string | null
  membership_fee_paid: boolean
  payment_status: string
  test_completed: boolean
  certificate_issued: boolean
  created_at: string
}

// Helper function to check if user has uploaded required documents
const hasUploadedPhoto = (profile: UserProfile | null): boolean => {
  return profile?.passport_photo_url !== null && profile?.passport_photo_url !== undefined && profile?.passport_photo_url.trim() !== ""
}

const hasUploadedSignature = (profile: UserProfile | null): boolean => {
  return profile?.signature_data !== null && profile?.signature_data !== undefined && profile?.signature_data.trim() !== ""
}

const hasUploadedAllDocuments = (profile: UserProfile | null): boolean => {
  return hasUploadedPhoto(profile) && hasUploadedSignature(profile)
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    date_of_birth: "",
    nationality: "",
    gender: "",
    designation: "",
    organization_name: "",
    document_type: "",
    document_number: "",
  })

  useEffect(() => {
    const getUserProfile = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push("/auth/login")
        return
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single()

      if (profileError || !profile) {
        router.push("/register")
        return
      }

      setUser(profile)
      setFormData({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone_number: profile.phone_number || "",
        date_of_birth: profile.date_of_birth || "",
        nationality: profile.nationality || "",
        gender: profile.gender || "",
        designation: profile.designation || "",
        organization_name: profile.organization_name || "",
        document_type: profile.document_type || "",
        document_number: profile.document_number || "",
      })

      setIsLoading(false)
    }

    getUserProfile()
  }, [supabase, router])

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number,
          date_of_birth: formData.date_of_birth,
          nationality: formData.nationality,
          gender: formData.gender,
          designation: formData.designation,
          organization_name: formData.organization_name,
          document_type: formData.document_type,
          document_number: formData.document_number,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (updateError) throw updateError

      // Update local state
      setUser(prev => prev ? { ...prev, ...formData } : null)
      setSuccess(true)
      setIsEditing(false)

      setTimeout(() => setSuccess(false), 3000)
    } catch (error: any) {
      setError(error.message || "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number || "",
        date_of_birth: user.date_of_birth || "",
        nationality: user.nationality || "",
        gender: user.gender || "",
        designation: user.designation || "",
        organization_name: user.organization_name || "",
        document_type: user.document_type || "",
        document_number: user.document_number || "",
      })
    }
    setIsEditing(false)
    setError(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-8">
        <Alert variant="destructive">
          <X className="h-4 w-4" />
          <AlertDescription>Please complete your registration first.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Profile Information</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage your personal and professional information.
          </p>
        </div>

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              Profile updated successfully!
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Profile Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {user.first_name} {user.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{user.designation}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{user.organization_name}</span>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Membership Status</span>
                  <Badge variant={user.membership_fee_paid ? "default" : "secondary"}>
                    {user.membership_fee_paid ? "Active" : "Pending"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Documents Status</span>
                  <div className="flex gap-2">
                    <Badge variant={hasUploadedPhoto(user) ? "default" : "secondary"} className="text-xs">
                      Photo {hasUploadedPhoto(user) ? "✓" : "✗"}
                    </Badge>
                    <Badge variant={hasUploadedSignature(user) ? "default" : "secondary"} className="text-xs">
                      Signature {hasUploadedSignature(user) ? "✓" : "✗"}
                    </Badge>
                  </div>
                </div>
                {!hasUploadedAllDocuments(user) && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                    <strong>Note:</strong> Complete document uploads are required for certification. Contact support if you need to re-upload documents.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details and contact information.
                    </CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} size="sm" className="self-start">
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2 self-start">
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isSaving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save
                      </Button>
                      <Button
                        onClick={handleCancel}
                        disabled={isSaving}
                        variant="outline"
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      value={formData.nationality}
                      onChange={(e) => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Professional Information */}
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="designation">Designation</Label>
                      <Input
                        id="designation"
                        value={formData.designation}
                        onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization</Label>
                      <Input
                        id="organization"
                        value={formData.organization_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, organization_name: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                {/* Document Information */}
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Document Information</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="document_type">Document Type</Label>
                      <Select
                        value={formData.document_type}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, document_type: value }))}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="passport">Passport</SelectItem>
                          <SelectItem value="national_id">National ID</SelectItem>
                          <SelectItem value="drivers_license">Driver's License</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="document_number">Document Number</Label>
                      <Input
                        id="document_number"
                        value={formData.document_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, document_number: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                {/* Uploaded Documents */}
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Uploaded Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Passport Photo</Label>
                      {hasUploadedPhoto(user) ? (
                        <div className="border rounded-lg p-2 bg-muted">
                          <img
                            src={user.passport_photo_url!}
                            alt="Passport Photo"
                            className="w-full h-32 object-cover rounded"
                          />
                          <p className="text-xs text-green-600 mt-1 font-medium">✓ Uploaded successfully</p>
                        </div>
                      ) : (
                        <div className="border rounded-lg p-4 bg-red-50 border-red-200 text-center">
                          <p className="text-sm text-red-600 font-medium">No photo uploaded</p>
                          <p className="text-xs text-red-500 mt-1">Upload required for certification</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Digital Signature</Label>
                      {hasUploadedSignature(user) ? (
                        <div className="border rounded-lg p-2 bg-muted">
                          <img
                            src={user.signature_data!}
                            alt="Digital Signature"
                            className="w-full h-16 object-contain rounded bg-white"
                          />
                          <p className="text-xs text-green-600 mt-1 font-medium">✓ Uploaded successfully</p>
                        </div>
                      ) : (
                        <div className="border rounded-lg p-4 bg-red-50 border-red-200 text-center">
                          <p className="text-sm text-red-600 font-medium">No signature uploaded</p>
                          <p className="text-xs text-red-500 mt-1">Upload required for certification</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
