"use client"

import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useState, useEffect } from "react"
import { CheckCircle, AlertCircle, ArrowLeft, FileText, RotateCcw, Trophy, Target, TrendingUp, ChevronDown, ChevronRight } from "lucide-react"
import Confetti from "react-confetti"

interface SubTopicTest {
  id: string
  title: string
  description: string
  questions: any[]
  totalQuestions: number
  passingScore: number
  timeLimit: number
}

interface TestQuestion {
  id: string
  question: string
  options: Array<{
    id: string
    option_text: string
    is_correct: boolean
  }>
}

interface TestAttempt {
  answers: Record<string, string>
  score: number
  passed: boolean
  completed_at: string
}

export default function SubTopicTestPage() {
  const { moduleId, levelId, subtopicId } = useParams()
  const router = useRouter()
  const [subTopicTest, setSubTopicTest] = useState<SubTopicTest | null>(null)
  const [questions, setQuestions] = useState<TestQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [testStarted, setTestStarted] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [results, setResults] = useState<TestAttempt | null>(null)
  const [isRetaking, setIsRetaking] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [showIncorrectQuestions, setShowIncorrectQuestions] = useState(false)


  useEffect(() => {
    fetchSubTopicTest()
  }, [])

  // Handle window resize for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }

    if (typeof window !== 'undefined') {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Trigger confetti when test is passed
  useEffect(() => {
    if (results?.passed) {
      setShowConfetti(true)
      // Stop confetti after 5 seconds
      const timer = setTimeout(() => setShowConfetti(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [results])


  const fetchSubTopicTest = async () => {
    try {
      // Get sub-topic test using our Prisma API
      const testResponse = await fetch(`/api/sub-topic-tests?subTopicId=${subtopicId}`)
      if (!testResponse.ok) {
        console.error('Sub-topic test not found:', testResponse.status)
        router.push(`/dashboard/my-modules/${moduleId}/levels/${levelId}`)
        return
      }

      const testData = await testResponse.json()
      setSubTopicTest(testData)

      // Parse questions from JSON - our API already resolves question IDs to full objects
      if (testData.questions && Array.isArray(testData.questions)) {
        // Transform the question format to match our interface
        const formattedQuestions: TestQuestion[] = testData.questions.map((q: any) => ({
          id: q.id,
          question: q.question,
          options: q.options ? q.options.map((opt: any) => ({
            id: opt.id,
            option_text: opt.optionText,
            is_correct: opt.isCorrect
          })).sort((a: any, b: any) => (a.optionLetter || '').localeCompare(b.optionLetter || '')) : []
        }))

        setQuestions(formattedQuestions)
      }

    } catch (error) {
      console.error('Error fetching sub-topic test:', error)
      router.push(`/dashboard/my-modules/${moduleId}/levels/${levelId}`)
    } finally {
      setIsLoading(false)
    }
  }

  const startTest = () => {
    setTestStarted(true)
  }

  const retakeTest = () => {
    setIsRetaking(true)
    setTestCompleted(false)
    setResults(null)
    setAnswers({})
    setCurrentQuestion(0)
    setTestStarted(false)
  }

  const handleAnswerChange = (questionId: string, answerId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const handleSubmitTest = async () => {
    if (!subTopicTest) return

    try {
      let correctAnswers = 0
      const totalQuestions = questions.length

      // Calculate score
      questions.forEach(question => {
        const userAnswer = answers[question.id]
        const correctOption = question.options.find(opt => opt.is_correct)
        if (userAnswer === correctOption?.id) {
          correctAnswers++
        }
      })

      const score = Math.round((correctAnswers / totalQuestions) * 100)
      const passed = score >= subTopicTest.passingScore

      const testResults = {
        answers,
        score,
        passed,
        completed_at: new Date().toISOString()
      }

      setResults(testResults)
      setTestCompleted(true)
      setTestStarted(false)

      // Save test results to database
      try {
        const saveResponse = await fetch('/api/sub-topic-test-results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subTopicTestId: subTopicTest.id,
            moduleId,
            levelId,
            subtopicId,
            score,
            totalQuestions,
            correctAnswers,
            answers,
            passed
          })
        })

        if (!saveResponse.ok) {
          console.error('Failed to save test results:', await saveResponse.text())
        } else {
          console.log('Test results saved successfully')
        }
      } catch (saveError) {
        console.error('Error saving test results:', saveError)
        // Don't show error to user since the test was completed successfully
      }

    } catch (error) {
      console.error('Error submitting test:', error)
      alert('Error submitting test. Please try again.')
    }
  }


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!subTopicTest) {
    return (
      <div className="flex items-center justify-center py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Test not found.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (testCompleted && results) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Confetti Animation */}
        {showConfetti && results.passed && (
          <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={200}
            gravity={0.1}
          />
        )}

        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <div className="max-w-2xl w-full">
            {/* Main Results Card */}
            <Card className={`shadow-2xl border-0 overflow-hidden ${results.passed ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950' : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950'}`}>
              {/* Header Section */}
              <div className={`relative p-8 text-center ${results.passed ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-red-600 to-rose-600'}`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl transform scale-150"></div>
                </div>

                <div className="relative z-10">
                  {/* Result Icon */}
                  <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center shadow-2xl ${results.passed ? 'bg-white/20 backdrop-blur-sm' : 'bg-white/20 backdrop-blur-sm'}`}>
                    {results.passed ? (
                      <Trophy className="h-12 w-12 text-white" />
                    ) : (
                      <Target className="h-12 w-12 text-white" />
                    )}
                  </div>

                  {/* Result Title */}
                  <h1 className="text-4xl font-bold text-white mb-2">
                    {results.passed ? '🎉 Congratulations!' : 'Keep Trying!'}
                  </h1>
                  <p className="text-xl text-white/90 mb-4">
                    {results.passed ? 'You Passed the Test!' : 'Test Not Passed'}
                  </p>

                  {/* Score Display */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 inline-block">
                    <div className="text-5xl font-bold text-white mb-1">
                      {results.score}%
                    </div>
                    <div className="text-white/80">
                      {Math.round((results.score / 100) * questions.length)}/{questions.length} Correct Answers
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <CardContent className="p-8">
                <div className="space-y-8">
                  {/* Statistics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-card rounded-xl p-6 text-center border shadow-sm">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-2xl font-bold text-primary mb-1">{questions.length}</div>
                      <div className="text-sm text-muted-foreground">Total Questions</div>
                    </div>

                    <div className="bg-card rounded-xl p-6 text-center border shadow-sm">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Target className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mb-1">{subTopicTest.passingScore}%</div>
                      <div className="text-sm text-muted-foreground">Passing Score</div>
                    </div>

                    <div className={`rounded-xl p-6 text-center border-2 shadow-sm ${results.passed ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'}`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${results.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <TrendingUp className="h-6 w-6" />
                      </div>
                      <div className={`text-2xl font-bold mb-1 ${results.passed ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                        {results.passed ? 'PASSED' : 'FAILED'}
                      </div>
                      <div className="text-sm text-muted-foreground">Final Result</div>
                    </div>
                  </div>

                  {/* Incorrect Questions Review (only show if there are incorrect answers) */}
                  {!results.passed && (() => {
                    const incorrectQuestions = questions.filter(question => {
                      const userAnswer = answers[question.id]
                      const correctOption = question.options.find(opt => opt.is_correct)
                      return userAnswer !== correctOption?.id
                    })

                    if (incorrectQuestions.length === 0) return null

                    return (
                      <Collapsible open={showIncorrectQuestions} onOpenChange={setShowIncorrectQuestions}>
                        <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
                          <CollapsibleTrigger asChild>
                            <CardHeader className="pb-3 cursor-pointer hover:bg-orange-50/70 dark:hover:bg-orange-950/30 transition-colors">
                              <CardTitle className="text-lg text-orange-800 dark:text-orange-200 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Target className="h-5 w-5" />
                                  Review Your Answers ({incorrectQuestions.length} incorrect)
                                </div>
                                {showIncorrectQuestions ? (
                                  <ChevronDown className="h-5 w-5" />
                                ) : (
                                  <ChevronRight className="h-5 w-5" />
                                )}
                              </CardTitle>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="space-y-4 pt-0">
                              {incorrectQuestions.map((question, index) => {
                                const userAnswerId = answers[question.id]
                                const userSelectedOption = question.options.find(opt => opt.id === userAnswerId)
                                const correctOption = question.options.find(opt => opt.is_correct)

                                return (
                                  <div key={question.id} className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 border border-orange-200/50">
                                    <div className="flex items-start gap-3">
                                      <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center text-xs font-semibold text-orange-800 dark:text-orange-200 flex-shrink-0 mt-0.5">
                                        {index + 1}
                                      </div>
                                      <div className="flex-1 space-y-2">
                                        <p className="font-medium text-sm leading-relaxed">
                                          {question.question}
                                        </p>

                                        <div className="space-y-1">
                                          <div className="flex items-center gap-2 text-xs">
                                            <span className="text-red-600 dark:text-red-400 font-medium">Your answer:</span>
                                            <span className="text-red-700 dark:text-red-300">
                                              {userSelectedOption ? userSelectedOption.option_text : 'No answer selected'}
                                            </span>
                                          </div>

                                          <div className="flex items-center gap-2 text-xs">
                                            <span className="text-green-600 dark:text-green-400 font-medium">Correct answer:</span>
                                            <span className="text-green-700 dark:text-green-300">
                                              {correctOption?.option_text}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </CardContent>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    )
                  })()}

                  {/* Message */}
                  <Alert className={`border-0 ${results.passed ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200' : 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200'}`}>
                    {results.passed ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <AlertCircle className="h-5 w-5" />
                    )}
                    <AlertDescription className="text-base">
                      {results.passed
                        ? "Excellent work! You've demonstrated a strong understanding of this sub-topic. Keep up the great progress!"
                        : `You need ${subTopicTest.passingScore}% to pass. Don't worry - review the material and try again. You've got this!`
                      }
                    </AlertDescription>
                  </Alert>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    {!results.passed && (
                      <Button
                        onClick={retakeTest}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Retake Test
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/dashboard/my-modules/${moduleId}/levels/${levelId}`)}
                      className="flex-1 border-2 hover:bg-muted/50"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Review Content
                    </Button>
                    <Button
                      onClick={() => router.push(`/dashboard/my-modules/${moduleId}/levels/${levelId}`)}
                      className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Continue Learning
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <Card className="shadow-lg">
            <CardHeader className="text-center bg-muted/50">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                {isRetaking ? 'Retake: ' : ''}{subTopicTest.title}
              </CardTitle>
              <CardDescription>{subTopicTest.description}</CardDescription>
            </CardHeader>

            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4 text-center border">
                  <div className="text-2xl font-bold text-primary mb-1">{subTopicTest.totalQuestions}</div>
                  <div className="text-sm text-muted-foreground">Questions</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center border">
                  <div className="text-2xl font-bold text-primary mb-1">{subTopicTest.passingScore}%</div>
                  <div className="text-sm text-muted-foreground">Passing Score</div>
                </div>
              </div>

              {isRetaking && (
                <Alert className="border-orange-200 bg-orange-50">
                  <RotateCcw className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    You're retaking this test. Review the material carefully and try again!
                  </AlertDescription>
                </Alert>
              )}


              <Button
                onClick={startTest}
                className="w-full py-4 text-lg font-semibold"
                size="lg"
              >
                {isRetaking ? 'Start Retake' : 'Start Test'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        {/* Test Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Exit Test
            </Button>
            <div className="bg-muted px-4 py-2 rounded-full">
              <span className="text-sm font-medium">
                Question {currentQuestion + 1} of {questions.length}
              </span>
            </div>
          </div>

          <Card className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-semibold">
                {Math.round((currentQuestion + 1) / questions.length * 100)}%
              </span>
            </div>
            <Progress
              value={(currentQuestion + 1) / questions.length * 100}
              className="h-3"
            />
          </Card>
        </div>

        {/* Question Card */}
        <Card className="shadow-lg">
          <CardHeader className="bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-bold text-sm text-primary">
                {currentQuestion + 1}
              </div>
              <div>
                <CardTitle>Question {currentQuestion + 1}</CardTitle>
                <CardDescription>Select the best answer</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Question Text */}
              <div className="bg-muted/50 rounded-lg p-6 border">
                <h2 className="text-xl font-semibold leading-relaxed">
                  {currentQ.question}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium mb-4">Choose your answer:</h3>
                <RadioGroup
                  value={answers[currentQ.id] || ""}
                  onValueChange={(value) => handleAnswerChange(currentQ.id, value)}
                  className="space-y-3"
                >
                  {currentQ.options.map((option, index) => (
                    <div key={option.id} className="flex items-center gap-4 p-4 rounded-lg border-2 border-border bg-card hover:bg-muted/50 hover:border-primary cursor-pointer transition-all duration-200 data-[state=checked]:border-primary data-[state=checked]:bg-primary/5 data-[state=checked]:shadow-sm">
                      <RadioGroupItem
                        value={option.id}
                        id={option.id}
                        className="w-4 h-4"
                      />
                      <div className="w-8 h-8 rounded-full bg-muted border-2 border-border flex items-center justify-center font-semibold data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary transition-all duration-200">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <Label
                        htmlFor={option.id}
                        className="flex-1 font-medium leading-relaxed cursor-pointer"
                      >
                        {option.option_text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <div className="flex gap-3">
                  {currentQuestion === questions.length - 1 ? (
                    <Button
                      onClick={handleSubmitTest}
                      className="px-8"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Submit Test
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                    >
                      Next Question
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}