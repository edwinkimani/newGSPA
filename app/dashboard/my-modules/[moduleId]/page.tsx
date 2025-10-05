"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, BookOpen, FileText, Video, CheckCircle, Play, ExternalLink, AlertCircle, Timer } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { useSession } from "next-auth/react"

interface Module {
  id: string
  title: string
  description: string
  instructor_name: string
  duration_hours: number
}

interface Enrollment {
  id: string
  exam_date: string | null
  progress_percentage: number
  payment_status: string
  exam_completed: boolean
  exam_score: number | null
  completedSubTopics: string[]
}

interface Level {
  id: string
  title: string
  description: string
  order_index: number
  is_active: boolean
  estimated_duration: number
  level_test_id?: string
  contents_count?: number
  completed_contents?: number
}

interface UserProgress {
  content_id: string
  completed: boolean
  completed_at: string | null
}

export default function ModuleDetailPage() {
  const { moduleId } = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [module, setModule] = useState<Module | null>(null)
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [levels, setLevels] = useState<Level[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (moduleId && session?.user?.id) {
      fetchModuleData()
    } else if (!session?.user?.id) {
      // If no session, set loading to false to show the UI
      setIsLoading(false)
    }
  }, [moduleId, session?.user?.id]) // Use session.user.id instead of session to prevent unnecessary re-renders

  const fetchModuleData = async () => {
    try {
      setIsLoading(true)
      setAccessDenied(false)

      console.log('ModuleDetailPage: Fetching data for moduleId:', moduleId, 'Type:', typeof moduleId)

      // Get module details from API
      let moduleRes = await fetch(`/api/modules/${moduleId}`)
      console.log('ModuleDetailPage: Module API response status:', moduleRes.status, 'for moduleId:', moduleId)

      // If not found and moduleId looks like a title/slug, try to find by title
      if (moduleRes.status === 404 && moduleId && typeof moduleId === 'string' && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(moduleId)) {
        console.log('ModuleDetailPage: moduleId is not a UUID, trying to find by title')
        // Try to find module by title (convert slug back to title)
        const titleFromSlug = moduleId.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
        console.log('ModuleDetailPage: Searching for title:', titleFromSlug)

        // Get all modules and find by title
        const allModulesRes = await fetch('/api/modules?active=true')
        if (allModulesRes.ok) {
          const allModules = await allModulesRes.json()
          const foundModule = allModules.find((m: any) =>
            m.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === moduleId.toLowerCase() ||
            m.title.toLowerCase() === titleFromSlug.toLowerCase()
          )
          if (foundModule) {
            console.log('ModuleDetailPage: Found module by title:', foundModule.id)
            moduleRes = await fetch(`/api/modules/${foundModule.id}`)
          }
        }
      }

      if (!moduleRes.ok) {
        if (moduleRes.status === 404) {
          console.log('ModuleDetailPage: Module not found')
          setAccessDenied(true)
          return
        }
        throw new Error('Failed to fetch module')
      }
      const moduleData = await moduleRes.json()
      setModule({
        ...moduleData,
        instructor_name: moduleData.instructorName,
        duration_hours: moduleData.estimatedDuration
      })

      // Get enrollment details from API
      const enrollmentRes = await fetch(`/api/user-enrollments?userId=${session?.user?.id}`)
      if (!enrollmentRes.ok) {
        console.error('Failed to fetch enrollments')
        setAccessDenied(true)
        return
      }
      
      const enrollmentsData = await enrollmentRes.json()
      console.log('All enrollments data:', enrollmentsData)
      const enrollmentData = enrollmentsData.find((e: any) => e.moduleId === moduleId)
      console.log('Found enrollment data:', enrollmentData)

      if (!enrollmentData) {
        setAccessDenied(true)
        return
      }

      // User is already verified as enrolled with completed payment from enrolled-modules page
      setEnrollment(enrollmentData)

      // Get module levels from API regardless of payment status
      const levelsRes = await fetch(`/api/levels?moduleId=${moduleId}`)
      if (levelsRes.ok) {
        const levelsData = await levelsRes.json()

        // Process levels with progress information
        const levelsWithProgress = levelsData.map((level: any) => {
          const subtopicCount = level.subTopics?.length || 0
          const subtopicIds = level.subTopics?.map((st: any) => st.id) || []
          // Ensure completedSubTopics is always an array
          let completedSubTopics: string[] = []
          try {
            const rawData = enrollmentData?.completedSubTopics
            if (Array.isArray(rawData)) {
              completedSubTopics = rawData
            } else if (rawData && typeof rawData === 'string') {
              completedSubTopics = JSON.parse(rawData)
            } else if (rawData && typeof rawData === 'object') {
              // Handle case where it's already parsed but not an array
              completedSubTopics = Array.isArray(rawData) ? rawData : []
            }
          } catch (error) {
            console.warn('Error parsing completedSubTopics:', error)
            completedSubTopics = []
          }
          console.log('Processing level:', level.title, 'completedSubTopics:', completedSubTopics, 'type:', typeof completedSubTopics)
          const completedContents = subtopicIds.filter((id: string) => completedSubTopics.includes(id)).length

          return {
            ...level,
            contents_count: subtopicCount,
            completed_contents: completedContents
          }
        })
        setLevels(levelsWithProgress)
      }

      // Get user progress for all content if enrollment exists
      if (enrollmentData?.id) {
        const { data: progressData, error: progressError } = await supabase
          .from('user_progress')
          .select('content_id, completed, completed_at')
          .eq('user_id', session?.user?.id)
          .eq('enrollment_id', enrollmentData.id)

        if (!progressError && progressData) {
          setUserProgress(progressData)
        }
      }

    } catch (error) {
      console.error('Error fetching module data:', error)
      setAccessDenied(true)
    } finally {
      setIsLoading(false)
    }
  }

  const markContentComplete = async (contentId: string) => {
    if (!enrollment || !session?.user?.id) {
      alert('Please log in to access course content.')
      return
    }

    try {
      const existingProgress = userProgress.find(p => p.content_id === contentId)

      if (existingProgress) {
        // Update existing progress
        const { error } = await supabase
          .from('user_progress')
          .update({
            completed: true,
            completed_at: new Date().toISOString()
          })
          .eq('user_id', session.user.id)
          .eq('content_id', contentId)

        if (error) throw error
      } else {
        // Create new progress record
        const { error } = await supabase
          .from('user_progress')
          .insert({
            user_id: session.user.id,
            enrollment_id: enrollment.id,
            content_id: contentId,
            completed: true,
            completed_at: new Date().toISOString()
          })

        if (error) throw error
      }

      // Update local state
      setUserProgress(prev => {
        const existing = prev.find(p => p.content_id === contentId)
        if (existing) {
          return prev.map(p =>
            p.content_id === contentId
              ? { ...p, completed: true, completed_at: new Date().toISOString() }
              : p
          )
        } else {
          return [...prev, {
            content_id: contentId,
            completed: true,
            completed_at: new Date().toISOString()
          }]
        }
      })

      // Update enrollment progress
      await updateEnrollmentProgress()

    } catch (error) {
      console.error('Error marking content complete:', error)
      alert('Error updating progress. Please try again.')
    }
  }

  const updateEnrollmentProgress = async () => {
    if (!enrollment || !session?.user?.id) return

    try {
      const enrollmentRes = await fetch(`/api/user-enrollments?userId=${session.user.id}`)
      if (enrollmentRes.ok) {
        const enrollmentsData = await enrollmentRes.json()
        const updatedEnrollment = enrollmentsData.find((e: any) => e.moduleId === moduleId)
        if (updatedEnrollment) {
          setEnrollment(updatedEnrollment)
        }
      }
    } catch (error) {
      console.error('Error refreshing enrollment progress:', error)
    }
  }


  // Countdown Timer Component
  const ExamCountdown = ({ examDate }: { examDate: string }) => {
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null)

    useEffect(() => {
      const calculateTimeLeft = () => {
        const now = new Date().getTime()
        const exam = new Date(examDate).getTime()
        const difference = exam - now

        if (difference > 0) {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000)
          })
        } else {
          setTimeLeft(null)
        }
      }

      calculateTimeLeft()
      const timer = setInterval(calculateTimeLeft, 1000)

      return () => clearInterval(timer)
    }, [examDate])

    if (!timeLeft) {
      return (
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">Exam Available Now!</div>
          <p className="text-sm text-muted-foreground">You can take your exam anytime</p>
        </div>
      )
    }

    return (
      <div className="text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{timeLeft.days}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Days</div>
          </div>
          <div className="text-2xl font-bold text-muted-foreground">:</div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{timeLeft.hours}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Hours</div>
          </div>
          <div className="text-2xl font-bold text-muted-foreground">:</div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{timeLeft.minutes}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Minutes</div>
          </div>
          <div className="text-2xl font-bold text-muted-foreground">:</div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{timeLeft.seconds}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Seconds</div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Until your exam becomes available</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in to access this module.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (accessDenied || !module) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="max-w-md text-center">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Module not found or you don't have access.
              {moduleId && <div className="mt-2 text-sm font-mono bg-muted p-2 rounded">Module ID: {moduleId}</div>}
            </AlertDescription>
          </Alert>
          <Button asChild>
            <Link href="/dashboard/enrolled-modules">Back to My Modules</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Calculate total subtopics
  const totalSubtopics = levels.reduce((total, level) => total + (level.contents_count ?? 0), 0)

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Module Header */}
        <div className="mb-8">
          <Button variant="outline" onClick={() => router.push('/dashboard/enrolled-modules')} className="mb-4">
            ← Back to My Modules
          </Button>

          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 mb-6">
            <h1 className="text-3xl font-bold mb-2">{module.title}</h1>
            <p className="text-muted-foreground mb-4">{module.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>Instructor: {module.instructor_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{module.duration_hours} hours</span>
              </div>
              {enrollment?.exam_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Exam: {format(new Date(enrollment.exam_date), "PPP")}</span>
                </div>
              )}
            </div>
          </div>


          {/* Progress Overview */}
          {enrollment && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {enrollment.progress_percentage}% complete
                    </span>
                  </div>
                  <Progress value={enrollment.progress_percentage} className="h-3 bg-gray-200" />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Levels:</span>
                      <span className="font-medium ml-2">
                        {levels.filter(l => l.completed_contents === l.contents_count).length}/{levels.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Subtopics:</span>
                      <span className="font-medium ml-2">
                        {enrollment.completedSubTopics?.length || 0}/{totalSubtopics}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={enrollment.progress_percentage === 100 ? "default" : "secondary"} className="ml-2">
                        {enrollment.progress_percentage === 100 ? "Complete" : "In Progress"}
                      </Badge>
                    </div>
                    {enrollment.exam_completed && (
                      <div>
                        <span className="text-muted-foreground">Exam:</span>
                        <Badge variant="default" className="ml-2 bg-green-600">
                          Passed ({enrollment.exam_score}%)
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Exam Countdown - Show when module is 100% complete */}
                  {enrollment.progress_percentage === 100 && enrollment.exam_date && !enrollment.exam_completed && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-3">
                        <Timer className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100">Exam Countdown</h3>
                      </div>
                      <ExamCountdown examDate={enrollment.exam_date} />
                    </div>
                  )}

                  {/* Module Complete Message */}
                  {enrollment.progress_percentage === 100 && enrollment.exam_completed && (
                    <Alert className="mt-4 border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        🎉 Congratulations! You've completed this module and passed the final exam.
                        Your certificate will be available within 48 hours.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Course Levels */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Course Levels</h2>

          {levels.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Content Coming Soon</h3>
                <p className="text-muted-foreground">This module is being prepared. Please check back later for the course content.</p>
              </CardContent>
            </Card>
          ) : (
            levels.map((level, index) => {
              const contentsCount = level.contents_count ?? 0
              const completedContents = level.completed_contents ?? 0
              const progress = contentsCount > 0 ? Math.round((completedContents / contentsCount) * 100) : 0
              const isCompleted = progress === 100
              const isAccessible = index === 0 || (levels[index - 1]?.completed_contents === levels[index - 1]?.contents_count)

              return (
                <Card key={level.id} className={`transition-all hover:shadow-lg ${
                  isCompleted ? 'bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-800' : ''
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isCompleted ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' : 'bg-primary/10 text-primary'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          <BookOpen className="h-6 w-6" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">{level.title}</h3>
                            {level.description && (
                              <p className="text-muted-foreground mb-2">{level.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={isCompleted ? "default" : "secondary"}>
                              {isCompleted ? "Completed" : "In Progress"}
                            </Badge>
                            {isCompleted && level.level_test_id && (
                              <Badge variant="outline" className="text-blue-600 border-blue-300">
                                Test Available
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          {level.estimated_duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {level.estimated_duration} min
                            </span>
                          )}
                          <span>Level {index + 1}</span>
                          <span>{completedContents}/{level.contents_count} subtopics completed</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{progress}% complete</span>
                          </div>
                          <Progress value={progress} className="h-2 bg-gray-200" />
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-sm text-muted-foreground">
                            {isCompleted ? (
                              <span className="text-green-600 dark:text-green-400 font-medium">✓ All subtopics completed</span>
                            ) : (
                              <span>{(level.contents_count ?? 0) - completedContents} subtopics remaining</span>
                            )}
                          </div>

                          <div className="flex gap-2">
                            {!isAccessible && !isCompleted ? (
                              <Badge variant="outline" className="text-orange-600">
                                Complete previous level first
                              </Badge>
                            ) : (
                              <Button
                                asChild
                                disabled={!isAccessible && !isCompleted}
                                variant={isCompleted ? "outline" : "default"}
                              >
                                <Link href={`/dashboard/my-modules/${moduleId}/levels/${level.id}`}>
                                  {isCompleted ? 'Review Level' : 'Start Level'}
                                </Link>
                              </Button>
                            )}
                            {isCompleted && level.level_test_id && enrollment?.payment_status === 'COMPLETED' && (
                              <Button
                                asChild
                                variant="default"
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Link href={`/dashboard/my-modules/${moduleId}/levels/${level.id}/test`}>
                                  Take Level Test
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Exam Information */}
        {enrollment?.exam_date && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Final Exam Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">Exam Date:</span>
                    <Badge variant="outline" className="text-base px-3 py-1">
                      {format(new Date(enrollment.exam_date), "PPP")}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">Status:</span>
                    <Badge variant={enrollment.exam_completed ? "default" : "secondary"} className="px-3 py-1">
                      {enrollment.exam_completed ? "Completed" : "Scheduled"}
                    </Badge>
                  </div>
                </div>

                {enrollment.exam_completed ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      🎉 Exam completed successfully with a score of {enrollment.exam_score}%!
                      Your certificate will be available within 48 hours.
                    </AlertDescription>
                  </Alert>
                ) : enrollment.progress_percentage === 100 ? (
                  <div className="space-y-4">
                    <Alert className="border-blue-200 bg-blue-50">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        Congratulations! You've completed all coursework. Your final exam is now available.
                      </AlertDescription>
                    </Alert>

                    {/* Exam Countdown */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <ExamCountdown examDate={enrollment.exam_date} />
                    </div>

                    {/* Take Exam Button - only show if exam date has passed */}
                    {new Date() >= new Date(enrollment.exam_date) && (
                      <Button
                        asChild
                        className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
                        size="lg"
                      >
                        <Link href={`/dashboard/my-modules/${moduleId}/test`}>
                          Take Final Exam
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      Complete all levels and subtopics to unlock your final exam.
                      You can take the exam on or after the scheduled date.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}