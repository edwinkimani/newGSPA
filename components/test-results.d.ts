declare module "@/components/test-results" {
  import { FC } from "react"
  
  interface TestResultsProps {
    test: {
      id: string
      title: string
      description: string | null
      totalQuestions: number
      passingScore: number
      timeLimit: number
      questions: any
    }
    result: {
      score: number
      totalQuestions: number
      correctAnswers: number
      answers: any[]
      passed: boolean
      completedAt: Date
    }
    module: {
      id: string
      title: string
    }
    level: {
      id: string
      title: string
    }
    subtopic: {
      id: string
      title: string
    }
  }

  export const TestResults: FC<TestResultsProps>
}