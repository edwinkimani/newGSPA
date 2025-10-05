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
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Save, X, Menu } from "lucide-react"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  dateOfBirth: string
  nationality: string
  gender: string
  designation: string
  organizationName: string
  documentType: string
  documentNumber: string
  passportPhotoUrl: string | null
  signatureData: string | null
  membershipFeePaid: boolean
  paymentStatus: string
  testCompleted: boolean
  certificateIssued: boolean
  createdAt: string
  role?: {
    name: string
    displayName: string
  }
}

// Helper function to check if user has uploaded required documents
const hasUploadedPhoto = (profile: UserProfile | null): boolean => {
  return profile?.passportPhotoUrl !== null && profile?.passportPhotoUrl !== undefined && profile?.passportPhotoUrl.trim() !== ""
}

const hasUploadedSignature = (profile: UserProfile | null): boolean => {
  return profile?.signatureData !== null && profile?.signatureData !== undefined && profile?.signatureData.trim() !== ""
}

const hasUploadedAllDocuments = (profile: UserProfile | null): boolean => {
  return hasUploadedPhoto(profile) && hasUploadedSignature(profile)
}

export default function MasterPractitionerProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isMasterPractitioner, setIsMasterPractitioner] = useState(false)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    dateOfBirth: "",
    nationality: "",
    gender: "",
    designation: "",
    organizationName: "",
    documentType: "",
    documentNumber: "",
  })

  useEffect(() => {
    const checkMasterPractitionerAndLoadData = async () => {
      try {
        setIsLoading(true)

        // Check authentication via API
        const authRes = await fetch('/api/auth/user')
        if (authRes.status === 401) {
          router.push('/auth/login')
          return
        }

        if (!authRes.ok) {
          throw new Error('Failed to fetch user data')
        }

        const authData = await authRes.json()
        const profile = authData.profile

        if (!profile) {
          router.push('/register')
          return
        }

        // Check if master practitioner - role info should be included in profile
        if (!profile.roleId || profile.role?.name !== 'master_practitioner') {
          setIsMasterPractitioner(false)
          setIsLoading(false)
          return
        }

        setIsMasterPractitioner(true)
        setUserName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Master Practitioner')
        setUserEmail(profile.email || '')

        // Set user data
        setUser(profile)
        setFormData({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phoneNumber: profile.phoneNumber || "",
          dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : "",
          nationality: profile.nationality || "",
          gender: profile.gender || "",
          designation: profile.designation || "",
          organizationName: profile.organizationName || "",
          documentType: profile.documentType || "",
          documentNumber: profile.documentNumber || "",
        })

      } catch (error) {
        console.error('Error loading data:', error)
        setIsMasterPractitioner(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkMasterPractitionerAndLoadData()
  }, [router])

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch(`/api/profiles/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

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
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber || "",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
        nationality: user.nationality || "",
        gender: user.gender || "",
        designation: user.designation || "",
        organizationName: user.organizationName || "",
        documentType: user.documentType || "",
        documentNumber: user.documentNumber || "",
      })
    }
    setIsEditing(false)
    setError(null)
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

  if (!isMasterPractitioner) {
    return (
      <div className="min-h-screen flex">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
            <Button
              onClick={() => router.push('/dashboard')}
              className="mt-4"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex">
        <div className="flex-1 flex items-center justify-center">
          <Alert variant="destructive">
            <X className="h-4 w-4" />
            <AlertDescription>Please complete your registration first.</AlertDescription>
          </Alert>
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
          userRole="master_practitioner"
          userName={userName}
          userEmail={userEmail}
          isMobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <DashboardSidebar
          userRole="master_practitioner"
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
          <h1 className="text-lg font-semibold">Master Practitioner Profile</h1>
          <div className="w-8" />
        </div>

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
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span>{user.designation}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{user.organizationName}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Membership Status</span>
                      <Badge variant={user.membershipFeePaid ? "default" : "secondary"}>
                        {user.membershipFeePaid ? "Active" : "Pending"}
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
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
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
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
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
                          <Label htmlFor="organizationName">Organization</Label>
                          <Input
                            id="organizationName"
                            value={formData.organizationName}
                            onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
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
                          <Label htmlFor="documentType">Document Type</Label>
                          <Select
                            value={formData.documentType}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, documentType: value }))}
                            disabled={!isEditing}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PASSPORT">Passport</SelectItem>
                              <SelectItem value="NATIONAL_ID">National ID</SelectItem>
                              <SelectItem value="DRIVERS_LICENSE">Driver's License</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="documentNumber">Document Number</Label>
                          <Input
                            id="documentNumber"
                            value={formData.documentNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, documentNumber: e.target.value }))}
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
                                src={user.passportPhotoUrl!}
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
                                src={user.signatureData!}
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
