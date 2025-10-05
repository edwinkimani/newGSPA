"use client"

import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, AlertCircle, Loader2 } from "lucide-react"
import { fetchJson, apiFetch } from '@/lib/api/client'
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

export default function TestPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(3600) // 60 minutes in seconds
  const [testStarted, setTestStarted] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [ongoingTestId, setOngoingTestId] = useState<string | null>(null)
  const [showTimeWarning, setShowTimeWarning] = useState(false)
  const router = useRouter()
  // REST API replaced supabase client usage

  const getRandomQuestions = (allQuestions: Question[], count = 30): Question[] => {
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, Math.min(count, allQuestions.length))
  }

  const saveOngoingTest = async () => {
    if (!user || !questions.length || !testStarted || Object.keys(answers).length < 3) return

    const testData = {
      user_id: user.id,
      questions_data: questions,
      answers_data: answers,
      current_question: currentQuestion,
      time_left: timeLeft,
      test_started: testStarted,
      updated_at: new Date().toISOString()
    }

    if (!isOnline) {
      // Save to localStorage as backup
      localStorage.setItem('ongoing-test-backup', JSON.stringify(testData))
      return
    }

    try {
      if (ongoingTestId) {
        await apiFetch('/api/tests/ongoing', { method: 'PATCH', body: JSON.stringify({ questionsData: testData.questions_data, answersData: testData.answers_data, currentQuestion: testData.current_question, timeLeft: testData.time_left, testStarted: testData.test_started }) })
      } else {
        const res = await apiFetch('/api/tests/ongoing', { method: 'POST', body: JSON.stringify({ questionsData: testData.questions_data, answersData: testData.answers_data, currentQuestion: testData.current_question, timeLeft: testData.time_left, testStarted: testData.test_started }) })
        if (res.ok) {
          const created = await res.json()
          setOngoingTestId(created.id)
        }
      }
    } catch (error) {
      console.error('Error saving ongoing test:', error)
      localStorage.setItem('ongoing-test-backup', JSON.stringify(testData))
    }
  }

  const loadOngoingTest = async () => {
    if (!user) return null
    try {
      const res = await apiFetch('/api/tests/ongoing')
      if (!res.ok) return null
      const data = await res.json()
      return data
    } catch (error) {
      console.error('Error loading ongoing test:', error)
      return null
    }
  }

  const deleteOngoingTest = async () => {
    if (!ongoingTestId) return
    try {
      await apiFetch('/api/tests/ongoing', { method: 'DELETE' })
    } catch (error) {
      console.error('Error deleting ongoing test:', error)
    }
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

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (testStarted && Object.keys(answers).length >= 3) {
        // Note: synchronous save not possible, but we can try
        saveOngoingTest()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [testStarted, answers, currentQuestion, timeLeft, user, questions.length, ongoingTestId])


  // Save test progress to database
  useEffect(() => {
    saveOngoingTest()
  }, [answers, currentQuestion, timeLeft, testStarted, user, questions.length, ongoingTestId])

  useEffect(() => {
    const getUserAndQuestions = async () => {
      const paidUserId = localStorage.getItem("paid-user-id")

      if (paidUserId) {
        try {
          const profile = await fetchJson(`/api/profiles/${paidUserId}`)
          if (profile && profile.membershipFeePaid && profile.paymentStatus === 'COMPLETED') {
            setUser(profile as any)
            if (profile.testCompleted) { router.push('/dashboard/results'); return }

            // Get questions
            const questionsData = await fetchJson('/api/tests/questions')
            const randomQuestions = getRandomQuestions(questionsData || [], 30)
            setQuestions(randomQuestions)

            const ongoingTest = await loadOngoingTest()
            if (ongoingTest && ongoingTest.questionsData && ongoingTest.questionsData.length === randomQuestions.length) {
              let adjustedTimeLeft = ongoingTest.timeLeft || 3600
              setAnswers(ongoingTest.answersData || {})
              setCurrentQuestion(ongoingTest.currentQuestion || 0)
              setTimeLeft(adjustedTimeLeft)
              setTestStarted(ongoingTest.testStarted || false)
              setOngoingTestId(ongoingTest.id)
            }
            setIsLoading(false)
            return
          }
        } catch (err) {
          // fallback to authenticated flow
        }
      }

      // Fallback to authenticated user flow
      try {
        const authRes = await fetch('/api/auth/user')
        if (!authRes.ok) { router.push('/auth/login'); return }
        const authData = await authRes.json()
        const authUser = authData?.profile
        if (!authUser) { router.push('/register'); return }
        const profile = authUser
        setUser(profile)
        if (profile.testCompleted) { router.push('/dashboard/results'); return }
        if (!profile.membershipFeePaid || profile.paymentStatus !== 'COMPLETED') { router.push('/payment'); return }

        const questionsData = await fetchJson('/api/tests/questions')
        const randomQuestions = getRandomQuestions(questionsData || [], 30)
        setQuestions(randomQuestions)

        const ongoingTest = await loadOngoingTest()
        if (ongoingTest && ongoingTest.questionsData && ongoingTest.questionsData.length === randomQuestions.length) {
          let adjustedTimeLeft = ongoingTest.timeLeft || 3600
          setAnswers(ongoingTest.answersData || {})
          setCurrentQuestion(ongoingTest.currentQuestion || 0)
          setTimeLeft(adjustedTimeLeft)
          setTestStarted(ongoingTest.testStarted || false)
          setOngoingTestId(ongoingTest.id)
        }

        setIsLoading(false)
      } catch (err) {
        console.error('Error fetching auth/profile:', err)
        router.push('/auth/login')
      }
    }

    getUserAndQuestions()
  }, [router])

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

  // Time warning effect
  useEffect(() => {
    setShowTimeWarning(timeLeft <= 300 && timeLeft > 0 && testStarted)
  }, [timeLeft, testStarted])

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

      // Debug logging
      console.log("Test Results:", {
        totalQuestions: questions.length,
        answersProvided: Object.keys(answers).length,
        correctAnswers,
        score: Math.round((correctAnswers / questions.length) * 100),
        passed: Math.round((correctAnswers / questions.length) * 100) >= 70,
        sampleAnswers: answersData.slice(0, 3)
      })
      const score = Math.round((correctAnswers / questions.length) * 100)
      const passed = score >= 70 // 70% passing score

      // Save test attempt via API
      const attemptRes = await apiFetch('/api/tests/attempts', { method: 'POST', body: JSON.stringify({ answersData: answersData, questionsData: questionsData, score }) })
      if (!attemptRes.ok) throw new Error('Failed to save attempt')

      // Profile update is handled server-side by attempts route; but update certificate availability locally too
      const certificateAvailableAt = passed ? new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() : null
      try {
        await apiFetch(`/api/profiles/${user.id}`, { method: 'PATCH', body: JSON.stringify({ testCompleted: true, testScore: score, certificateAvailableAt }) })
      } catch {}

      localStorage.setItem(
        "test-results",
        JSON.stringify({
          score,
          passed,
          correctAnswers,
          totalQuestions: questions.length,
          userId: user.id,
        }),
      )
      localStorage.removeItem("paid-user-id")

      // Delete ongoing test
      await deleteOngoingTest()

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
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!user || !questions.length) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Unable to load test. Please try again later.</AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    )
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />

        <main className="flex-1 flex items-center justify-center py-20">
          <Card className="max-w-2xl w-full">
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
                      <strong>Time Limit:</strong> 60 minutes
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Passing Score:</strong> 70%
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
                  <strong>Important:</strong> You will receive 30 randomly selected questions from our question bank.
                  Once you start the test, the timer will begin and you cannot pause. Make sure you have a stable
                  internet connection and sufficient time to complete the assessment.
                </AlertDescription>
              </Alert>

              <Button onClick={() => setTestStarted(true)} className="w-full text-lg py-6" size="lg">
                Start Test
              </Button>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    )
  }

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {/* Test Header */}
        <div className="bg-primary text-primary-foreground py-4">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-semibold">Security Aptitude Test</h1>
                <p className="text-sm opacity-90">
                  Question {currentQuestion + 1} of {questions.length}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm">Answered</p>
                  <p className="font-semibold">
                    {Object.keys(answers).length}/{questions.length}
                  </p>
                </div>
              </div>
            </div>
            <Progress value={progress} className="mt-4 h-2 bg-gray-200" />

            {/* Internet Connection Warning */}
            {!isOnline && (
              <Alert className="mt-4 border-orange-500 bg-orange-50 text-orange-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Connection Lost:</strong> Your internet connection is offline. Your progress is being saved locally and will be submitted when connection is restored.
                </AlertDescription>
              </Alert>
            )}

            {/* Time Warning */}
            {showTimeWarning && (
              <Alert className="mt-4 border-red-500 bg-red-50 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Time Running Low:</strong> You have less than 5 minutes remaining. Please complete your answers quickly.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Test Content */}
        <div className="py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="p-8">
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
            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestion === 0}>
                Previous
              </Button>

              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={handleSubmitTest}
                  disabled={isSubmitting || Object.keys(answers).length !== questions.length}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? "Submitting..." : "Submit Test"}
                </Button>
              ) : (
                <Button onClick={handleNext}>Next</Button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
