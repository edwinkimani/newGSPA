"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, UserCheck, UserX, Mail, Calendar, Menu, Settings, Plus, Edit, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getAllRoles, updateUserRole } from "@/lib/rbac"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { isAdmin as checkAdminRole } from "@/lib/rbac"

interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  membership_fee_paid: boolean
  payment_status: string
  test_completed: boolean
  test_score: number | null
  certificate_issued: boolean
  created_at: string
  role_id: string | null
  role_name?: string
  role_display_name?: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [createUserOpen, setCreateUserOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Create user form data
  const [newUserData, setNewUserData] = useState({
    email: "",
    password: "",
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
    roleId: ""
  })

  useEffect(() => {
    const checkAdminAndLoadUsers = async () => {
      try {
        // Check if admin using role-based access control
        const adminCheck = await checkAdminRole()
        if (!adminCheck) {
          router.push("/dashboard")
          return
        }

        setIsAdmin(true)

        // Get current user info for sidebar
        const userRes = await fetch('/api/auth/user')
        if (userRes.ok) {
          const userData = await userRes.json()
          setUserName(`${userData.profile?.first_name || ''} ${userData.profile?.last_name || ''}`.trim() || 'Admin')
          setUserEmail(userData.email || '')
        }

        // Load roles
        const availableRoles = await getAllRoles()
        setRoles(availableRoles)

        // Load all users from Prisma API (authentication handled server-side)
        const usersResponse = await fetch('/api/users')
        if (usersResponse.ok) {
          const profiles = await usersResponse.json()

          // Transform the data to include role information
          const usersWithRoles = profiles.map((profile: any) => ({
            ...profile,
            role_id: profile.roleId,
            role_name: profile.role?.name || 'practitioner',
            role_display_name: profile.role?.displayName || 'Practitioner'
          }))
          setUsers(usersWithRoles)
        } else {
          console.error('Failed to load users:', await usersResponse.text())
        }

      } catch (error) {
        console.error('Error loading users:', error)
        router.push("/auth/login")
        return
      }

      setIsLoading(false)
    }

    checkAdminAndLoadUsers()
  }, [router])

  const handleRoleChange = async (userId: string, newRoleId: string) => {
    try {
      // Update user role via API (authentication handled server-side)
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roleId: newRoleId })
      })

      if (response.ok) {
        // Refresh the users list (authentication handled server-side)
        const usersResponse = await fetch('/api/users')
        if (usersResponse.ok) {
          const profiles = await usersResponse.json()
          const usersWithRoles = profiles.map((profile: any) => ({
            ...profile,
            role_id: profile.roleId,
            role_name: profile.role?.name || 'practitioner',
            role_display_name: profile.role?.displayName || 'Practitioner'
          }))
          setUsers(usersWithRoles)
        }
      } else {
        console.error('Failed to update role:', await response.text())
      }
    } catch (error) {
      console.error('Error updating role:', error)
    }
  }

  const handleCreateUser = async () => {
    setIsCreating(true)
    try {
      // Create user via API
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUserData)
      })

      if (response.ok) {
        // Refresh the users list
        const usersResponse = await fetch('/api/users')
        if (usersResponse.ok) {
          const profiles = await usersResponse.json()
          const usersWithRoles = profiles.map((profile: any) => ({
            ...profile,
            role_id: profile.roleId,
            role_name: profile.role?.name || 'practitioner',
            role_display_name: profile.role?.displayName || 'Practitioner'
          }))
          setUsers(usersWithRoles)
        }

        // Reset form and close modal
        setNewUserData({
          email: "",
          password: "",
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
          roleId: ""
        })
        setCreateUserOpen(false)
        alert('User created successfully!')
      } else {
        const errorData = await response.json()
        alert(`Failed to create user: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Error creating user. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Refresh the users list
        const usersResponse = await fetch('/api/users')
        if (usersResponse.ok) {
          const profiles = await usersResponse.json()
          const usersWithRoles = profiles.map((profile: any) => ({
            ...profile,
            role_id: profile.roleId,
            role_name: profile.role?.name || 'practitioner',
            role_display_name: profile.role?.displayName || 'Practitioner'
          }))
          setUsers(usersWithRoles)
        }
        alert('User deleted successfully!')
      } else {
        alert('Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user. Please try again.')
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
      <DashboardSidebar
        userRole="admin"
        userName={userName}
        userEmail={userEmail}
      />

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
          <h1 className="text-lg font-semibold">User Management</h1>
          <div className="w-8" /> {/* Spacer */}
        </div>

        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">User Management</h1>
                <p className="text-muted-foreground">
                  Manage registered users and their certification status.
                </p>
              </div>
              <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create User
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                      Create a new user account with complete profile information.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {/* Basic Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={newUserData.firstName}
                          onChange={(e) => setNewUserData(prev => ({ ...prev, firstName: e.target.value }))}
                          placeholder="Enter first name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={newUserData.lastName}
                          onChange={(e) => setNewUserData(prev => ({ ...prev, lastName: e.target.value }))}
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>

                    {/* Account Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUserData.email}
                          onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter email address"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newUserData.password}
                          onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter password"
                        />
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={newUserData.phoneNumber}
                        onChange={(e) => setNewUserData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        placeholder="Enter phone number"
                      />
                    </div>

                    {/* Personal Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={newUserData.dateOfBirth}
                          onChange={(e) => setNewUserData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nationality">Nationality</Label>
                        <Input
                          id="nationality"
                          value={newUserData.nationality}
                          onChange={(e) => setNewUserData(prev => ({ ...prev, nationality: e.target.value }))}
                          placeholder="Enter nationality"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={newUserData.gender}
                        onValueChange={(value) => setNewUserData(prev => ({ ...prev, gender: value }))}
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
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Professional Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="designation">Designation</Label>
                          <Input
                            id="designation"
                            value={newUserData.designation}
                            onChange={(e) => setNewUserData(prev => ({ ...prev, designation: e.target.value }))}
                            placeholder="Enter designation"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="organizationName">Organization</Label>
                          <Input
                            id="organizationName"
                            value={newUserData.organizationName}
                            onChange={(e) => setNewUserData(prev => ({ ...prev, organizationName: e.target.value }))}
                            placeholder="Enter organization name"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Document Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Document Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="documentType">Document Type</Label>
                          <Select
                            value={newUserData.documentType}
                            onValueChange={(value) => setNewUserData(prev => ({ ...prev, documentType: value }))}
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
                          <Label htmlFor="documentNumber">Document Number</Label>
                          <Input
                            id="documentNumber"
                            value={newUserData.documentNumber}
                            onChange={(e) => setNewUserData(prev => ({ ...prev, documentNumber: e.target.value }))}
                            placeholder="Enter document number"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="roleId">Role</Label>
                      <Select
                        value={newUserData.roleId}
                        onValueChange={(value) => setNewUserData(prev => ({ ...prev, roleId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select user role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.display_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCreateUserOpen(false)}
                      disabled={isCreating}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateUser}
                      disabled={isCreating}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isCreating ? 'Creating...' : 'Create User'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {users.filter(u => u.membership_fee_paid).length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Test Completed</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {users.filter(u => u.test_completed).length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Certified</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {users.filter(u => u.certificate_issued).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  A list of all registered users and their current status.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">Name</TableHead>
                        <TableHead className="min-w-[200px]">Email</TableHead>
                        <TableHead className="min-w-[120px]">Role</TableHead>
                        <TableHead className="min-w-[100px]">Membership</TableHead>
                        <TableHead className="min-w-[120px]">Test Status</TableHead>
                        <TableHead className="min-w-[100px]">Certificate</TableHead>
                        <TableHead className="min-w-[120px]">Registered</TableHead>
                        <TableHead className="min-w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.first_name} {user.last_name}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Select
                              value={user.role_id || ""}
                              onValueChange={(value) => handleRoleChange(user.id, value)}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((role) => (
                                  <SelectItem key={role.id} value={role.id}>
                                    {role.display_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.membership_fee_paid ? "default" : "secondary"}>
                              {user.membership_fee_paid ? "Active" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.test_completed ? (
                              <Badge variant="default">
                                Completed ({user.test_score}%)
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Not Taken</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.certificate_issued ? "default" : "secondary"}>
                              {user.certificate_issued ? "Issued" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // TODO: Implement edit user functionality
                                  alert('Edit functionality coming soon')
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
