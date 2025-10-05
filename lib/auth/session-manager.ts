
/**
 * Client-side session management utilities
 * Handles cookies, localStorage, and session cleanup
 */

import { signOut } from "next-auth/react"
export interface SessionData {
  userId?: string
  email?: string
  role?: string
  profileComplete?: boolean
  membershipPaid?: boolean
  lastActivity?: number
}

export class SessionManager {
  private static readonly SESSION_KEY = "gspa_session"
  private static readonly USER_DATA_KEY = "gspa_user_data"
  private static readonly LAST_ACTIVITY_KEY = "gspa_last_activity"

  // Cookie names used by NextAuth
  private static readonly NEXTAUTH_COOKIES = [
    "next-auth.session-token",
    "next-auth.callback-url",
    "next-auth.csrf-token",
    "__Secure-next-auth.session-token",
    "__Secure-next-auth.callback-url",
    "__Secure-next-auth.csrf-token",
    "__Host-next-auth.csrf-token",
  ]

  // Custom cookies
  private static readonly CUSTOM_COOKIES = ["auth_token", "user_session", "session_id"]

  /**
   * Store session data in localStorage
   */
  static setSessionData(data: SessionData): void {
    if (typeof window === "undefined" || !window.localStorage) {
      return // Skip on server-side
    }

    try {
      const sessionData = {
        ...data,
        lastActivity: Date.now(),
      }
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData))
      localStorage.setItem(this.LAST_ACTIVITY_KEY, Date.now().toString())
    } catch (error) {
      console.warn("Failed to store session data:", error)
    }
  }

  /**
   * Get session data from localStorage
   */
  static getSessionData(): SessionData | null {
    if (typeof window === "undefined" || !window.localStorage) {
      return null // Return null on server-side
    }

    try {
      const data = localStorage.getItem(this.SESSION_KEY)
      if (!data) return null

      const sessionData = JSON.parse(data)
      return sessionData
    } catch (error) {
      console.warn("Failed to retrieve session data:", error)
      return null
    }
  }

  /**
   * Store user data separately
   */
  static setUserData(userData: any): void {
    if (typeof window === "undefined" || !window.localStorage) {
      return // Skip on server-side
    }

    try {
      localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData))
    } catch (error) {
      console.warn("Failed to store user data:", error)
    }
  }

  /**
   * Get user data
   */
  static getUserData(): any {
    if (typeof window === "undefined" || !window.localStorage) {
      return null // Return null on server-side
    }

    try {
      const data = localStorage.getItem(this.USER_DATA_KEY)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.warn("Failed to retrieve user data:", error)
      return null
    }
  }

  /**
   * Update last activity timestamp
   */
  static updateActivity(): void {
    if (typeof window === "undefined" || !window.localStorage) {
      return // Skip on server-side
    }

    try {
      localStorage.setItem(this.LAST_ACTIVITY_KEY, Date.now().toString())
    } catch (error) {
      console.warn("Failed to update activity:", error)
    }
  }

  /**
   * Get last activity timestamp
   */
  static getLastActivity(): number | null {
    if (typeof window === "undefined" || !window.localStorage) {
      return null // Return null on server-side
    }

    try {
      const timestamp = localStorage.getItem(this.LAST_ACTIVITY_KEY)
      return timestamp ? Number.parseInt(timestamp) : null
    } catch (error) {
      return null
    }
  }

  /**
   * Check if session is expired based on activity
   */
  static isSessionExpired(maxAge: number = 30 * 24 * 60 * 60 * 1000): boolean {
    const lastActivity = this.getLastActivity()
    if (!lastActivity) return true

    return Date.now() - lastActivity > maxAge
  }

  /**
   * Clear all cookies (both NextAuth and custom)
   */
  static clearAllCookies(): void {
    if (typeof window === "undefined" || !window.document) {
      return // Skip on server-side
    }

    const allCookies = [...this.NEXTAUTH_COOKIES, ...this.CUSTOM_COOKIES]

    allCookies.forEach((cookieName) => {
      this.clearCookie(cookieName)
      this.clearCookie(cookieName, ".localhost")
      this.clearCookie(cookieName, "localhost")
      // Also try without domain for current domain
      this.clearCookie(cookieName, window.location.hostname)
    })

    // Additional attempt to clear all cookies by setting them to expire
    try {
      const cookies = document.cookie.split(";")
      cookies.forEach((cookie) => {
        const eqPos = cookie.indexOf("=")
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
        this.clearCookie(name)
        this.clearCookie(name, window.location.hostname)
      })
    } catch (error) {
      console.warn("Error clearing all cookies:", error)
    }
  }

  /**
   * Clear a specific cookie
   */
  private static clearCookie(name: string, domain?: string): void {
    if (typeof window === "undefined" || !window.document) {
      return // Skip on server-side
    }

    const cookieOptions = [
      `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`,
      `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure`,
      `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; samesite=lax`,
      `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; samesite=strict`,
    ]

    if (domain) {
      cookieOptions.forEach((option) => {
        document.cookie = `${option}; domain=${domain}`
      })
    } else {
      cookieOptions.forEach((option) => {
        document.cookie = option
      })
    }
  }

  /**
   * Clear all localStorage data
   */
  static clearLocalStorage(): void {
    if (typeof window === "undefined" || !window.localStorage) {
      return // Skip on server-side
    }

    try {
      // For a complete logout, it's safest to clear everything.
      // This prevents any stale data from being used on the next login.
      localStorage.clear()
    } catch (error) {
      console.warn("Failed to clear localStorage:", error)
    }
  }

  /**
   * Clear all sessionStorage data
   */
  static clearSessionStorage(): void {
    if (typeof window === "undefined" || !window.sessionStorage) {
      return // Skip on server-side
    }

    try {
      // Clear all sessionStorage
      sessionStorage.clear()
    } catch (error) {
      console.warn("Failed to clear sessionStorage:", error)
    }
  }

  /**
   * Complete logout - clears all client-side data
   */
  static async logout(): Promise<void> {
    console.log("[v0] Starting complete logout process...")

    try {
      // Step 1: Clear client-side storage
      this.clearLocalStorage()
      console.log("[v0] ✓ LocalStorage cleared")

      this.clearSessionStorage()
      console.log("[v0] ✓ SessionStorage cleared")

      // Note: NextAuth httpOnly cookies cannot be cleared client-side
      // signOut will handle server-side session invalidation and redirect

      // Step 2: Sign out with NextAuth - this will clear session and redirect to login
      console.log("[v0] Calling NextAuth signOut with redirect...")
      await signOut({ callbackUrl: "/auth/login" })

      console.log("[v0] ✓ Complete logout finished")
    } catch (error) {
      console.error("[v0] Logout error:", error)
      // Force redirect even on error
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login"
      }
    }
  }

  /**
   * Initialize session tracking
   */
  static initializeSessionTracking(): void {
    // Only run on client-side
    if (typeof window === "undefined" || !window.document) {
      return
    }

    // Only initialize session tracking when there appears to be an active session
    // This avoids forcing a logout on public pages like the login page where no session exists
    const hasSessionData = !!this.getSessionData()
    const hasAuthCookie = (() => {
      try {
        return this.NEXTAUTH_COOKIES.some((name) => document.cookie.includes(name + "="))
      } catch (e) {
        return false
      }
    })()

    if (!hasSessionData && !hasAuthCookie) {
      // Nothing to track for anonymous users
      return
    }

    // Update activity on user interactions
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"]

    const updateActivity = () => {
      this.updateActivity()
    }

    events.forEach((event) => {
      document.addEventListener(event, updateActivity, { passive: true })
    })

    // Check for session expiry periodically, but only when a session appears present
    const checkInterval = setInterval(async () => {
      // Re-check presence of session/cookie before forcing a logout
      const stillHasSession = !!this.getSessionData() || this.NEXTAUTH_COOKIES.some((name) => document.cookie.includes(name + "="))
      if (!stillHasSession) return

      if (this.isSessionExpired()) {
        console.log("Session expired, logging out...")
        try {
          await this.logout()
        } catch (err) {
          console.warn("Error during automatic logout:", err)
        }

        try {
          window.location.href = "/auth/login"
        } catch (e) {
          // ignore navigation errors
        }
      }
    }, 60000) // Check every minute

    // Cleanup listeners when the window unloads
    window.addEventListener("beforeunload", () => {
      clearInterval(checkInterval)
      events.forEach((event) => document.removeEventListener(event, updateActivity))
    })
  }

  /**
   * Get current session status
   */
  static getSessionStatus(): {
    isAuthenticated: boolean
    sessionData: SessionData | null
    userData: any
    lastActivity: number | null
    isExpired: boolean
  } {
    const sessionData = this.getSessionData()
    const userData = this.getUserData()
    const lastActivity = this.getLastActivity()
    const isExpired = this.isSessionExpired()

    return {
      isAuthenticated: !!sessionData && !isExpired,
      sessionData,
      userData,
      lastActivity,
      isExpired,
    }
  }
}
