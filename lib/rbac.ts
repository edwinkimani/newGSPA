export const roles = {
  admin: 'admin',
  user: 'user',
} as const;

export type Role = typeof roles[keyof typeof roles];

export const hasRole = (userRoles: Role[], requiredRole: Role): boolean => {
  return userRoles.includes(requiredRole);
};

export type UserRole = 'admin' | 'master_practitioner' | 'practitioner'

export interface RoleInfo {
  id: string
  name: UserRole
  display_name: string
  description: string
}

export interface Permission {
  id: string
  name: string
  display_name: string
  resource: string
  action: string
}

/**
 * Get the current user's role
 * This implementation calls the server REST API `/api/auth/user` which returns the profile with role.
 * Falls back to 'practitioner' when unavailable.
 */
export async function getCurrentUserRole(): Promise<UserRole> {
  try {
    const headers: any = {}
    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null
      if (token) headers['Authorization'] = `Bearer ${token}`
    } catch {}

    const res = await fetch('/api/auth/user', { headers })
    if (!res.ok) return 'practitioner'
    const data = await res.json()
    const roleName = data?.profile?.role?.name
    if (!roleName) return 'practitioner'
    if (roleName === 'admin') return 'admin'
    if (roleName === 'master_practitioner') return 'master_practitioner'
    return 'practitioner'
  } catch (error) {
    console.error('Error getting user role:', error)
    return 'practitioner'
  }
}

/**
 * Check if current user has a specific role
 */
export async function hasRoleAsync(requiredRole: UserRole): Promise<boolean> {
  const userRole = await getCurrentUserRole()

  // Role hierarchy: admin > master_practitioner > practitioner
  const roleHierarchy = {
    admin: 3,
    master_practitioner: 2,
    practitioner: 1
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

/**
 * Check if current user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  return hasRoleAsync('admin')
}

/**
 * Check if current user has master practitioner role or higher
 */
export async function isMasterPractitioner(): Promise<boolean> {
  return hasRoleAsync('master_practitioner')
}

/**
 * Check if current user has practitioner role or higher
 */
export async function isPractitioner(): Promise<boolean> {
  return hasRoleAsync('practitioner')
}

/**
 * Get all available roles from server
 */
export async function getAllRoles(): Promise<RoleInfo[]> {
  try {
    const res = await fetch('/api/roles')
    if (!res.ok) return []
    const data = await res.json()
    return data || []
  } catch (error) {
    console.error('Error getting roles:', error)
    return []
  }
}

/**
 * Update a user's role (admin only)
 */
export async function updateUserRole(userId: string, roleId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleId })
    })
    return res.ok
  } catch (error) {
    console.error('Error updating user role:', error)
    return false
  }
}

/**
 * Get role-based navigation items
 */
export function getNavigationItems(userRole: UserRole) {
  const baseItems = [
    { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/dashboard/profile', label: 'Profile', icon: 'User' },
  ]

  const masterPractitionerBaseItems = [
    { href: '/master-practitioner', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/master-practitioner/profile', label: 'Profile', icon: 'User' },
  ]

  const practitionerItems = [
    // Use the actual route for user modules list
    { href: '/dashboard/my-modules', label: 'Modules', icon: 'BookOpen' },
    { href: '/dashboard/enrolled-modules', label: 'Enrolled Modules', icon: 'BookOpen' },
    { href: '/dashboard/results', label: 'Test Results', icon: 'BarChart3' },
    { href: '/dashboard/certificate', label: 'Certificate', icon: 'Award' },
  ]

  const masterPractitionerItems = [
    { href: '/master-practitioner/content', label: 'Manage Content', icon: 'BookOpen' },
    { href: '/master-practitioner/tests', label: 'Manage Tests', icon: 'FileText' },
    { href: '/master-practitioner/results', label: 'Test Results', icon: 'BarChart3' },
  ]

  const adminItems = [
    { href: '/admin', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/admin/profile', label: 'Profile', icon: 'User' },
    { href: '/admin/users', label: 'User Management', icon: 'Users' },
    { href: '/admin/roles', label: 'Roles & Permissions', icon: 'Shield' },
    { href: '/admin/modules', label: 'Manage Modules', icon: 'BookOpen' },
    { href: '/admin/messages', label: 'Messages', icon: 'Mail' },
    { href: '/admin/reports', label: 'Reports', icon: 'BarChart3' },
    { href: '/admin/settings', label: 'Settings', icon: 'Settings' },
  ]

  let items = [...baseItems]

  // Add practitioner items for non-admin users
  if (userRole === 'practitioner') {
    items = [...items, ...practitionerItems]
  }

  if (userRole === 'master_practitioner') {
    // For master practitioners, use master practitioner base items and their specific items
    // They have their own dedicated results page, so remove practitioner results access
    items = [...masterPractitionerBaseItems, ...masterPractitionerItems]
  }

  if (userRole === 'admin') {
    // Remove any dashboard links except the admin one
    items = items.filter(item => item.href !== '/dashboard' && item.href !== '/master-practitioner' && item.href !== '/dashboard/profile')
    items = [...adminItems]
  }

  return items
}

/**
 * Check if user can access a specific page
 */
export function canAccessPage(userRole: UserRole, pathname: string): boolean {
  // Public pages
  const publicPages = ['/', '/about', '/contact', '/why-join', '/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/reset-password']

  if (publicPages.some(page => pathname.startsWith(page))) {
    return true
  }

  // Role-based page access
  const roleAccess = {
    practitioner: [
      '/dashboard',
      '/dashboard/profile',
      '/dashboard/models',
      '/dashboard/enrolled-modules',
      '/dashboard/my-modules',
      '/dashboard/results',
      '/dashboard/certificate',
      '/dashboard/payment',
      '/modules'
    ],
    master_practitioner: [
      '/master-practitioner',
      '/master-practitioner/tests',
      '/master-practitioner/results'
    ],
    admin: [
      '/admin',
      '/admin/profile',
      '/admin/users',
      '/admin/roles',
      '/admin/modules',
      '/admin/messages',
      '/admin/student-results',
      '/admin/reports',
      '/admin/settings'
    ]
  }

  // Check if user has required role for the page
  for (const [role, pages] of Object.entries(roleAccess)) {
    if (pages.some(page => pathname.startsWith(page))) {
      return hasRoleAccess(userRole, role as UserRole)
    }
  }

  return false
}

/**
 * Check role hierarchy access
 */
function hasRoleAccess(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    admin: 3,
    master_practitioner: 2,
    practitioner: 1
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}
