"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Users, Award, TrendingUp, Menu, Calendar, Clock, Target } from "lucide-react"
import { useRouter } from "next/navigation"

interface TestResult {
  id: string
  user_id: string
  exam_configuration_id: string
  assigned_at: string
  completed_at: string | null
  score: number | null
  passed: boolean | null
  user_name: string
  user_email: string
  exam_name: string
  passing_score: number
}

interface ExamStats {
  totalExams: number
  completedExams: number
  passedExams: number
  averageScore: number
  passRate: number
}

export default function MasterPractitionerResultsPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [stats, setStats] = useState<ExamStats>({
    totalExams: 0,
    completedExams: 0,
    passedExams: 0,
    averageScore: 0,
    passRate: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isMasterPractitioner, setIsMasterPractitioner] = useState(false)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const checkMasterPractitionerAndLoadData = async () => {
      try {
        const userRes = await fetch('/api/auth/user')
        if (!userRes.ok) {
          router.push('/auth/login')
          return
        }
        const data = await userRes.json()
        const roleName = data?.profile?.role?.name
        if (roleName !== 'master_practitioner') {
          router.push('/dashboard')
          return
        }
        setIsMasterPractitioner(true)
        setUserName(`${data?.profile?.firstName || ''} ${data?.profile?.lastName || ''}`.trim() || 'Master Practitioner')
        setUserEmail(data?.email || '')
      } catch (err) {
        router.push('/auth/login')
        return
      }

      // Load test results
      const resultsRes = await fetch('/api/user-exams?completed=true');
      if (resultsRes.ok) {
        const resultsData = await resultsRes.json();
        if (resultsData) {
          const formattedResults = resultsData.map((result: any) => ({
            id: result.id,
            user_id: result.userId,
            exam_configuration_id: result.examConfigurationId,
            assigned_at: result.assignedAt,
            completed_at: result.completedAt,
            score: result.score,
            passed: result.passed,
            user_name: result.user ? `${result.user.firstName} ${result.user.lastName}` : 'Unknown',
            user_email: result.user?.email || 'Unknown',
            exam_name: result.examConfiguration?.name || 'Unknown Exam',
            passing_score: result.examConfiguration?.passingScore || 70
          }))
          setResults(formattedResults)

          // Calculate stats
          const totalExams = formattedResults.length
          const completedExams = formattedResults.filter((r: TestResult) => r.completed_at).length
          const passedExams = formattedResults.filter((r: TestResult) => r.passed).length
          const averageScore = completedExams > 0
            ? formattedResults.reduce((sum: number, r: TestResult) => sum + (r.score || 0), 0) / completedExams
            : 0
          const passRate = completedExams > 0 ? (passedExams / completedExams) * 100 : 0

          setStats({
            totalExams,
            completedExams,
            passedExams,
            averageScore,
            passRate
          })
        }
      }

      setIsLoading(false)
    }

    checkMasterPractitionerAndLoadData()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!isMasterPractitioner) {
    return (
      <div className="min-h-screen flex">
        <div className="flex-1 flex items-center justify-center">
          <Alert variant="destructive">
            <AlertDescription>Access denied. Master practitioner privileges required.</AlertDescription>
          </Alert>
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
          userRole="master_practitioner"
          userName={userName}
          userEmail={userEmail}
          isMobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <DashboardSidebar
          userRole="master_practitioner"
          userName={userName}
          userEmail={userEmail}
        />
      </div>

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
          <h1 className="text-lg font-semibold">Test Results</h1>
          <div className="w-8" />
        </div>

        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Test Results</h1>
              <p className="text-muted-foreground">
                View and analyze test performance across all users.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
              <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Exams</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalExams}</div>
                  <p className="text-xs text-muted-foreground">
                    Assigned exams
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Completed</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.completedExams}</div>
                  <p className="text-xs text-muted-foreground">
                    Exams taken
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Passed</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.passedExams}</div>
                  <p className="text-xs text-muted-foreground">
                    Successful completions
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Pass Rate</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.passRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    Success percentage
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Avg Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.averageScore.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    Average performance
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Pass Rate Progress */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Overall Performance</CardTitle>
                <CardDescription>
                  Pass rate and completion statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Pass Rate</span>
                      <span className="font-medium">{stats.passRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={stats.passRate} className="h-3" />
                    <p className="text-xs text-muted-foreground">
                      {stats.passedExams} out of {stats.completedExams} exams passed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completion Rate</span>
                      <span className="font-medium">
                        {stats.totalExams > 0 ? ((stats.completedExams / stats.totalExams) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <Progress
                      value={stats.totalExams > 0 ? (stats.completedExams / stats.totalExams) * 100 : 0}
                      className="h-3"
                    />
                    <p className="text-xs text-muted-foreground">
                      {stats.completedExams} out of {stats.totalExams} exams completed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Table */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Results</CardTitle>
                <CardDescription>
                  Individual test results and performance metrics.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">Student</TableHead>
                        <TableHead className="min-w-[200px]">Email</TableHead>
                        <TableHead className="min-w-[200px]">Exam</TableHead>
                        <TableHead className="min-w-[100px]">Score</TableHead>
                        <TableHead className="min-w-[100px]">Status</TableHead>
                        <TableHead className="min-w-[120px]">Completed</TableHead>
                        <TableHead className="min-w-[120px]">Assigned</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result) => (
                        <TableRow key={result.id}>
                          <TableCell className="font-medium">{result.user_name}</TableCell>
                          <TableCell>{result.user_email}</TableCell>
                          <TableCell>{result.exam_name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {result.score !== null ? `${result.score}%` : 'N/A'}
                              </span>
                              {result.score !== null && (
                                <Badge
                                  variant={result.score >= result.passing_score ? "default" : "destructive"}
                                  className="text-xs"
                                >
                                  {result.score >= result.passing_score ? "Pass" : "Fail"}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={result.passed ? "default" : "secondary"}>
                              {result.passed ? "Passed" : "Failed"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {result.completed_at
                              ? new Date(result.completed_at).toLocaleString()
                              : 'Not completed'
                            }
                          </TableCell>
                          <TableCell>
                            {new Date(result.assigned_at).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {results.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No test results available yet</p>
                    <p className="text-sm">Results will appear here once students complete their exams</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
