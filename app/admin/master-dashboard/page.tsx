"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  FileText,
  Award,
  Users,
  TrendingUp,
  Plus,
  Edit,
  Eye,
  BarChart3,
  Menu,
  CheckCircle,
  Clock,
  AlertCircle,
  GraduationCap,
  Target
} from "lucide-react"
import { prisma } from '@/lib/prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { redirect, useRouter } from 'next/navigation'
import Link from "next/link"

interface Module {
  id: string
  title: string
  description: string
  created_at: string
  question_count: number
}

interface ExamConfiguration {
  id: string
  name: string
  description: string
  total_questions: number
  passing_score: number
  is_active: boolean
  created_at: string
}

interface StudentStats {
  totalStudents: number
  activeStudents: number
  completedTests: number
  avgScore: number
  passRate: number
}

export default function MasterPractitionerDashboardPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [examConfigurations, setExamConfigurations] = useState<ExamConfiguration[]>([])
  const [stats, setStats] = useState<StudentStats>({
    totalStudents: 0,
    activeStudents: 0,
    completedTests: 0,
    avgScore: 0,
    passRate: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isMasterPractitioner, setIsMasterPractitioner] = useState(false)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  useEffect(() => {
    (async () => {
      const session = await getServerSession(authOptions)
      if (!session?.user) {
        redirect('/auth/login')
        return
      }
      // Check role
      if (session.user.role !== 'master_practitioner') {
        redirect('/dashboard')
        return
      }
      setIsMasterPractitioner(true)
      setUserName(session.user.name || 'Master Practitioner')
      setUserEmail(session.user.email || '')
      await Promise.all([
        loadModules(session.user.id),
        loadExamConfigurations(session.user.id),
        loadStats(session.user.id)
      ])
    })()
  }, [])

  const loadModules = async (userId: string) => {
    // Only modules created by this master practitioner
    const modulesData = await prisma.module.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        questions: true
      }
    })
    const modulesWithCounts = modulesData.map(module => ({
      id: module.id,
      title: module.title,
      description: module.description,
      created_at: module.createdAt.toISOString(),
      question_count: module.questions.length
    }))
    setModules(modulesWithCounts)
  }

  const loadExamConfigurations = async (userId: string) => {
    const examData = await prisma.examConfiguration.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    const mappedExamData: ExamConfiguration[] = examData.map(exam => ({
      id: exam.id,
      name: exam.name,
      description: exam.description ?? "",
      total_questions: exam.totalQuestions,
      passing_score: exam.passingScore,
      is_active: exam.isActive,
      created_at: exam.createdAt.toISOString()
    }))
    setExamConfigurations(mappedExamData)
  }

  const loadStats = async (userId: string) => {
    // Only students enrolled in this master's modules
    const enrollments = await prisma.moduleEnrollment.findMany({
      where: {
        module: { createdById: userId }
      },
      include: {
        user: {
          include: { profile: true }
        }
      }
    })
    const totalStudents = enrollments.length
    const activeStudents = enrollments.filter(e => e.user.profile?.membershipFeePaid).length
    const completedTests = enrollments.filter(e => e.user.profile?.testCompleted).length
    const scores = enrollments
      .filter(e => e.user.profile?.testCompleted && e.user.profile?.testScore)
      .map(e => e.user.profile!.testScore as number)
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    const passRate = completedTests > 0 ?
      (enrollments.filter(e => e.user.profile?.testCompleted && e.user.profile?.testScore && e.user.profile.testScore >= 70).length / completedTests) * 100 : 0
    setStats({
      totalStudents,
      activeStudents,
      completedTests,
      avgScore,
      passRate
    })
    setIsLoading(false)
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

  if (!isMasterPractitioner) {
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
          userRole="master_practitioner"
          userName={userName}
          userEmail={userEmail}
          isMobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Desktop Sidebar */}
      <DashboardSidebar
        userRole="master_practitioner"
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
          <h1 className="text-lg font-semibold">Master Dashboard</h1>
          <div className="w-8" />
        </div>

        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Master Practitioner Dashboard</h1>
              <p className="text-muted-foreground">
                Manage modules, create questions, generate tests, and oversee student progress.
              </p>
            </div>

            {/* Key Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Modules</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{modules.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Available for students
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Active Exams</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{examConfigurations.filter(e => e.is_active).length}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently available
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Student Success</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.passRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    Pass rate (70%+)
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Avg Score</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.avgScore.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    Across all tests
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks for content and test management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link href="/admin/modules" className="group p-4 bg-gradient-to-br from-blue-50 to-blue-25 rounded-xl border border-blue-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 block">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="font-semibold text-sm mb-1">Manage Modules</div>
                    <div className="text-xs text-muted-foreground">Create and edit learning modules</div>
                  </Link>

                  <Link href="/admin/tests" className="group p-4 bg-gradient-to-br from-green-50 to-green-25 rounded-xl border border-green-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 block">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="font-semibold text-sm mb-1">Create Exams</div>
                    <div className="text-xs text-muted-foreground">Configure exam settings</div>
                  </Link>

                  <Link href="/admin/certificates" className="group p-4 bg-gradient-to-br from-purple-50 to-purple-25 rounded-xl border border-purple-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 block">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Award className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="font-semibold text-sm mb-1">Certificates</div>
                    <div className="text-xs text-muted-foreground">Manage student certifications</div>
                  </Link>

                  <Link href="/admin/student-results" className="group p-4 bg-gradient-to-br from-orange-50 to-orange-25 rounded-xl border border-orange-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 block">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Users className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="font-semibold text-sm mb-1">Student Results</div>
                    <div className="text-xs text-muted-foreground">View and analyze performance</div>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Modules and Tests */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Modules */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Modules</CardTitle>
                    <CardDescription>Modules you've created or modified</CardDescription>
                  </div>
                  <Link href="/admin/modules">
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Module
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {modules.slice(0, 5).map((module) => (
                      <div key={module.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{module.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {module.question_count} questions • Created {new Date(module.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/admin/modules/content?module=${module.id}`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/modules/${module.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                    {modules.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No modules created yet</p>
                        <Link href="/admin/modules">
                          <Button className="mt-2">Create Your First Module</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Exams */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Exams</CardTitle>
                    <CardDescription>Exam configurations you've created</CardDescription>
                  </div>
                  <Link href="/admin/tests">
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Exam
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {examConfigurations.slice(0, 5).map((exam) => (
                      <div key={exam.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{exam.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {exam.total_questions} questions • Passing: {exam.passing_score}% • Created {new Date(exam.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={exam.is_active ? "default" : "secondary"}>
                            {exam.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Link href={`/admin/tests/${exam.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                    {examConfigurations.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No exams created yet</p>
                        <Link href="/admin/tests">
                          <Button className="mt-2">Create Your First Exam</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Student Performance Overview */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Student Performance Overview</CardTitle>
                <CardDescription>Quick insights into student progress and engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Active Students</span>
                      <span className="font-medium">{stats.activeStudents}/{stats.totalStudents}</span>
                    </div>
                    <Progress value={(stats.activeStudents / stats.totalStudents) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Students with active memberships
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Test Completion</span>
                      <span className="font-medium">{stats.completedTests}/{stats.activeStudents}</span>
                    </div>
                    <Progress value={(stats.completedTests / stats.activeStudents) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Students who completed tests
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span className="font-medium">{stats.passRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={stats.passRate} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Students passing with 70%+
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
