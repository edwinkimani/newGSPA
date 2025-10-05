"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Save, Menu, Eye, EyeOff, X } from "lucide-react"
import { useRouter } from "next/navigation"
import countriesData from "@/lib/countries.json"

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

export default function AdminProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [countries, setCountries] = useState<
    { name: string; code: string; flag: string }[]
  >([])
  const [loadingCountries, setLoadingCountries] = useState(true)
  const router = useRouter()

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

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  useEffect(() => {
    const checkAdminAndLoadProfile = async () => {
      try {
        const userRes = await fetch('/api/auth/user')
        if (!userRes.ok) {
          router.push('/auth/login')
          return
        }
        const data = await userRes.json()
        const roleName = data?.profile?.role?.name
        if (roleName !== 'admin') {
          router.push('/dashboard')
          return
        }
        setIsAdmin(true)
        setUserName(`${data?.profile?.first_name || ''} ${data?.profile?.last_name || ''}`.trim() || 'Admin')
        setUserEmail(data?.email || '')

        // Get user profile from Prisma API
        const profileResponse = await fetch(`/api/profiles/${data.id}`)
        if (!profileResponse.ok) {
          router.push("/register")
          return
        }

        const profile = await profileResponse.json()

        setUser({
          ...profile,
          passport_photo_url: profile.passportPhotoUrl,
          signature_data: profile.signatureData
        })
        setFormData({
          first_name: profile.firstName,
          last_name: profile.lastName,
          phone_number: profile.phoneNumber || "",
          date_of_birth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : "",
          nationality: profile.nationality || "",
          gender: profile.gender ? profile.gender.toLowerCase() : "",
          designation: profile.designation || "",
          organization_name: profile.organizationName || "",
          document_type: profile.documentType ? profile.documentType.toLowerCase() : "",
          document_number: profile.documentNumber || "",
        })

        setIsLoading(false)
      } catch (err) {
        router.push('/auth/login')
        return
      }
    }

    checkAdminAndLoadProfile()
  }, [router])

  // Load countries data
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

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      // Update profile data via Prisma API
      const profileResponse = await fetch(`/api/profiles/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number,
          date_of_birth: formData.date_of_birth,
          nationality: formData.nationality,
          gender: formData.gender ? formData.gender.toUpperCase() : undefined,
          designation: formData.designation,
          organization_name: formData.organization_name,
          document_type: formData.document_type ? formData.document_type.toUpperCase() : undefined,
          document_number: formData.document_number
        })
      })

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      // Password updates are handled separately via the "Update Password" button

      // Update local state
      setUser(prev => prev ? { ...prev, ...formData } : null)
      setSuccess(true)
      setIsEditing(false)
      setShowPasswordFields(false)

      setTimeout(() => setSuccess(false), 3000)

      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })

    } catch (error: any) {
      console.error('Error updating profile:', error)
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
        date_of_birth: user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : "",
        nationality: user.nationality || "",
        gender: user.gender ? user.gender.toLowerCase() : "",
        designation: user.designation || "",
        organization_name: user.organization_name || "",
        document_type: user.document_type ? user.document_type.toLowerCase() : "",
        document_number: user.document_number || "",
      })
    }
    setIsEditing(false)
    setShowPasswordFields(false)
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    })
    setError(null)
  }

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
  }

  const handlePasswordUpdate = async () => {
    if (!user) return

    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate password fields
      if (!passwordData.currentPassword) {
        throw new Error('Current password is required')
      }
      if (!passwordData.newPassword) {
        throw new Error('New password is required')
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('New passwords do not match')
      }

      // Update password via API
      const passwordResponse = await fetch('/api/auth/user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      if (!passwordResponse.ok) {
        const errorData = await passwordResponse.json()
        throw new Error(errorData.error || 'Failed to update password')
      }

      setSuccess(true)
      setShowPasswordFields(false)

      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })

      setTimeout(() => setSuccess(false), 3000)

    } catch (error: any) {
      console.error('Error updating password:', error)
      setError(error.message || "Failed to update password")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Mobile Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 md:hidden
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <DashboardSidebar
          userRole="admin"
          userName={userName}
          userEmail={userEmail}
          isMobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <DashboardSidebar
          userRole="admin"
          userName={userName}
          userEmail={userEmail}
        />
      </div>

      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden bg-background border-b border-border p-4 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileMenuOpen(true)}
            className="border-border hover:bg-muted"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Profile</h1>
          {isEditing && (
            <Button onClick={handleSave} disabled={isSaving} size="sm">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          )}
        </div>

        <div className="p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Admin Profile Information</h1>
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
                        {user?.first_name} {user?.last_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Joined {user ? new Date(user.created_at).toLocaleDateString() : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>{user?.designation}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{user?.organization_name}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Membership Status</span>
                      <Badge variant={user?.membership_fee_paid ? "default" : "secondary"}>
                        {user?.membership_fee_paid ? "Active" : "Pending"}
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
                          onChange={(e) => handleFormChange('first_name', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input
                          id="last_name"
                          value={formData.last_name}
                          onChange={(e) => handleFormChange('last_name', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone_number}
                        onChange={(e) => handleFormChange('phone_number', e.target.value)}
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
                          onChange={(e) => handleFormChange('date_of_birth', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nationality">Nationality</Label>
                        <Select
                          value={formData.nationality}
                          onValueChange={(value) => handleFormChange('nationality', value)}
                          disabled={!isEditing || loadingCountries}
                        >
                          <SelectTrigger>
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
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => handleFormChange('gender', value)}
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
                            onChange={(e) => handleFormChange('designation', e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="organization">Organization</Label>
                          <Input
                            id="organization"
                            value={formData.organization_name}
                            onChange={(e) => handleFormChange('organization_name', e.target.value)}
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
                            onValueChange={(value) => handleFormChange('document_type', value)}
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
                            onChange={(e) => handleFormChange('document_number', e.target.value)}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Password Change */}
                    <div className="pt-6 border-t">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Change Password</h3>
                        {!showPasswordFields ? (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => setShowPasswordFields(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Update Password
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowPasswordFields(false)
                              setPasswordData({
                                currentPassword: "",
                                newPassword: "",
                                confirmPassword: ""
                              })
                              setError(null)
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>

                      {showPasswordFields && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input
                              id="currentPassword"
                              type="password"
                              value={passwordData.currentPassword}
                              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                              placeholder="Enter current password"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <div className="relative">
                              <Input
                                id="newPassword"
                                type={showPassword ? "text" : "password"}
                                value={passwordData.newPassword}
                                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                                placeholder="Enter new password"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              value={passwordData.confirmPassword}
                              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                              placeholder="Confirm new password"
                            />
                          </div>
                          {passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                            <p className="text-sm text-red-600">Passwords do not match</p>
                          )}
                          <div className="pt-2">
                            <Button
                              type="button"
                              onClick={handlePasswordUpdate}
                              disabled={isSaving}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {isSaving ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                  Updating...
                                </>
                              ) : (
                                'Update Password'
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
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
                                src={user?.passport_photo_url ?? ""}
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
                                src={user?.signature_data ?? ""}
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
      </main>
    </div>
  )
}
