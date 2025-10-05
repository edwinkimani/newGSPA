"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Award,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Calendar,
  Trophy,
  Star,
  BookOpen
} from "lucide-react"
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
  certificate_url: string | null
  certificate_available_at: string | null
  created_at: string
}

interface TestAttempt {
  id: string
  score: number
  total_questions: number
  passed: boolean
  completed_at: string
}

interface ModuleCertificate {
  id: string
  moduleId: string
  moduleTitle: string
  moduleDescription: string
  enrollmentDate: string
  completedAt: string | null
  certificateIssued: boolean
  certificateUrl: string | null
  progressPercentage: number
  examCompleted: boolean
  examScore: number | null
  examDate: string | null
}

export default function CertificatePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [testAttempt, setTestAttempt] = useState<TestAttempt | null>(null)
  const [moduleCertificates, setModuleCertificates] = useState<ModuleCertificate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUserData = async () => {
      // Use the same authentication as other dashboard pages
      const res = await fetch('/api/auth/user-dashboard')
      if (res.status === 401) {
        router.push("/auth/login")
        return
      }
      if (!res.ok) {
        router.push("/register")
        return
      }

      const { profile, testAttempt, enrollments } = await res.json()

      setUser(profile)
      setTestAttempt(testAttempt)

      // Process module certificates from enrollments
      if (enrollments) {
        const certificates: ModuleCertificate[] = enrollments.map((enrollment: any) => ({
          id: enrollment.id,
          moduleId: enrollment.module_id,
          moduleTitle: enrollment.module_title,
          moduleDescription: enrollment.module?.description || '',
          enrollmentDate: enrollment.enrollment_date || enrollment.created_at,
          completedAt: enrollment.completed_at,
          certificateIssued: enrollment.certificate_issued || false,
          certificateUrl: enrollment.certificate_url,
          progressPercentage: enrollment.progress_percentage || 0,
          examCompleted: enrollment.exam_completed || false,
          examScore: enrollment.exam_score,
          examDate: enrollment.exam_date
        }))
        setModuleCertificates(certificates)
      }

      setIsLoading(false)
    }

    getUserData()
  }, [router])

  const checkAndIssueCertificate = async () => {
    if (!user || !user.certificate_available_at) return

    const now = new Date()
    const availableAt = new Date(user.certificate_available_at)

    if (now >= availableAt && !user.certificate_issued) {
      try {
        const response = await fetch(`/api/users/${user.id}/issue-certificate`, {
          method: 'POST'
        })
        if (!response.ok) {
          throw new Error('Failed to issue certificate')
        }

        // Update local state
        setUser((prev) =>
          prev ? { ...prev, certificate_issued: true, certificate_url: `certificate-${user.id}.pdf` } : null,
        )
      } catch (error) {
        console.error("Certificate issuance error:", error)
      }
    }
  }

  const generateCertificate = async (certificate: ModuleCertificate) => {
    if (!user) return

    try {
      // Check if module is completed and certificate can be issued
      if (certificate.progressPercentage < 100) {
        alert("Module must be 100% completed to generate certificate.")
        return
      }

      if (!certificate.examCompleted) {
        alert("Module exam must be completed to generate certificate.")
        return
      }

      if (certificate.examScore && certificate.examScore < 70) {
        alert("Exam score must be at least 70% to generate certificate.")
        return
      }

      // In a real implementation, you'd generate a PDF certificate for this specific module
      // The certificate would include:
      // - Module title and description
      // - User's name and completion date
      // - Exam score and pass status
      // - GSPA branding and signatures

      console.log("Generating certificate for module:", certificate)
      alert(`Certificate for "${certificate.moduleTitle}" generated successfully! (PDF generation would be implemented here)`)
    } catch (error) {
      console.error("Certificate generation error:", error)
      alert("Error generating certificate. Please try again.")
    }
  }

  const downloadCertificate = () => {
    // In a real implementation, this would download the actual PDF
    alert("Certificate download feature would be implemented here with a PDF generation service.")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-8">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>Please complete your registration first.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const canGenerateCertificate = user.test_completed && testAttempt?.passed
  const isCertificateAvailable = user.certificate_issued
  const certificateReady = isCertificateAvailable || (canGenerateCertificate && user.certificate_available_at &&
    new Date() >= new Date(user.certificate_available_at))

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">My Certificates</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            View and download certificates earned from completing training modules.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Module Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Module Overview
              </CardTitle>
              <CardDescription>
                Your progress across enrolled training modules.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">
                    {moduleCertificates.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Enrolled</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="text-xl font-bold text-green-600">
                    {moduleCertificates.filter(c => c.progressPercentage === 100).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">
                    {moduleCertificates.filter(c => c.certificateIssued).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Certified</div>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <div className="text-xl font-bold text-orange-600">
                    {moduleCertificates.filter(c => c.progressPercentage < 100).length}
                  </div>
                  <div className="text-xs text-muted-foreground">In Progress</div>
                </div>
              </div>

              {moduleCertificates.length === 0 && (
                <div className="text-center py-6">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No module enrollments yet</p>
                  <Button asChild size="sm">
                    <a href="/modules">Browse Modules</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>


          {/* Certificate Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Certificate Summary
              </CardTitle>
              <CardDescription>
                Overview of your certificate achievements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {moduleCertificates.filter(c => c.certificateIssued).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Certificates Earned</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {moduleCertificates.filter(c => c.progressPercentage === 100 && !c.certificateIssued).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Ready to Generate</div>
                  </div>
                </div>

                {moduleCertificates.length === 0 && (
                  <Alert>
                    <AlertDescription>
                      No module enrollments found. Complete some training modules to earn certificates.
                    </AlertDescription>
                  </Alert>
                )}

                {moduleCertificates.filter(c => c.progressPercentage < 100).length > 0 && (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      {moduleCertificates.filter(c => c.progressPercentage < 100).length} module(s) still in progress.
                      Complete them to earn certificates.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Module Certificates */}
        {moduleCertificates.length > 0 && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Module Certificates
                </CardTitle>
                <CardDescription>
                  Certificates earned from completing training modules.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {moduleCertificates.map((certificate) => (
                    <Card key={certificate.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg mb-1">{certificate.moduleTitle}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {certificate.moduleDescription}
                            </p>
                          </div>
                          {certificate.certificateIssued ? (
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Clock className="h-5 w-5 text-yellow-600" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{certificate.progressPercentage}%</span>
                          </div>
                          <Progress value={certificate.progressPercentage} className="h-2" />

                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Enrolled</span>
                            <span>{new Date(certificate.enrollmentDate).toLocaleDateString()}</span>
                          </div>

                          {certificate.completedAt && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Completed</span>
                              <span>{new Date(certificate.completedAt).toLocaleDateString()}</span>
                            </div>
                          )}

                          {certificate.examCompleted && certificate.examScore && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Exam Score</span>
                              <Badge variant={certificate.examScore >= 70 ? "default" : "destructive"}>
                                {certificate.examScore}%
                              </Badge>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <Badge variant={certificate.certificateIssued ? "default" : certificate.progressPercentage === 100 ? "outline" : "secondary"}>
                            {certificate.certificateIssued ? "Certificate Issued" :
                             certificate.progressPercentage === 100 ? "Ready to Generate" : "In Progress"}
                          </Badge>

                          <div className="flex gap-2">
                            {certificate.certificateIssued && certificate.certificateUrl && (
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            )}

                            {!certificate.certificateIssued && certificate.progressPercentage === 100 &&
                             certificate.examCompleted && (!certificate.examScore || certificate.examScore >= 70) && (
                              <Button size="sm" onClick={() => generateCertificate(certificate)}>
                                <Award className="h-4 w-4 mr-2" />
                                Generate
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

      </div>
    </div>
  )
}
