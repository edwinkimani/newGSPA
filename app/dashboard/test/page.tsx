"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, AlertCircle, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Question {
  id: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  category: string
}

interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  membership_fee_paid: boolean
  payment_status: string
  test_completed: boolean
}

interface OngoingTest {
  id: string
  user_id: string
  questions_data: any[]
  answers_data: Record<string, string>
  current_question: number
  time_left: number
  test_started: boolean
  started_at: string
  updated_at: string
}

export default function DashboardTestPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [user, setUser] = useState<UserProfile | null>(null)
  const [ongoingTest, setOngoingTest] = useState<OngoingTest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(3600) // 60 minutes in seconds
  const [testStarted, setTestStarted] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [testInfo, setTestInfo] = useState({ passingScore: 70, timeLimit: 60, isAssignedExam: false })
  const router = useRouter()
  const supabase = createClient()

  const getRandomQuestions = (allQuestions: Question[], count = 30): Question[] => {
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, Math.min(count, allQuestions.length))
  }

  // Internet connection monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load saved test progress
  useEffect(() => {
    const savedProgress = localStorage.getItem('test-progress')
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress)
        if (progress.userId === user?.id && progress.questions?.length === questions.length) {
          setAnswers(progress.answers || {})
          setCurrentQuestion(progress.currentQuestion || 0)
          setTimeLeft(progress.timeLeft || 3600)
          setTestStarted(progress.testStarted || false)
        }
      } catch (error) {
        console.warn('Failed to load saved test progress:', error)
      }
    }
  }, [user?.id, questions.length])

  // Save test progress periodically
  useEffect(() => {
    const saveProgress = async () => {
      if (user && questions.length > 0) {
        const progressData = {
          user_id: user.id,
          questions_data: questions,
          answers_data: answers,
          current_question: currentQuestion,
          time_left: timeLeft,
          test_started: testStarted,
        }

        if (ongoingTest) {
          // Update existing
          await supabase
            .from("ongoing_tests")
            .update(progressData)
            .eq("id", ongoingTest.id)
        } else if (testStarted || Object.keys(answers).length > 0) {
          // Create new if test started or answers exist
          const { data, error } = await supabase
            .from("ongoing_tests")
            .insert(progressData)
            .select()
            .single()

          if (!error && data) {
            setOngoingTest(data)
          }
        }
      }
    }

    // Save immediately when key dependencies change
    saveProgress()

    // Also save periodically every 30 seconds if test is active
    const interval = testStarted ? setInterval(saveProgress, 30000) : null

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [answers, currentQuestion, timeLeft, testStarted, user, questions, ongoingTest, supabase])

  useEffect(() => {
    const getUserAndQuestions = async () => {
      const paidUserId = localStorage.getItem("paid-user-id")

      if (paidUserId) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", paidUserId)
          .single()

        if (profile && profile.membership_fee_paid && profile.payment_status === "completed") {
          setUser(profile)

          if (profile.test_completed) {
            router.push("/dashboard/results")
            return
          }

          // Check for assigned exam first
          const { data: assignedExam, error: examError } = await supabase
            .from("user_exams")
            .select(`
              *,
              exam_configurations (*)
            `)
            .eq("user_id", paidUserId)
            .eq("is_completed", false)
            .single()

          if (!examError && assignedExam && assignedExam.exam_configurations) {
            const examConfig = assignedExam.exam_configurations

            // Check availability time window
            const now = new Date()
            const availableFrom = assignedExam.available_from ? new Date(assignedExam.available_from) : null
            const availableUntil = assignedExam.available_until ? new Date(assignedExam.available_until) : null

            if ((availableFrom && now < availableFrom) || (availableUntil && now > availableUntil)) {
              alert("This exam is not currently available. Please check the availability time window.")
              router.push("/dashboard")
              return
            }

            // Check for ongoing test
            const { data: ongoing, error: ongoingError } = await supabase
              .from("ongoing_tests")
              .select("*")
              .eq("user_id", paidUserId)
              .single()

            if (!ongoingError && ongoing) {
              // Load ongoing test
              setOngoingTest(ongoing)
              setQuestions(ongoing.questions_data)
              setAnswers(ongoing.answers_data)
              setCurrentQuestion(ongoing.current_question)
              setTestStarted(ongoing.test_started)

              // Calculate remaining time
              if (ongoing.test_started) {
                const elapsed = Math.floor((Date.now() - new Date(ongoing.started_at).getTime()) / 1000)
                const remaining = Math.max(0, ongoing.time_left - elapsed)
                setTimeLeft(remaining)
              } else {
                setTimeLeft(ongoing.time_left)
              }
            } else {
              // Load questions from assigned exam
              const { data: questionsData, error: questionsError } = await supabase
                .from("test_questions")
                .select("*")
                .in("id", examConfig.questions)

              if (questionsError) {
                console.error("Error fetching assigned questions:", questionsError)
                return
              }

              setQuestions(questionsData || [])
              setTimeLeft(examConfig.time_limit)
            }
          } else {
            // Fallback to random questions if no assigned exam
            // Check for ongoing test
            const { data: ongoing, error: ongoingError } = await supabase
              .from("ongoing_tests")
              .select("*")
              .eq("user_id", paidUserId)
              .single()

            if (!ongoingError && ongoing) {
              // Load ongoing test
              setOngoingTest(ongoing)
              setQuestions(ongoing.questions_data)
              setAnswers(ongoing.answers_data)
              setCurrentQuestion(ongoing.current_question)
              setTestStarted(ongoing.test_started)

              // Calculate remaining time
              if (ongoing.test_started) {
                const elapsed = Math.floor((Date.now() - new Date(ongoing.started_at).getTime()) / 1000)
                const remaining = Math.max(0, ongoing.time_left - elapsed)
                setTimeLeft(remaining)
              } else {
                setTimeLeft(ongoing.time_left)
              }
            } else {
              // Get all questions and select random ones
              const { data: questionsData, error: questionsError } = await supabase
                .from("test_questions")
                .select("*")
                .eq("is_active", true)

              if (questionsError) {
                console.error("Error fetching questions:", questionsError)
                return
              }

              const randomQuestions = getRandomQuestions(questionsData || [], 30)
              setQuestions(randomQuestions)
            }
          }
          setIsLoading(false)
          return
        }
      }

      // Fallback to authenticated user flow
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push("/auth/login")
        return
      }

      // Check if admin - handled in layout

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single()

      if (profileError || !profile) {
        router.push("/register")
        return
      }

      setUser(profile)

      if (profile.test_completed) {
        router.push("/dashboard/results")
        return
      }

      if (!profile.membership_fee_paid || profile.payment_status !== "completed") {
        router.push("/dashboard/payment")
        return
      }

      // Check for assigned exam first
      const { data: assignedExam, error: examError } = await supabase
        .from("user_exams")
        .select(`
          *,
          exam_configurations (*)
        `)
        .eq("user_id", authUser.id)
        .eq("is_completed", false)
        .single()

      if (!examError && assignedExam && assignedExam.exam_configurations) {
        const examConfig = assignedExam.exam_configurations

        // Check availability time window
        const now = new Date()
        const availableFrom = assignedExam.available_from ? new Date(assignedExam.available_from) : null
        const availableUntil = assignedExam.available_until ? new Date(assignedExam.available_until) : null

        if ((availableFrom && now < availableFrom) || (availableUntil && now > availableUntil)) {
          alert("This exam is not currently available. Please check the availability time window.")
          router.push("/dashboard")
          return
        }

        // Check for ongoing test
        const { data: ongoing, error: ongoingError } = await supabase
          .from("ongoing_tests")
          .select("*")
          .eq("user_id", authUser.id)
          .single()

        if (!ongoingError && ongoing) {
          // Load ongoing test
          setOngoingTest(ongoing)
          setQuestions(ongoing.questions_data)
          setAnswers(ongoing.answers_data)
          setCurrentQuestion(ongoing.current_question)
          setTestStarted(ongoing.test_started)

          // Calculate remaining time
          if (ongoing.test_started) {
            const elapsed = Math.floor((Date.now() - new Date(ongoing.started_at).getTime()) / 1000)
            const remaining = Math.max(0, ongoing.time_left - elapsed)
            setTimeLeft(remaining)
          } else {
            setTimeLeft(ongoing.time_left)
          }
        } else {
          // Load questions from assigned exam
          const { data: questionsData, error: questionsError } = await supabase
            .from("test_questions")
            .select("*")
            .in("id", examConfig.questions)

          if (questionsError) {
            console.error("Error fetching assigned questions:", questionsError)
            return
          }

          setQuestions(questionsData || [])
          setTimeLeft(examConfig.time_limit)
        }
      } else {
        // Fallback to random questions if no assigned exam
        // Check for ongoing test
        const { data: ongoing, error: ongoingError } = await supabase
          .from("ongoing_tests")
          .select("*")
          .eq("user_id", authUser.id)
          .single()

        if (!ongoingError && ongoing) {
          // Load ongoing test
          setOngoingTest(ongoing)
          setQuestions(ongoing.questions_data)
          setAnswers(ongoing.answers_data)
          setCurrentQuestion(ongoing.current_question)
          setTestStarted(ongoing.test_started)

          // Calculate remaining time
          if (ongoing.test_started) {
            const elapsed = Math.floor((Date.now() - new Date(ongoing.started_at).getTime()) / 1000)
            const remaining = Math.max(0, ongoing.time_left - elapsed)
            setTimeLeft(remaining)
          } else {
            setTimeLeft(ongoing.time_left)
          }
        } else {
          // Get all questions and select random ones
          const { data: questionsData, error: questionsError } = await supabase
            .from("test_questions")
            .select("*")
            .eq("is_active", true)

          if (questionsError) {
            console.error("Error fetching questions:", questionsError)
            return
          }

          const randomQuestions = getRandomQuestions(questionsData || [], 30)
          setQuestions(randomQuestions)
        }
      }
      setIsLoading(false)
    }

    getUserAndQuestions()
  }, [supabase, router])

  // Load test info after questions are loaded
  useEffect(() => {
    const loadTestInfo = async () => {
      if (!user || questions.length === 0) return

      const userId = localStorage.getItem("paid-user-id") || user.id
      const { data: assignedExam, error: examError } = await supabase
        .from("user_exams")
        .select(`
          *,
          exam_configurations (*)
        `)
        .eq("user_id", userId)
        .eq("is_completed", false)
        .single()

      let passingScore = 70 // default
      let timeLimit = 60 // default
      let isAssignedExam = false

      if (!examError && assignedExam && assignedExam.exam_configurations) {
        passingScore = assignedExam.exam_configurations.passing_score
        timeLimit = Math.floor(assignedExam.exam_configurations.time_limit / 60)
        isAssignedExam = true
      }

      setTestInfo({ passingScore, timeLimit, isAssignedExam })
    }

    loadTestInfo()
  }, [user, questions.length, supabase])

  // Timer effect
  useEffect(() => {
    if (!testStarted || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitTest()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [testStarted, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmitTest = async () => {
    if (!user || !questions.length) return

    setIsSubmitting(true)

    try {
      // Calculate score
      let correctAnswers = 0
      const questionsData = questions.map((q) => ({
        id: q.id,
        question: q.question,
        correct_answer: q.correct_answer,
      }))

      const answersData = questions.map((q) => ({
        question_id: q.id,
        selected_answer: answers[q.id] || "",
        correct_answer: q.correct_answer,
        is_correct: (answers[q.id] || "").toLowerCase() === q.correct_answer.toLowerCase(),
      }))

      correctAnswers = answersData.filter((a) => a.is_correct).length

      // Calculate score with safeguards
      const rawScore = (correctAnswers / questions.length) * 100
      const score = Math.min(100, Math.max(0, Math.round(rawScore)))
      const passed = score >= 70 // 70% passing score

      // Debug logging
      console.log("Test Results:", {
        totalQuestions: questions.length,
        answersProvided: Object.keys(answers).length,
        correctAnswers,
        rawScore,
        finalScore: score,
        passed,
        sampleAnswers: answersData.slice(0, 3)
      })

      // Check if this is an assigned exam
      const userId = localStorage.getItem("paid-user-id") || user.id
      const { data: assignedExam, error: examError } = await supabase
        .from("user_exams")
        .select(`
          *,
          exam_configurations (*)
        `)
        .eq("user_id", userId)
        .eq("is_completed", false)
        .single()

      let passingScore = 70 // default
      if (!examError && assignedExam && assignedExam.exam_configurations) {
        passingScore = assignedExam.exam_configurations.passing_score
      }

      const finalPassed = score >= passingScore

      // Save test attempt
      const { error: attemptError } = await supabase.from("test_attempts").insert({
        user_id: userId,
        questions_data: questionsData,
        answers_data: answersData,
        score: score,
        total_questions: questions.length,
        passed: finalPassed,
      })

      if (attemptError) throw attemptError

      // Update assigned exam if exists
      if (!examError && assignedExam) {
        const { error: updateExamError } = await supabase
          .from("user_exams")
          .update({
            is_completed: true,
            completed_at: new Date().toISOString(),
            score: score,
            passed: finalPassed,
          })
          .eq("id", assignedExam.id)

        if (updateExamError) {
          console.error("Error updating assigned exam:", updateExamError)
        }
      }

      // Update profile
      const certificateAvailableAt = finalPassed ? new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() : null
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          test_completed: true,
          test_score: score,
          certificate_issued: false, // Will be issued after 48 hours
          certificate_available_at: certificateAvailableAt,
        })
        .eq("id", userId)

      if (profileError) throw profileError

      // Delete ongoing test record
      if (ongoingTest) {
        await supabase
          .from("ongoing_tests")
          .delete()
          .eq("id", ongoingTest.id)
      }

      localStorage.setItem(
        "test-results",
        JSON.stringify({
          score,
          passed: finalPassed,
          correctAnswers,
          totalQuestions: questions.length,
          userId: userId,
        }),
      )
      localStorage.removeItem("paid-user-id")

      // Redirect to results
      router.push("/dashboard/results")
    } catch (error) {
      console.error("Test submission error:", error)
      alert("There was an error submitting your test. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user || !questions.length) {
    return (
      <div className="flex items-center justify-center py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Unable to load test. Please try again later.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!testStarted) {
    return (
      <div className="p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Security Aptitude Test</CardTitle>
              <CardDescription className="text-lg">
                Welcome {user.first_name}! You are about to begin your certification assessment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 p-6 rounded-lg">
                <h3 className="font-semibold mb-4">Test Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p>
                      <strong>Total Questions:</strong> {questions.length}
                    </p>
                    <p>
                      <strong>Time Limit:</strong> {testInfo.timeLimit} minutes
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Passing Score:</strong> {testInfo.passingScore}%
                    </p>
                    <p>
                      <strong>Format:</strong> Multiple Choice
                    </p>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> {testInfo.isAssignedExam
                    ? "You have been assigned a specific exam configuration."
                    : "You will receive randomly selected questions from our question bank."
                  } Once you start the test, the timer will begin and you cannot pause. Make sure you have a stable
                  internet connection and sufficient time to complete the assessment.
                </AlertDescription>
              </Alert>

              <Button onClick={() => setTestStarted(true)} className="w-full text-lg py-6" size="lg">
                Start Test
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <>
      {/* Test Header */}
      <div className="bg-primary text-primary-foreground py-3 md:py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <h1 className="text-lg md:text-xl font-semibold">Security Aptitude Test</h1>
              <p className="text-sm opacity-90">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 md:h-5 md:w-5" />
                <span className="font-mono text-base md:text-lg">{formatTime(timeLeft)}</span>
              </div>
              <div className="text-right">
                <p className="text-xs md:text-sm">Answered</p>
                <p className="font-semibold text-sm md:text-base">
                  {Object.keys(answers).length}/{questions.length}
                </p>
              </div>
            </div>
          </div>
          <Progress value={progress} className="mt-3 md:mt-4 h-2 bg-gray-200" />

          {/* Internet Connection Warning */}
          {!isOnline && (
            <Alert className="mt-4 border-orange-500 bg-orange-50 text-orange-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Connection Lost:</strong> Your internet connection is offline. Your progress is being saved locally and will be submitted when connection is restored.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Test Content */}
      <div className="py-6 md:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-4 md:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Question {currentQuestion + 1}</h2>
                <p className="text-lg leading-relaxed">{currentQ.question}</p>
                <p className="text-sm text-muted-foreground mt-2">Category: {currentQ.category}</p>
              </div>

              <RadioGroup
                value={answers[currentQ.id] || ""}
                onValueChange={(value: string) => handleAnswerSelect(currentQ.id, value)}
                className="space-y-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="A" id="a" />
                  <Label htmlFor="a" className="flex-1 cursor-pointer">
                    <span className="font-semibold mr-2">A)</span>
                    {currentQ.option_a}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="B" id="b" />
                  <Label htmlFor="b" className="flex-1 cursor-pointer">
                    <span className="font-semibold mr-2">B)</span>
                    {currentQ.option_b}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="C" id="c" />
                  <Label htmlFor="c" className="flex-1 cursor-pointer">
                    <span className="font-semibold mr-2">C)</span>
                    {currentQ.option_c}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="D" id="d" />
                  <Label htmlFor="d" className="flex-1 cursor-pointer">
                    <span className="font-semibold mr-2">D)</span>
                    {currentQ.option_d}
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-6 md:mt-8">
            <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0} className="w-full sm:w-auto">
              Previous
            </Button>

            {currentQuestion === questions.length - 1 ? (
              <Button
                onClick={handleSubmitTest}
                disabled={isSubmitting || Object.keys(answers).length !== questions.length}
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
              >
                {isSubmitting ? "Submitting..." : "Submit Test"}
              </Button>
            ) : (
              <Button onClick={handleNext} className="w-full sm:w-auto">Next</Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
