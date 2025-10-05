"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Award, CreditCard, TrendingUp, Activity, Menu, Shield } from "lucide-react"
import { useSession } from "next-auth/react"
// import { prisma } from "@/lib/prisma" // Removed: prisma should not be imported in client components
import { useRouter } from "next/navigation"
import Link from "next/link"
import { hasRoleAsync, roles } from "@/lib/rbac"

interface Stats {
  totalUsers: number
  activeMembers: number
  testCompleted: number
  certificatesIssued: number
  totalRevenue: number
  recentActivity: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeMembers: 0,
    testCompleted: 0,
    certificatesIssued: 0,
    totalRevenue: 0,
    recentActivity: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    const loadStats = async () => {
      if (status === "loading") return
      if (!session || !session.user) {
        router.push("/auth/login")
        return
      }
      if (!(session.user.role === roles.admin)) {
        router.push("/dashboard")
        return
      }
      setIsAdmin(true)
      setUserName(session.user.name || 'Admin')
      setUserEmail(session.user.email || '')
      // TODO: Replace with API call to fetch stats from localDB/Prisma
      setIsLoading(false)
    }
    loadStats()
  }, [session, status, router])

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
      <div className="hidden md:block">
        <DashboardSidebar
          userRole="admin"
          userName={userName}
          userEmail={userEmail}
        />
      </div>

      <main className="flex-1 overflow-y-auto md:ml-1">
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
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          <div className="w-8" /> {/* Spacer */}
        </div>

        <div className="p-6 md:p-8 bg-gradient-to-br from-muted/10 to-background min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold">Admin Dashboard</h1>
                  <p className="text-muted-foreground text-lg">
                    Overview of the GSPA certification platform.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Total Users</CardTitle>
                    <div className="text-3xl font-bold mt-2">{stats.totalUsers}</div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm text-muted-foreground">
                      +{stats.recentActivity} in last 30 days
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Active Members</CardTitle>
                    <div className="text-3xl font-bold mt-2">{stats.activeMembers}</div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm text-muted-foreground">
                      {stats.totalUsers > 0 ? Math.round((stats.activeMembers / stats.totalUsers) * 100) : 0}% of total users
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Tests Completed</CardTitle>
                    <div className="text-3xl font-bold mt-2">{stats.testCompleted}</div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <p className="text-sm text-muted-foreground">
                      {stats.activeMembers > 0 ? Math.round((stats.testCompleted / stats.activeMembers) * 100) : 0}% completion rate
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Certificates Issued</CardTitle>
                    <div className="text-3xl font-bold mt-2">{stats.certificatesIssued}</div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <p className="text-sm text-muted-foreground">
                      {stats.testCompleted > 0 ? Math.round((stats.certificatesIssued / stats.testCompleted) * 100) : 0}% success rate
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Total Revenue</CardTitle>
                    <div className="text-3xl font-bold mt-2">${stats.totalRevenue}</div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm text-muted-foreground">
                      From memberships and tests
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Recent Activity</CardTitle>
                    <div className="text-3xl font-bold mt-2">{stats.recentActivity}</div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <p className="text-sm text-muted-foreground">
                      New registrations (30 days)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & System Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-0 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm shadow-xl">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Quick Actions</CardTitle>
                      <CardDescription>Common administrative tasks</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Link href="/admin/users" className="group p-6 bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl border border-border/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 block">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div className="font-semibold text-lg mb-2">Manage Users</div>
                      <div className="text-sm text-muted-foreground leading-relaxed">View and edit user accounts</div>
                    </Link>

                    <Link href="/admin/tests" className="group p-6 bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl border border-border/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 block">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="font-semibold text-lg mb-2">Test Management</div>
                      <div className="text-sm text-muted-foreground leading-relaxed">Manage test questions</div>
                    </Link>

                    <Link href="/admin/certificates" className="group p-6 bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl border border-border/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 block">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <div className="font-semibold text-lg mb-2">Certificates</div>
                      <div className="text-sm text-muted-foreground leading-relaxed">Issue and manage certificates</div>
                    </Link>

                    <Link href="/admin/reports" className="group p-6 bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl border border-border/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 block">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                      <div className="font-semibold text-lg mb-2">Reports</div>
                      <div className="text-sm text-muted-foreground leading-relaxed">View analytics and reports</div>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm shadow-xl">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">System Status</CardTitle>
                      <CardDescription>Current system health and status</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-25 rounded-lg border border-green-200/50">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Database</span>
                    </div>
                    <span className="text-green-700 font-semibold bg-green-100 px-3 py-1 rounded-full text-sm">Healthy</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-25 rounded-lg border border-blue-200/50">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Authentication</span>
                    </div>
                    <span className="text-blue-700 font-semibold bg-blue-100 px-3 py-1 rounded-full text-sm">Operational</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-25 rounded-lg border border-purple-200/50">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Payment Processing</span>
                    </div>
                    <span className="text-purple-700 font-semibold bg-purple-100 px-3 py-1 rounded-full text-sm">Active</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-25 rounded-lg border border-orange-200/50">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">Email Service</span>
                    </div>
                    <span className="text-orange-700 font-semibold bg-orange-100 px-3 py-1 rounded-full text-sm">Working</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
