"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Shield, Plus, Edit, Trash2, Menu, Check, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { isAdmin as checkAdminRole } from "@/lib/rbac"

interface Role {
  id: string
  name: string
  displayName: string
  description: string | null
  isSystem: boolean
  profiles: any[]
  permissions: any[]
  _count: {
    profiles: number
    permissions: number
  }
}

interface Permission {
  id: string
  name: string
  displayName: string
  description: string | null
  resource: string
  action: string
  roles: any[]
  _count: {
    roles: number
  }
}

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Modal states
  const [createRoleOpen, setCreateRoleOpen] = useState(false)
  const [createPermissionOpen, setCreatePermissionOpen] = useState(false)
  const [editRoleOpen, setEditRoleOpen] = useState(false)
  const [editPermissionOpen, setEditPermissionOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null)

  // Form states
  const [roleForm, setRoleForm] = useState({
    name: "",
    displayName: "",
    description: ""
  })

  const [permissionForm, setPermissionForm] = useState({
    name: "",
    displayName: "",
    description: "",
    resource: "",
    action: ""
  })

  const router = useRouter()

  useEffect(() => {
    const checkAdminAndLoadData = async () => {
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

        // Load roles and permissions
        await loadRolesAndPermissions()

      } catch (error) {
        console.error('Error loading data:', error)
        router.push("/auth/login")
        return
      }

      setIsLoading(false)
    }

    checkAdminAndLoadData()
  }, [router])

  const loadRolesAndPermissions = async () => {
    try {
      const [rolesResponse, permissionsResponse] = await Promise.all([
        fetch('/api/admin/roles'),
        fetch('/api/admin/permissions')
      ])

      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json()
        setRoles(rolesData)
      }

      if (permissionsResponse.ok) {
        const permissionsData = await permissionsResponse.json()
        setPermissions(permissionsData)
      }
    } catch (error) {
      console.error('Error loading roles and permissions:', error)
    }
  }

  const handleCreateRole = async () => {
    try {
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roleForm)
      })

      if (response.ok) {
        await loadRolesAndPermissions()
        setCreateRoleOpen(false)
        setRoleForm({ name: "", displayName: "", description: "" })
        alert('Role created successfully!')
      } else {
        const errorData = await response.json()
        alert(`Failed to create role: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating role:', error)
      alert('Error creating role. Please try again.')
    }
  }

  const handleCreatePermission = async () => {
    try {
      const response = await fetch('/api/admin/permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(permissionForm)
      })

      if (response.ok) {
        await loadRolesAndPermissions()
        setCreatePermissionOpen(false)
        setPermissionForm({ name: "", displayName: "", description: "", resource: "", action: "" })
        alert('Permission created successfully!')
      } else {
        const errorData = await response.json()
        alert(`Failed to create permission: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating permission:', error)
      alert('Error creating permission. Please try again.')
    }
  }

  const handleUpdateRole = async () => {
    if (!selectedRole) return

    try {
      const response = await fetch(`/api/admin/roles/${selectedRole.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roleForm)
      })

      if (response.ok) {
        await loadRolesAndPermissions()
        setEditRoleOpen(false)
        setSelectedRole(null)
        setRoleForm({ name: "", displayName: "", description: "" })
        alert('Role updated successfully!')
      } else {
        const errorData = await response.json()
        alert(`Failed to update role: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Error updating role. Please try again.')
    }
  }

  const handleUpdatePermission = async () => {
    if (!selectedPermission) return

    try {
      const response = await fetch(`/api/admin/permissions/${selectedPermission.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(permissionForm)
      })

      if (response.ok) {
        await loadRolesAndPermissions()
        setEditPermissionOpen(false)
        setSelectedPermission(null)
        setPermissionForm({ name: "", displayName: "", description: "", resource: "", action: "" })
        alert('Permission updated successfully!')
      } else {
        const errorData = await response.json()
        alert(`Failed to update permission: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating permission:', error)
      alert('Error updating permission. Please try again.')
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadRolesAndPermissions()
        alert('Role deleted successfully!')
      } else {
        alert('Failed to delete role')
      }
    } catch (error) {
      console.error('Error deleting role:', error)
      alert('Error deleting role. Please try again.')
    }
  }

  const handleDeletePermission = async (permissionId: string) => {
    if (!confirm('Are you sure you want to delete this permission? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/permissions/${permissionId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadRolesAndPermissions()
        alert('Permission deleted successfully!')
      } else {
        alert('Failed to delete permission')
      }
    } catch (error) {
      console.error('Error deleting permission:', error)
      alert('Error deleting permission. Please try again.')
    }
  }

  const handleTogglePermission = async (roleId: string, permissionId: string, hasPermission: boolean) => {
    try {
      if (hasPermission) {
        // Remove permission from role
        const response = await fetch(`/api/admin/roles/${roleId}/permissions`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ permissionId })
        })

        if (response.ok) {
          await loadRolesAndPermissions()
        }
      } else {
        // Add permission to role
        const response = await fetch(`/api/admin/roles/${roleId}/permissions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ permissionId })
        })

        if (response.ok) {
          await loadRolesAndPermissions()
        }
      }
    } catch (error) {
      console.error('Error toggling permission:', error)
    }
  }

  const openEditRole = (role: Role) => {
    setSelectedRole(role)
    setRoleForm({
      name: role.name,
      displayName: role.displayName,
      description: role.description || ""
    })
    setEditRoleOpen(true)
  }

  const openEditPermission = (permission: Permission) => {
    setSelectedPermission(permission)
    setPermissionForm({
      name: permission.name,
      displayName: permission.displayName,
      description: permission.description || "",
      resource: permission.resource,
      action: permission.action
    })
    setEditPermissionOpen(true)
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
          <h1 className="text-lg font-semibold">Roles & Permissions</h1>
          <div className="w-8" />
        </div>

        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Roles & Permissions Management</h1>
              <p className="text-muted-foreground">
                Manage user roles and their associated permissions.
              </p>
            </div>

            <Tabs defaultValue="roles" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="roles">Roles</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
                <TabsTrigger value="assignments">Role Assignments</TabsTrigger>
              </TabsList>

              {/* Roles Tab */}
              <TabsContent value="roles" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>User Roles</CardTitle>
                      <CardDescription>
                        Define and manage user roles in the system.
                      </CardDescription>
                    </div>
                    <Dialog open={createRoleOpen} onOpenChange={setCreateRoleOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Role
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Role</DialogTitle>
                          <DialogDescription>
                            Add a new role to the system.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="roleName">Role Name</Label>
                            <Input
                              id="roleName"
                              value={roleForm.name}
                              onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="e.g., editor, moderator"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="roleDisplayName">Display Name</Label>
                            <Input
                              id="roleDisplayName"
                              value={roleForm.displayName}
                              onChange={(e) => setRoleForm(prev => ({ ...prev, displayName: e.target.value }))}
                              placeholder="e.g., Editor, Moderator"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="roleDescription">Description</Label>
                            <Textarea
                              id="roleDescription"
                              value={roleForm.description}
                              onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Describe the role's purpose"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setCreateRoleOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleCreateRole}>
                            Create Role
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Display Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Users</TableHead>
                            <TableHead>Permissions</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {roles.map((role) => (
                            <TableRow key={role.id}>
                              <TableCell className="font-medium">{role.name}</TableCell>
                              <TableCell>{role.displayName}</TableCell>
                              <TableCell>{role.description}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {role._count.profiles} users
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {role._count.permissions} permissions
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditRole(role)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  {!role.isSystem && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteRole(role.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Permissions Tab */}
              <TabsContent value="permissions" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Permissions</CardTitle>
                      <CardDescription>
                        Define and manage system permissions.
                      </CardDescription>
                    </div>
                    <Dialog open={createPermissionOpen} onOpenChange={setCreatePermissionOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Permission
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Permission</DialogTitle>
                          <DialogDescription>
                            Add a new permission to the system.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="permissionName">Permission Name</Label>
                              <Input
                                id="permissionName"
                                value={permissionForm.name}
                                onChange={(e) => setPermissionForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g., create_posts"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="permissionDisplayName">Display Name</Label>
                              <Input
                                id="permissionDisplayName"
                                value={permissionForm.displayName}
                                onChange={(e) => setPermissionForm(prev => ({ ...prev, displayName: e.target.value }))}
                                placeholder="e.g., Create Posts"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="permissionDescription">Description</Label>
                            <Textarea
                              id="permissionDescription"
                              value={permissionForm.description}
                              onChange={(e) => setPermissionForm(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Describe what this permission allows"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="resource">Resource</Label>
                              <Input
                                id="resource"
                                value={permissionForm.resource}
                                onChange={(e) => setPermissionForm(prev => ({ ...prev, resource: e.target.value }))}
                                placeholder="e.g., post, user, file"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="action">Action</Label>
                              <Input
                                id="action"
                                value={permissionForm.action}
                                onChange={(e) => setPermissionForm(prev => ({ ...prev, action: e.target.value }))}
                                placeholder="e.g., create, read, update, delete"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setCreatePermissionOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleCreatePermission}>
                            Create Permission
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Display Name</TableHead>
                            <TableHead>Resource</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Roles</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {permissions.map((permission) => (
                            <TableRow key={permission.id}>
                              <TableCell className="font-medium">{permission.name}</TableCell>
                              <TableCell>{permission.displayName}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{permission.resource}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">{permission.action}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {permission._count.roles} roles
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openEditPermission(permission)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeletePermission(permission.id)}
                                    className="text-red-600 hover:text-red-700"
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
              </TabsContent>

              {/* Role Assignments Tab */}
              <TabsContent value="assignments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Role-Permission Assignments</CardTitle>
                    <CardDescription>
                      Assign permissions to roles by clicking the checkboxes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[200px] sticky left-0 bg-background z-10 border-r-2 border-border shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                              Role / Permission
                            </TableHead>
                            {permissions.map((permission) => (
                              <TableHead key={permission.id} className="min-w-[120px] text-center">
                                {permission.displayName}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {roles.map((role) => (
                            <TableRow key={role.id}>
                              <TableCell className="font-medium sticky left-0 bg-background z-10 border-r-2 border-border shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                                {role.displayName}
                              </TableCell>
                              {permissions.map((permission) => {
                                const hasPermission = role.permissions.some(rp => rp.permissionId === permission.id)
                                return (
                                  <TableCell key={permission.id} className="text-center">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleTogglePermission(role.id, permission.id, hasPermission)}
                                      className="h-8 w-8 p-0"
                                    >
                                      {hasPermission ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <X className="h-4 w-4 text-gray-400" />
                                      )}
                                    </Button>
                                  </TableCell>
                                )
                              })}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Edit Role Dialog */}
      <Dialog open={editRoleOpen} onOpenChange={setEditRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editRoleDisplayName">Display Name</Label>
              <Input
                id="editRoleDisplayName"
                value={roleForm.displayName}
                onChange={(e) => setRoleForm(prev => ({ ...prev, displayName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editRoleDescription">Description</Label>
              <Textarea
                id="editRoleDescription"
                value={roleForm.description}
                onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setEditRoleOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateRole}>
              Update Role
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Permission Dialog */}
      <Dialog open={editPermissionOpen} onOpenChange={setEditPermissionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Permission</DialogTitle>
            <DialogDescription>
              Update permission information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editPermissionDisplayName">Display Name</Label>
                <Input
                  id="editPermissionDisplayName"
                  value={permissionForm.displayName}
                  onChange={(e) => setPermissionForm(prev => ({ ...prev, displayName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPermissionResource">Resource</Label>
                <Input
                  id="editPermissionResource"
                  value={permissionForm.resource}
                  onChange={(e) => setPermissionForm(prev => ({ ...prev, resource: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editPermissionAction">Action</Label>
                <Input
                  id="editPermissionAction"
                  value={permissionForm.action}
                  onChange={(e) => setPermissionForm(prev => ({ ...prev, action: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPermissionDescription">Description</Label>
              <Textarea
                id="editPermissionDescription"
                value={permissionForm.description}
                onChange={(e) => setPermissionForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setEditPermissionOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdatePermission}>
              Update Permission
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
