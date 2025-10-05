"use client"

import { useEffect } from 'react'
import { SessionManager } from '@/lib/auth/session-manager'

/**
 * Component that tracks user session activity
 * Should be included in the app layout to monitor session expiry
 */
export function SessionTracker() {
  useEffect(() => {
    // Initialize session tracking only on client-side
    SessionManager.initializeSessionTracking()
  }, [])

  // This component doesn't render anything, it just sets up session tracking
  return null
}
