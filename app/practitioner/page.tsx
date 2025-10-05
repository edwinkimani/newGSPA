"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  BookOpen,
  CreditCard,
  Calendar,
  CheckCircle,
  Clock,
  Menu,
  TrendingUp,
  Award,
  Play,
  FileText,
  DollarSign
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Module {
  id: string
  title: string
  description: string
  price: number
  currency: string
  category: string
  difficultyLevel: string
  estimatedDuration: number
  instructorName: string
}

interface ModuleEnrollment {
  id: string
  moduleId: string
  module: Module
  enrollmentDate: string
  paymentStatus: string
  progressPercentage: number
  examDate: string | null
  examCompleted: boolean
  examScore: number | null
  completedAt: string | null
}

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
}

export default function PractitionerDashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [enrollments, setEnrollments] = useState<ModuleEnrollment[]>([])
  const [availableModules, setAvailableModules] = useState<Module[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMasterPractitioner, setIsMasterPractitioner] = useState(false)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [examDate, setExamDate] = useState("")
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] = useState<ModuleEnrollment | null>(null)

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
        setUserName(`${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Master Practitioner')
        setUserEmail(profile.email || '')
        setUser(profile)

        // Load user's enrollments
        await loadEnrollments(profile.id)

        // Load available modules
        await loadAvailableModules()

      } catch (error) {
        console.error('Error loading data:', error)
        setIsMasterPractitioner(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkMasterPractitionerAndLoadData()
  }, [router])

  const loadEnrollments = async (userId: string) => {
    try {
      const response = await fetch(`/api/user-enrollments?userId=${userId}`)
      if (response.ok) {
        const enrollmentsData = await response.json()
        setEnrollments(enrollmentsData)
      }
    } catch (error) {
      console.error('Error loading enrollments:', error)
    }
  }

  const loadAvailableModules = async () => {
    try {
      const response = await fetch('/api/modules?active=true')
      if (response.ok) {
        const modulesData = await response.json()
        // Filter out already enrolled modules
        const enrolledModuleIds = enrollments.map(e => e.moduleId)
        const available = modulesData.filter((module: Module) =>
          !enrolledModuleIds.includes(module.id)
        )
        setAvailableModules(available)
      }
    } catch (error) {
      console.error('Error loading modules:', error)
    }
  }

  const handlePurchaseModule = (module: Module) => {
    // Redirect to payment page
    router.push(`/payment?type=module&moduleId=${module.id}`)
  }

  const handleScheduleExam = async () => {
    if (!selectedEnrollment || !examDate) return

    try {
      const response = await fetch(`/api/user-enrollments/${selectedEnrollment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examDate })
      })

      if (response.ok) {
        // Reload enrollments
        if (user) {
          await loadEnrollments(user.id)
        }
        setShowScheduleDialog(false)
        setExamDate("")
        setSelectedEnrollment(null)
      }
    } catch (error) {
      console.error('Error scheduling exam:', error)
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-blue-600"
    if (percentage >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  const CircularProgress = ({ percentage, size = 80 }: { percentage: number, size?: number }) => {
    const radius = (size - 10) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            className="text-muted-foreground/20"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={`${getProgressColor(percentage)} transition-all duration-300`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-sm font-semibold ${getProgressColor(percentage)}`}>
            {percentage}%
          </span>
        </div>
      </div>
    )
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

  if (!user) {
    return (
      <div className="min-h-screen flex">
        <div className="flex-1 flex items-center justify-center">
          <Alert variant="destructive">
            <AlertDescription>Please complete your registration first.</AlertDescription>
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
          <h1 className="text-lg font-semibold">Practitioner Learning</h1>
          <div className="w-8" />
        </div>

        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">My Learning Dashboard</h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Track your progress, access course materials, and schedule exams for your enrolled modules.
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Enrolled Modules</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{enrollments.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Modules</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {enrollments.filter(e => e.completedAt).length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {enrollments.length > 0
                      ? Math.round(enrollments.reduce((sum, e) => sum + e.progressPercentage, 0) / enrollments.length)
                      : 0
                    }%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Scheduled Exams</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {enrollments.filter(e => e.examDate).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enrolled Modules */}
            {enrollments.length > 0 && (
              <div className="mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>My Enrolled Modules</CardTitle>
                    <CardDescription>Track your progress and access course materials</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {enrollments.map((enrollment) => (
                        <Card key={enrollment.id} className="group hover:shadow-lg transition-all duration-300">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                                  {enrollment.module.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {enrollment.module.category} • {enrollment.module.difficultyLevel}
                                </p>
                              </div>
                              <div className="ml-4">
                                <CircularProgress percentage={enrollment.progressPercentage} />
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span className={getProgressColor(enrollment.progressPercentage)}>
                                  {enrollment.progressPercentage}%
                                </span>
                              </div>
                              <Progress value={enrollment.progressPercentage} className="h-2" />

                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{enrollment.module.estimatedDuration} hours</span>
                              </div>

                              {enrollment.examDate && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="h-4 w-4 text-blue-500" />
                                  <span className="text-blue-600">
                                    Exam: {new Date(enrollment.examDate).toLocaleDateString()}
                                  </span>
                                </div>
                              )}

                              {enrollment.examCompleted && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Award className="h-4 w-4 text-green-500" />
                                  <span className="text-green-600">
                                    Score: {enrollment.examScore}%
                                  </span>
                                </div>
                              )}

                              <div className="flex gap-2 pt-2">
                                <Button asChild size="sm" className="flex-1">
                                  <Link href={`/dashboard/my-modules/${enrollment.moduleId}`}>
                                    <Play className="h-4 w-4 mr-2" />
                                    Continue Learning
                                  </Link>
                                </Button>

                                {!enrollment.examDate && !enrollment.examCompleted && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedEnrollment(enrollment)
                                      setShowScheduleDialog(true)
                                    }}
                                  >
                                    <Calendar className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Available Modules */}
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Available Modules</CardTitle>
                  <CardDescription>Explore and enroll in new training modules</CardDescription>
                </CardHeader>
                <CardContent>
                  {availableModules.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No additional modules available at this time.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {availableModules.slice(0, 6).map((module) => (
                        <Card key={module.id} className="group hover:shadow-lg transition-all duration-300">
                          <CardContent className="p-6">
                            <div className="mb-4">
                              <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                                {module.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {module.description}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                <Clock className="h-4 w-4" />
                                <span>{module.estimatedDuration} hours</span>
                                <Badge variant="outline" className="ml-auto">
                                  {module.difficultyLevel}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mb-4">
                              <div className="text-2xl font-bold text-primary">
                                ${module.currency === 'USD' ? module.price : Math.round(module.price / 130)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {module.instructorName}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="flex-1">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>{module.title}</DialogTitle>
                                    <DialogDescription>{module.description}</DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <strong>Duration:</strong> {module.estimatedDuration} hours
                                      </div>
                                      <div>
                                        <strong>Difficulty:</strong> {module.difficultyLevel}
                                      </div>
                                      <div>
                                        <strong>Category:</strong> {module.category}
                                      </div>
                                      <div>
                                        <strong>Instructor:</strong> {module.instructorName}
                                      </div>
                                    </div>
                                    <div className="border-t pt-4">
                                      <div className="flex items-center justify-between">
                                        <div className="text-xl font-bold text-primary">
                                          ${module.currency === 'USD' ? module.price : Math.round(module.price / 130)}
                                        </div>
                                        <Button onClick={() => handlePurchaseModule(module)}>
                                          <CreditCard className="h-4 w-4 mr-2" />
                                          Purchase Module
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Button size="sm" onClick={() => handlePurchaseModule(module)}>
                                <DollarSign className="h-4 w-4 mr-2" />
                                Buy
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {availableModules.length > 6 && (
                    <div className="text-center mt-6">
                      <Button asChild variant="outline">
                        <Link href="/modules">
                          View All Modules
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Exam Scheduling Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Final Exam</DialogTitle>
            <DialogDescription>
              Choose a date for your final exam for {selectedEnrollment?.module.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="exam-date">Exam Date</Label>
              <Input
                id="exam-date"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                min={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleScheduleExam} disabled={!examDate}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Exam
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
