"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, Award, XCircle, CheckCircle, Menu, Eye, Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface StudentResult {
  id: string
  first_name: string
  last_name: string
  email: string
  test_completed: boolean
  test_score: number | null
  certificate_issued: boolean
  test_completed_at: string | null
  created_at: string
}

export default function AdminStudentResultsPage() {
  const [students, setStudents] = useState<StudentResult[]>([])
  const [filteredStudents, setFilteredStudents] = useState<StudentResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
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
        await loadStudentResults()
      } catch (err) {
        router.push('/auth/login')
        return
      }
    }

    checkAdminAndLoadData()
  }, [router])

  useEffect(() => {
    filterStudents()
  }, [students, searchTerm, statusFilter])

  const loadStudentResults = async () => {
    try {
      const res = await fetch('/api/users?results=true'); // Assuming an endpoint for student results
      if (!res.ok) {
        throw new Error('Failed to fetch student results');
      }
      const profiles = await res.json();
      const studentResults: StudentResult[] = profiles.map((profile: any) => ({
        id: profile.id,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        test_completed: profile.test_completed || false,
        test_score: profile.test_score,
        certificate_issued: profile.certificate_issued || false,
        test_completed_at: profile.test_completed_at,
        created_at: profile.created_at
      }))
      setStudents(studentResults)
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false)
    }
  }

  const filterStudents = () => {
    let filtered = students

    // Search filter
    if (searchTerm) {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          `${student.first_name} ${student.last_name}`
            .toLowerCase()
            .includes(lowercasedSearchTerm) ||
          student.email.toLowerCase().includes(lowercasedSearchTerm)
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(student => {
        const score = student.test_score;
        switch (statusFilter) {
          case "completed":
            return student.test_completed
          case "not_completed":
            return !student.test_completed
          case "passed":
            return student.test_completed && score !== null && score >= 70
          case "failed":
            return student.test_completed && score !== null && score < 70
          case "certified":
            return student.certificate_issued
          default:
            return true
        }
      })
    }

    setFilteredStudents(filtered)
  }

  const updateTestScore = async (studentId: string, newScore: string) => {
    const score = parseInt(newScore, 10);
    if (isNaN(score)) return;

    const res = await fetch(`/api/users/${studentId}/score`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score }),
    });

    if (res.ok) {
      await loadStudentResults() // Refresh data
    } else {
      alert('Failed to update score');
    }
  }

  const toggleCertificate = async (
    studentId: string,
    currentStatus: boolean
  ) => {
    const res = await fetch(`/api/users/${studentId}/certificate`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issue: !currentStatus }),
    });

    if (res.ok) {
      await loadStudentResults() // Refresh data
    } else {
      alert('Failed to update certificate status');
    }
  }

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-gray-500"
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score: number | null) => {
    if (!score) return "secondary"
    if (score >= 90) return "default"
    if (score >= 80) return "secondary"
    if (score >= 70) return "outline"
    return "destructive"
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

  const completedTests = students.filter(s => s.test_completed).length
  const avgScore = students
    .filter(s => s.test_completed && s.test_score)
    .reduce((sum, s, _, arr) => sum + (s.test_score || 0) / arr.length, 0);

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
          <h1 className="text-lg font-semibold">Student Results</h1>
          <div className="w-8" /> {/* Spacer */}
        </div>

        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Student Test Results</h1>
              <p className="text-muted-foreground">
                View and manage test results for all students.
              </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tests Completed</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedTests}</div>
                  <p className="text-xs text-muted-foreground">
                    Out of {students.length} students
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgScore.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    For completed tests
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {completedTests > 0 ? Math.round((students.filter(s => s.test_score && s.test_score >= 70).length / completedTests) * 100) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Students scoring 70%+
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      <SelectItem value="completed">Tests Completed</SelectItem>
                      <SelectItem value="not_completed">Not Completed</SelectItem>
                      <SelectItem value="passed">Passed (70%+)</SelectItem>
                      <SelectItem value="failed">{`Failed (<70%)`}</SelectItem>
                      <SelectItem value="certified">Certified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Results Table */}
            <Card>
              <CardHeader>
                <CardTitle>Student Results</CardTitle>
                <CardDescription>
                  {filteredStudents.length} of {students.length} students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Test Status</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Certificate</TableHead>
                        <TableHead>Completed At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {student.first_name} {student.last_name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {student.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {student.test_completed ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <XCircle className="h-3 w-3 mr-1" />
                                Not Completed
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {student.test_score !== null ? (
                              <Badge variant={getScoreBadgeVariant(student.test_score)} className={getScoreColor(student.test_score)}>
                                {student.test_score}%
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {student.certificate_issued ? (
                              <Badge variant="default" className="bg-blue-100 text-blue-800">
                                <Award className="h-3 w-3 mr-1" />
                                Issued
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <XCircle className="h-3 w-3 mr-1" />
                                Not Issued
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {student.test_completed_at ? (
                              <div className="text-sm">
                                {new Date(student.test_completed_at).toLocaleDateString()}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleCertificate(student.id, student.certificate_issued)}
                              >
                                {student.certificate_issued ? (
                                  <>
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Revoke
                                  </>
                                ) : (
                                  <>
                                    <Award className="h-3 w-3 mr-1" />
                                    Issue
                                  </>
                                )}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
