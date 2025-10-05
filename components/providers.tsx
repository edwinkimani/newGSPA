'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/theme-provider'
import { UserProvider } from '@/components/user-context'
import { SessionTracker } from '@/components/session-tracker'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <UserProvider>
          {/* <SessionTracker /> */}
          {children}
        </UserProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
