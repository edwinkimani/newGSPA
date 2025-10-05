"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { signOut } from "next-auth/react"
import type { UserRole } from "@/lib/rbac"
import { SessionManager } from "@/lib/auth/session-manager"

interface UserProfile {
  id: string
  role_id: string
  membership_fee_paid?: boolean
  test_completed?: boolean
  certificate_issued?: boolean
  created_at?: string
  updated_at?: string
}

interface UserContextType {
  profile: UserProfile | null
  role: UserRole | null
  setProfile: (profile: UserProfile | null) => void
  setRole: (role: UserRole | null) => void
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    // Return default values if not within provider (e.g., during SSR or misconfiguration)
    return {
      profile: null,
      role: null,
      setProfile: () => {},
      setRole: () => {},
      refresh: async () => {},
      logout: async () => {},
    }
  }
  return context
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfileState] = useState<UserProfile | null>(null)
  const [role, setRoleState] = useState<UserRole | null>(null)

  useEffect(() => {
    // Load data from SessionManager
    const userData = SessionManager.getUserData()
    if (userData) {
      if (userData.profile) setProfileState(userData.profile)
      if (userData.role) setRoleState(userData.role)
    }

    // Initialize session tracking
    SessionManager.initializeSessionTracking()

    // fetch latest profile using refresh
    ;(async () => {
      try {
        await refresh()
      } catch {
        // ignore
      }
    })()
  }, [])

  const setProfile = (p: UserProfile | null) => {
    setProfileState(p)
    if (p) {
      SessionManager.setUserData({ profile: p })
    } else {
      // Clear user data when profile is null
      const currentData = SessionManager.getUserData() || {}
      delete currentData.profile
      SessionManager.setUserData(currentData)
    }
  }

  const setRole = (r: UserRole | null) => {
    setRoleState(r)
    if (r) {
      const currentData = SessionManager.getUserData() || {}
      SessionManager.setUserData({ ...currentData, role: r })
    } else {
      // Clear role when null
      const currentData = SessionManager.getUserData() || {}
      delete currentData.role
      SessionManager.setUserData(currentData)
    }
  }

  const refresh = async () => {
    try {
      const response = await fetch("/api/auth/user")
      const data = await response.json()

      if (response.status === 404) {
        // User not found - session is invalid, perform complete logout
        console.log("User session invalid (404), performing complete logout...")
        await performCompleteLogout()
        return
      }

      if (response.ok && data?.profile) {
        setProfileState(data.profile)

        // Store session data using SessionManager
        SessionManager.setSessionData({
          userId: data.profile.id,
          email: data.profile.email,
          role: data.profile.role?.name,
          profileComplete: !!data.profile,
          membershipPaid: !!data.profile.membership_fee_paid,
        })

        // Store user data
        SessionManager.setUserData({
          profile: data.profile,
          role: data.profile.role?.name,
        })
      } else {
        // Other errors - clear local data
        setProfileState(null)
        setRoleState(null)
        SessionManager.clearLocalStorage()
      }
    } catch (err) {
      // Network or other errors - clear local data
      setProfileState(null)
      setRoleState(null)
      SessionManager.clearLocalStorage()
    }
  }

  const performCompleteLogout = async () => {
    try {
      console.log("[v0] Delegating logout to SessionManager.logout()...")

      // Update local state immediately for UX
      setProfileState(null)
      setRoleState(null)

      // Delegate the rest to SessionManager which calls signOut then cleans client-side storage
      await SessionManager.logout()
    } catch (error) {
      console.error("[v0] Logout error:", error)
      if (typeof window !== "undefined") {
        window.location.replace("/auth/login")
      }
    }
  }

  const logout = async () => {
    await performCompleteLogout()
  }

  return (
    <UserContext.Provider value={{ profile, role, setProfile, setRole, refresh, logout }}>
      {children}
    </UserContext.Provider>
  )
}
