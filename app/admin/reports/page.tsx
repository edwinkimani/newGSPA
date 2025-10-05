"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, DollarSign, FileText, Award, TrendingUp, Calendar, Menu, Download } from "lucide-react"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  membership_fee_paid: boolean
  payment_status: string
  test_completed: boolean
  test_score: number | null
  certificate_issued: boolean
  created_at: string
}

interface MonthlyStats {
  month: string
  registrations: number
  memberships: number
  testsCompleted: number
  certificates: number
  revenue: number
}

export default function AdminReportsPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAdminAndLoadData = async () => {
      try {
        const userRes = await fetch('/api/auth/user')
        if (!userRes.ok) {
          router.push('/auth/login')
          return
        }
        const data = await userRes.json()
        const roleName = data?.profile?.role?.name
        if (roleName !== 'admin') {
          router.push('/dashboard')
          return
        }
        setIsAdmin(true)
        setUserName(`${data?.profile?.first_name || ''} ${data?.profile?.last_name || ''}`.trim() || 'Admin')
        setUserEmail(data?.email || '')

        // Load all users via API
        const profilesRes = await fetch('/api/users?all=true') // Assuming an endpoint to get all users
        if (profilesRes.ok) {
          const profiles = await profilesRes.json()
          setUsers(profiles)
          // Calculate monthly stats
          const stats = calculateMonthlyStats(profiles)
          setMonthlyStats(stats)
        }

      setIsLoading(false)
      } catch (error) {
        console.error('Error checking admin:', error)
        router.push('/auth/login')
        return
      }
    }

    checkAdminAndLoadData()
  }, [router])

  const calculateMonthlyStats = (profiles: UserProfile[]): MonthlyStats[] => {
    const monthlyData: { [key: string]: MonthlyStats } = {}

    profiles.forEach(profile => {
      const date = new Date(profile.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' })

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          registrations: 0,
          memberships: 0,
          testsCompleted: 0,
          certificates: 0,
          revenue: 0
        }
      }

      monthlyData[monthKey].registrations++
      if (profile.membership_fee_paid) {
        monthlyData[monthKey].memberships++
        monthlyData[monthKey].revenue += 50 // Membership fee
      }
      if (profile.test_completed) {
        monthlyData[monthKey].testsCompleted++
        monthlyData[monthKey].revenue += 50 // Test fee
      }
      if (profile.certificate_issued) {
        monthlyData[monthKey].certificates++
      }
    })

    return Object.values(monthlyData).sort((a, b) => b.month.localeCompare(a.month))
  }

  const exportToCSV = () => {
    const csvContent = [
      ['Month', 'Registrations', 'Memberships', 'Tests Completed', 'Certificates', 'Revenue'],
      ...monthlyStats.map(stat => [
        stat.month,
        stat.registrations,
        stat.memberships,
        stat.testsCompleted,
        stat.certificates,
        `$${stat.revenue}`
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'monthly-reports.csv'
    a.click()
    window.URL.revokeObjectURL(url)
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

  const totalRevenue = users.reduce((sum, user) => {
    let revenue = 0
    if (user.membership_fee_paid) revenue += 50
    if (user.test_completed) revenue += 50
    return sum + revenue
  }, 0)

  const avgTestScore = users
    .filter(u => u.test_completed && u.test_score !== null)
    .reduce((sum, u, _, arr) => sum + (u.test_score || 0) / arr.length, 0)

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
          <h1 className="text-lg font-semibold">Reports</h1>
          <div className="w-8" /> {/* Spacer */}
        </div>

        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Reports & Analytics</h1>
                <p className="text-muted-foreground">
                  Detailed insights into platform performance and user engagement.
                </p>
              </div>
              <Button onClick={exportToCSV} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalRevenue}</div>
                  <p className="text-xs text-muted-foreground">
                    From memberships and tests
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Test Score</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgTestScore.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    For completed tests
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {users.length > 0 ? Math.round((users.filter(u => u.certificate_issued).length / users.length) * 100) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Registration to certification
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {users.filter(u => u.membership_fee_paid).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Paid memberships
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Breakdown */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
                <CardDescription>
                  Breakdown of key metrics by month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Registrations</TableHead>
                        <TableHead className="text-right">Memberships</TableHead>
                        <TableHead className="text-right">Tests Completed</TableHead>
                        <TableHead className="text-right">Certificates</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyStats.map((stat) => (
                        <TableRow key={stat.month}>
                          <TableCell className="font-medium">{stat.month}</TableCell>
                          <TableCell className="text-right">{stat.registrations}</TableCell>
                          <TableCell className="text-right">{stat.memberships}</TableCell>
                          <TableCell className="text-right">{stat.testsCompleted}</TableCell>
                          <TableCell className="text-right">{stat.certificates}</TableCell>
                          <TableCell className="text-right">${stat.revenue}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Test Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Test Performance Distribution</CardTitle>
                <CardDescription>
                  Breakdown of test scores for completed exams
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { range: '90-100%', count: users.filter(u => u.test_score && u.test_score >= 90).length, color: 'bg-green-500' },
                    { range: '80-89%', count: users.filter(u => u.test_score && u.test_score >= 80 && u.test_score < 90).length, color: 'bg-blue-500' },
                    { range: '70-79%', count: users.filter(u => u.test_score && u.test_score >= 70 && u.test_score < 80).length, color: 'bg-yellow-500' },
                    { range: '60-69%', count: users.filter(u => u.test_score && u.test_score >= 60 && u.test_score < 70).length, color: 'bg-orange-500' },
                    { range: 'Below 60%', count: users.filter(u => u.test_score && u.test_score < 60).length, color: 'bg-red-500' },
                  ].map((bucket) => (
                    <div key={bucket.range} className="text-center">
                      <div className="text-2xl font-bold">{bucket.count}</div>
                      <div className="text-sm text-muted-foreground">{bucket.range}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
