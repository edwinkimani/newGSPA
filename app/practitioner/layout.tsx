"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { fetchJson } from '@/lib/api/client'
import { useRouter, usePathname } from "next/navigation"

export default function PractitionerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [userRole, setUserRole] = useState<string>("practitioner")
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  // use REST API client

  useEffect(() => {
    const getUser = async () => {
      const res = await fetch('/api/auth/user')
      if (res.status === 401) {
        router.push('/auth/login')
        return
      }
      const data = await res.json()
      const profile = data.profile
      const authUser = data

      // Set basic user info from profile/auth
      setUserName(profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : (authUser.email?.split('@')[0] || 'User'))
      setUserEmail(profile?.email || authUser.email || '')

      // Set role
      setUserRole(profile?.role?.name || 'practitioner')
    }

    getUser()
  }, [router, pathname])

  const getPageTitle = () => {
    switch (pathname) {
      case "/practitioner":
        return "Dashboard"
      case "/practitioner/enrolled":
        return "Enroll in Modules"
      case "/practitioner/profile":
        return "Profile"
      case "/practitioner/test":
        return "Test"
      case "/practitioner/certificate":
        return "Certificate"
      case "/practitioner/payment":
        return "Payment"
      case "/practitioner/results":
        return "Results"
      default:
        return "Dashboard"
    }
  }

  const isTestPage = pathname === '/practitioner/test'

  return (
    <div className="min-h-screen flex">
      {/* Mobile Sidebar - Hide on test page */}
      {!isTestPage && mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <DashboardSidebar
              userRole={userRole}
              userName={userName}
              userEmail={userEmail}
              isMobileOpen={mobileMenuOpen}
              onMobileClose={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar - Hide on test page */}
      {!isTestPage && (
        <div className="hidden md:block">
          <DashboardSidebar
            userRole={userRole}
            userName={userName}
            userEmail={userEmail}
          />
        </div>
      )}

      <main
        className={[
          "flex-1 min-h-screen overflow-y-auto", // base styles
          !isTestPage ? "md:ml-1" : "", // sidebar spacing only on non-test pages
        ].join(" ")}
      >
        {/* Mobile Header - only render if not test page */}
        {!isTestPage && (
          <header className="md:hidden bg-background/95 backdrop-blur-sm border-b border-border p-4 flex items-center justify-between shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden hover:bg-muted"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <h1 className="text-lg font-semibold truncate text-foreground">{getPageTitle()}</h1>

            {/* Spacer for alignment */}
            <div className="w-8" />
          </header>
        )}

        {/* Page content */}
        <div className={isTestPage ? "" : "p-4 md:p-6"}>{children}</div>
      </main>

    </div>
  )
}
