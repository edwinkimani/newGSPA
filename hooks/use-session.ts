"use client"

import { useEffect, useCallback, useState } from 'react'
import { SessionManager } from '@/lib/auth/session-manager'
import { useRouter } from 'next/navigation'

/**
 * Custom hook for session management
 * Handles session tracking, activity monitoring, and automatic logout
 */
export function useSession() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  // Set client-side flag
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Update activity on user interactions
  const updateActivity = useCallback(() => {
    if (isClient) {
      SessionManager.updateActivity()
    }
  }, [isClient])

  // Check session status
  const checkSession = useCallback(() => {
    if (!isClient) {
      return {
        isAuthenticated: false,
        sessionData: null,
        userData: null,
        lastActivity: null,
        isExpired: false
      }
    }
    const status = SessionManager.getSessionStatus()
    return status
  }, [isClient])

  // Force logout
  const forceLogout = useCallback(async () => {
    try {
      if (isClient) {
        await SessionManager.logout()
      }
      router.push('/auth/login')
    } catch (error) {
      console.error('Force logout failed:', error)
      // Fallback
      if (isClient) {
        SessionManager.clearAllCookies()
        SessionManager.clearLocalStorage()
        SessionManager.clearSessionStorage()
      }
      router.push('/auth/login')
    }
  }, [router, isClient])

  // Initialize session tracking
  useEffect(() => {
    if (!isClient) return

    // Set up activity tracking
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true })
    })

    // Check session expiry every minute
    const interval = setInterval(() => {
      const status = SessionManager.getSessionStatus()
      if (status.isExpired) {
        console.log('Session expired, logging out...')
        forceLogout()
      }
    }, 60000) // Check every minute

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity)
      })
      clearInterval(interval)
    }
  }, [isClient, updateActivity, forceLogout])

  return {
    checkSession,
    updateActivity,
    forceLogout,
    sessionStatus: checkSession()
  }
}
