"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Target,
  X
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Module {
  id: string
  title: string
  description: string
  created_at: string
  question_count: number
  level_count?: number
}

interface Level {
  id: string
  title: string
  description: string
  orderIndex: number
  isActive: boolean
  estimatedDuration: number
  created_at: string
  content_count?: number
  has_test?: boolean
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
  const [levels, setLevels] = useState<Level[]>([])
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
    const checkMasterPractitionerAndLoadData = async () => {
      try {
        setIsLoading(true)
        
        // Check authentication via API
        const authRes = await fetch('/api/auth/user')
        if (authRes.status === 401) {
          router.push('/auth/login')
          return
        }
        
        if (!authRes.ok) {
          throw new Error('Failed to fetch user data')
        }
        
        const authData = await authRes.json()
        const profile = authData.profile
        
        if (!profile) {
          router.push('/register')
          return
        }

        // Check if master practitioner - role info should be included in profile
        if (!profile.roleId || profile.role?.name !== 'master_practitioner') {
          setIsMasterPractitioner(false)
          setIsLoading(false)
          return
        }

        setIsMasterPractitioner(true)
        setUserName(`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Master Practitioner')
        setUserEmail(profile.email || '')

        // Load data
        await Promise.all([
          loadModules(),
          loadLevels(),
          loadExamConfigurations(),
          loadStats()
        ])
      } catch (error) {
        console.error('Error loading data:', error)
        setIsMasterPractitioner(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkMasterPractitionerAndLoadData()
  }, [router])

  const loadModules = async () => {
    try {
      const response = await fetch('/api/modules')
      if (response.ok) {
        const modulesData = await response.json()
        // Get question count and level count for each module
        const modulesWithCounts = await Promise.all(
          modulesData.map(async (module: any) => {
            // For now, we'll use the questions count from the include
            const questionCount = module.questions?.length || 0

            // Try to get level count - handle gracefully if API doesn't exist yet
            let levelCount = 0
            try {
              const levelsResponse = await fetch(`/api/levels?moduleId=${module.id}`)
              if (levelsResponse.ok) {
                const levelsData = await levelsResponse.json()
                levelCount = levelsData.length
              }
            } catch (error) {
              console.warn('Levels API not available yet')
            }

            return {
              ...module,
              question_count: questionCount,
              level_count: levelCount
            }
          })
        )
        setModules(modulesWithCounts)
      } else {
        console.warn('Modules API not available yet')
        setModules([])
      }
    } catch (error) {
      console.error('Error loading modules:', error)
      setModules([])
    }
  }

  const loadLevels = async () => {
    try {
      const response = await fetch('/api/levels')
      if (response.ok) {
        const levelsData = await response.json()
        // The API already includes content and test info
        const levelsWithCounts = levelsData.map((level: any) => ({
          ...level,
          content_count: level.contents?.length || 0,
          has_test: !!level.levelTest,
          module_title: level.module?.title || 'Unknown Module'
        }))
        setLevels(levelsWithCounts)
      } else {
        // API not available yet, set empty array
        console.warn('Levels API not available yet')
        setLevels([])
      }
    } catch (error) {
      console.warn('Levels API not available yet, setting empty levels')
      setLevels([])
    }
  }

  const loadExamConfigurations = async () => {
    try {
      // For now, set empty array since exam configurations API might not exist
      // You can implement this later when the API is ready
      setExamConfigurations([])
    } catch (error) {
      console.warn('Exam configurations not available yet')
      setExamConfigurations([])
    }
  }

  const loadStats = async () => {
    try {
      // Load basic stats - for now use placeholder data
      // You can implement actual API call here when ready
      setStats({
        totalStudents: 0,
        activeStudents: 0,
        completedTests: 0,
        avgScore: 0,
        passRate: 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
      setStats({
        totalStudents: 0,
        activeStudents: 0,
        completedTests: 0,
        avgScore: 0,
        passRate: 0
      })
    }
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
            <Button 
              onClick={() => router.push('/dashboard')} 
              className="mt-4"
            >
              Go to Dashboard
            </Button>
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
          <h1 className="text-lg font-semibold">Master Practitioner Dashboard</h1>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
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
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Total Levels</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{levels.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Learning levels created
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

            {/* Rest of your JSX remains the same */}
            {/* Quick Actions */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks for content and test management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link href="/master-practitioner/modules" className="group p-4 bg-gradient-to-br from-blue-50 to-blue-25 rounded-xl border border-blue-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 block">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="font-semibold text-sm mb-1">Manage Modules</div>
                    <div className="text-xs text-muted-foreground">Create and edit learning modules</div>
                  </Link>

                  <Link href="/master-practitioner/levels" className="group p-4 bg-gradient-to-br from-indigo-50 to-indigo-25 rounded-xl border border-indigo-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 block">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <GraduationCap className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="font-semibold text-sm mb-1">Manage Levels</div>
                    <div className="text-xs text-muted-foreground">Create and organize learning levels</div>
                  </Link>

                  <Link href="/master-practitioner/certificates" className="group p-4 bg-gradient-to-br from-purple-50 to-purple-25 rounded-xl border border-purple-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 block">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Award className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="font-semibold text-sm mb-1">Certificates</div>
                    <div className="text-xs text-muted-foreground">Manage student certifications</div>
                  </Link>

                  <Link href="/master-practitioner/tests" className="group p-4 bg-gradient-to-br from-green-50 to-green-25 rounded-xl border border-green-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 block">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="font-semibold text-sm mb-1">Create Exams</div>
                    <div className="text-xs text-muted-foreground">Configure exam settings</div>
                  </Link>

                  <Link href="/master-practitioner/students" className="group p-4 bg-gradient-to-br from-orange-50 to-orange-25 rounded-xl border border-orange-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 block">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Users className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="font-semibold text-sm mb-1">Student Results</div>
                    <div className="text-xs text-muted-foreground">View and analyze performance</div>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Modules, Levels and Tests */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Modules */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Modules</CardTitle>
                    <CardDescription>Modules you've created or modified</CardDescription>
                  </div>
                  <Link href="/master-practitioner/modules">
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
                            {module.level_count} levels • {module.question_count} questions • Created {new Date(module.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/master-practitioner/modules/${module.id}/content`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/master-practitioner/modules/${module.id}`}>
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
                        <Link href="/master-practitioner/modules">
                          <Button className="mt-2">Create Your First Module</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Levels */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Levels</CardTitle>
                    <CardDescription>Learning levels you've created</CardDescription>
                  </div>
                  <Link href="/master-practitioner/levels">
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Level
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {levels.slice(0, 5).map((level) => (
                      <div key={level.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{level.title}</div>
                          <div className="text-xs text-muted-foreground">
                            Level {level.orderIndex + 1} • {level.content_count} contents • {level.has_test ? 'Has test' : 'No test'} • Created {new Date(level.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={level.isActive ? "default" : "secondary"}>
                            {level.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Link href={`/master-practitioner/levels/${level.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                    {levels.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No levels created yet</p>
                        <Link href="/master-practitioner/levels">
                          <Button className="mt-2">Create Your First Level</Button>
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
                    <Progress value={(stats.activeStudents / Math.max(stats.totalStudents, 1)) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Students with active memberships
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Test Completion</span>
                      <span className="font-medium">{stats.completedTests}/{Math.max(stats.activeStudents, 1)}</span>
                    </div>
                    <Progress value={(stats.completedTests / Math.max(stats.activeStudents, 1)) * 100} className="h-2" />
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
