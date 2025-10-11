import { Card } from "@/components/ui/card"
import { CheckCircle, XCircle, BookOpen, FileText, Clock } from "lucide-react"
import { format } from "date-fns"

interface TestResultsProps {
  test: {
    id: string
    title: string
    description?: string
    totalQuestions: number
    passingScore: number
    timeLimit: number
    questions: any
  }
  result: {
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

export function TestResults({ test, result, module, level, subtopic }: TestResultsProps) {
  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
            {result.passed ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <XCircle className="h-8 w-8 text-red-600" />
            )}
          </div>
          <h1 className="text-2xl font-bold mt-4">{test.title}</h1>
          <p className="text-muted-foreground">{test.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 border rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>Module</span>
            </div>
            <div className="font-medium mt-1">{module.title}</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Level</span>
            </div>
            <div className="font-medium mt-1">{level.title}</div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Completed</span>
            </div>
            <div className="font-medium mt-1">
              {format(new Date(result.completedAt), "MMM d, yyyy h:mm a")}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="p-3 border rounded-lg">
              <div className="text-4xl font-bold text-center">
                {result.score}%
              </div>
              <div className="text-muted-foreground text-center">
                {result.correctAnswers} out of {result.totalQuestions} correct
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground">Time Spent</div>
              <div className="text-xl font-medium">
                {result.timeSpent ? `${Math.floor(result.timeSpent / 60)}m ${result.timeSpent % 60}s` : 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground mt-2">Completed At</div>
              <div className="text-sm">
                {new Date(result.completedAt).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {Array.isArray(result.answers) && result.answers.map((answer: any, index: number) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="font-medium">Question {index + 1}</div>
                <div className="text-muted-foreground text-sm">
                  Your answer: {answer.selectedAnswer}
                </div>
                <div className="text-sm">
                  {answer.isCorrect ? (
                    <span className="text-green-600">Correct</span>
                  ) : (
                    <span className="text-red-600">Incorrect</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}