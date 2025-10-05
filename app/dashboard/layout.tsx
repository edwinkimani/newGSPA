"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [userRole, setUserRole] = useState<string>("")
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const getUser = async () => {
      const res = await fetch('/api/auth/user')
      if (res.status === 401) {
        router.push("/auth/login")
        return
      }
      if (!res.ok) {
        // Handle other errors, maybe show an error page
        return
      }
      const data = await res.json()
      const profile = data.profile
      const authUser = data

      // Set user info from the unified API response
      setUserName(profile?.firstName && profile?.lastName ? `${profile.firstName} ${profile.lastName}` : (authUser.email?.split('@')[0] || 'User'))
      setUserEmail(profile?.email || authUser.email || '')
      setUserRole(profile?.role?.name || "practitioner")
    }

    getUser()
  }, [router, pathname])

  const getPageTitle = () => {
    switch (pathname) {
      case "/dashboard":
        return "Dashboard"
      case "/dashboard/models":
        return "Available Models"
      case "/dashboard/profile":
        return "Profile"
      case "/dashboard/test":
        return "Test"
      case "/dashboard/certificate":
        return "Certificate"
      case "/dashboard/payment":
        return "Payment"
      case "/dashboard/results":
        return "Results"
      default:
        return "Dashboard"
    }
  }

  const isTestPage = pathname === '/dashboard/test'
  const isLevelPage = pathname.includes('/levels/')

  return (
    <div className="min-h-screen flex">
      {/* Mobile Sidebar - Hide on test page and level pages */}
      {!isTestPage && !isLevelPage && mobileMenuOpen && (
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

      {/* Desktop Sidebar - Hide on test page and level pages */}
      {!isTestPage && !isLevelPage && (
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
          !isTestPage && !isLevelPage ? "md:ml-1" : "", // sidebar spacing only on non-test and non-level pages
        ].join(" ")}
      >
        {/* Mobile Header - only render if not test page and not level page */}
        {!isTestPage && !isLevelPage && (
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
        <div className={isTestPage || isLevelPage ? "" : "p-4 md:p-6"}>{children}</div>
      </main>

    </div>
  )
}
