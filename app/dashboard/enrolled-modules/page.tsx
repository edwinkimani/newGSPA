"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, BookOpen, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"

interface Enrollment {
  id: string
  enrollmentDate: string
  progressPercentage: number
  paymentStatus: string
  examDate?: string
  module: {
    id: string
    title: string
    description: string
    category: string
    difficultyLevel: string
    estimatedDuration?: number
    instructorName?: string
    price: number
    currency: string
  }
}

export default function EnrolledModulesPage() {
  const { data: session } = useSession()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchEnrollments()
    }
  }, [session])

  const fetchEnrollments = async () => {
    try {
      const res = await fetch(`/api/user-enrollments?userId=${session?.user?.id}`)
      if (res.ok) {
        const data = await res.json()
        console.log('EnrolledModulesPage: Raw enrollment data:', data)
        // Only show enrollments with completed payment status
        const completedEnrollments = data.filter((enrollment: Enrollment) => enrollment.paymentStatus === 'COMPLETED')
        console.log('EnrolledModulesPage: Filtered enrollments:', completedEnrollments)
        setEnrollments(completedEnrollments)
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage === 100) return "bg-green-500"
    if (percentage >= 50) return "bg-blue-500"
    return "bg-yellow-500"
  }

  const getStatusBadge = (enrollment: Enrollment) => {
    if (enrollment.progressPercentage === 100) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Completed</Badge>
    } else if (enrollment.progressPercentage > 0) {
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">In Progress</Badge>
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Not Started</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (enrollments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">No Enrolled Modules</h1>
          <p className="text-muted-foreground mb-6">
            You haven't enrolled in any modules yet. Browse available modules to get started with your learning journey.
          </p>
          <Button asChild>
            <Link href="/modules">
              Browse Modules
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Enrolled Modules</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments.map((enrollment) => (
          <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge variant="outline">{enrollment.module.category}</Badge>
                {getStatusBadge(enrollment)}
              </div>
              <CardTitle className="text-xl">{enrollment.module.title}</CardTitle>
              <CardDescription>
                {enrollment.module.description.substring(0, 100)}...
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{enrollment.progressPercentage}%</span>
                </div>
                <Progress
                  value={enrollment.progressPercentage}
                  className="h-2"
                />
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{enrollment.module.estimatedDuration}h</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{enrollment.module.difficultyLevel}</span>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <strong>Instructor:</strong> {enrollment.module.instructorName || 'TBD'}
              </div>

              <div className="text-sm text-muted-foreground">
                <strong>Enrolled:</strong> {new Date(enrollment.enrollmentDate).toLocaleDateString()}
              </div>

              {enrollment.examDate && (
                <div className="text-sm text-muted-foreground">
                  <strong>Exam Date:</strong> {new Date(enrollment.examDate).toLocaleDateString()}
                </div>
              )}

              <div className="pt-2">
                <Button asChild className="w-full">
                  <Link
                    href={`/dashboard/my-modules/${enrollment.module.id}`}
                    onClick={() => console.log('EnrolledModulesPage: Clicking module link for:', enrollment.module.id, 'Title:', enrollment.module.title)}
                  >
                    {enrollment.progressPercentage === 100 ? 'Review Module' : 'Continue Learning'}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
