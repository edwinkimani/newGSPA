"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { TestResults } from "@/components/test-results"

interface TestResult {
  id: string
  userId: string
  subTopicTestId: string
  moduleId: string
  levelId: string
  subTopicId: string
  score: number
  totalQuestions: number
  correctAnswers: number
  answers: any[]
  passed: boolean
  timeSpent: number | null
  completedAt: Date
  createdAt: Date
  subTopicTest: {
    id: string
    title: string
    description: string | null
    totalQuestions: number
    passingScore: number
    timeLimit: number
    questions: any
  }
  module: {
    id: string
    title: string
  }
  level: {
    id: string
    title: string
  }
  subTopic: {
    id: string
    title: string
  }
}

export default function TestResultsPage() {
  const params = useParams()
  const [result, setResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await fetch(`/api/sub-topic-test-results?subTopicId=${params.subtopicId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.length > 0) {
            setResult(data[0])
          }
        }
      } catch (error) {
        console.error('Error fetching test result:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.subtopicId) {
      fetchResult()
    }
  }, [params.subtopicId])

  const handleGoBack = () => {
    window.history.back()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Test Result Not Found</h2>
          <Button onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex justify-start">
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>

        <TestResults
          test={{
            id: result.subTopicTest.id,
            title: result.subTopicTest.title,
            description: result.subTopicTest.description || undefined,
            totalQuestions: result.subTopicTest.totalQuestions,
            passingScore: result.subTopicTest.passingScore,
            timeLimit: result.subTopicTest.timeLimit,
            questions: result.subTopicTest.questions
          }}
          result={{
            id: result.id,
            userId: result.userId,
            subTopicTestId: result.subTopicTestId,
            moduleId: result.moduleId,
            levelId: result.levelId,
            subTopicId: result.subTopicId,
            score: result.score,
            totalQuestions: result.totalQuestions,
            correctAnswers: result.correctAnswers,
            answers: result.answers,
            passed: result.passed,
            timeSpent: result.timeSpent,
            completedAt: result.completedAt,
            createdAt: result.createdAt
          }}
          module={result.module}
          level={result.level}
          subtopic={result.subTopic}
        />
      </div>
    </div>
  )
}