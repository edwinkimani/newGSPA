"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Menu, Calculator } from "lucide-react"
import { useRouter } from "next/navigation"

interface Module {
  id: string
  title: string
  description: string
  category: string
  difficultyLevel: string
  isActive: boolean
}

interface ModuleQuestion {
  id: string
  question: string
  options: {
    A: string
    B: string
    C: string
    D: string
  }
  correctAnswer: string
  category: string
  difficulty: string
  marks: number
  createdAt: string
}

export default function MasterPractitionerTestsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isMasterPractitioner, setIsMasterPractitioner] = useState(false)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Modules states
  const [modules, setModules] = useState<Module[]>([])
  const [selectedModuleId, setSelectedModuleId] = useState("")

  // All questions states
  const [allQuestions, setAllQuestions] = useState<any[]>([])

  // Module tests states
  const [moduleTests, setModuleTests] = useState<any[]>([])

  // Exam creation states
  const [createExamDialogOpen, setCreateExamDialogOpen] = useState(false)
  const [examName, setExamName] = useState("")
  const [examDescription, setExamDescription] = useState("")
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [passingScore, setPassingScore] = useState(70)
  const [timeLimit, setTimeLimit] = useState(60) // minutes


  const router = useRouter()

  useEffect(() => {
    const checkMasterPractitionerAndLoadData = async () => {
      try {
        const userRes = await fetch('/api/auth/user')
        if (!userRes.ok) {
          router.push('/auth/login')
          return
        }
        const data = await userRes.json()
        const roleName = data?.profile?.role?.name
        if (roleName !== 'master_practitioner') {
          router.push('/dashboard')
          return
        }
        setIsMasterPractitioner(true)
        setUserName(`${data?.profile?.firstName || ''} ${data?.profile?.lastName || ''}`.trim() || 'Master Practitioner')
        setUserEmail(data?.email || '')

        // Load modules
        const modulesRes = await fetch('/api/modules')
        if (modulesRes.ok) {
          const modulesData = await modulesRes.json()
          setModules(modulesData)
        }

        // Load all questions
        const questionsRes = await fetch('/api/tests/questions')
        if (questionsRes.ok) {
          const questionsData = await questionsRes.json()
          setAllQuestions(questionsData)
        }

        // Load all module tests
        const testsRes = await fetch('/api/module-tests')
        if (testsRes.ok) {
          const testsData = await testsRes.json()
          setModuleTests(testsData)
        }

        setIsLoading(false)
      } catch (err) {
        router.push('/auth/login')
      }
    }

    checkMasterPractitionerAndLoadData()
  }, [router])



  const handleCreateExam = async () => {
    if (!selectedModuleId || !examName.trim() || selectedQuestions.length === 0) {
      alert("Please select a module, provide exam name and select at least one question.")
      return
    }

    try {
      const res = await fetch('/api/module-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: selectedModuleId,
          title: examName,
          description: examDescription,
          questions: selectedQuestions, // Send question IDs directly
          totalQuestions: selectedQuestions.length,
          passingScore: passingScore,
          timeLimit: timeLimit * 60 // Convert minutes to seconds
        })
      })

      if (!res.ok) throw new Error('Failed to create module test')

      // Refresh module tests list
      const testsRes = await fetch('/api/module-tests')
      if (testsRes.ok) {
        const testsData = await testsRes.json()
        setModuleTests(testsData)
      }

      alert("Module test created successfully!")
      setCreateExamDialogOpen(false)
      resetExamForm()
    } catch (error) {
      console.error("Error creating module test:", error)
      alert("Error creating module test. Please try again.")
    }
  }

  const resetExamForm = () => {
    setExamName("")
    setExamDescription("")
    setSelectedQuestions([])
    setPassingScore(70)
    setTimeLimit(60)
  }

  const calculateTotalMarks = () => {
    return selectedQuestions.reduce((total, questionId) => {
      const question = allQuestions.find(q => q.id === questionId)
      return total + (question?.marks || 1)
    }, 0)
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
          </div>
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
          <h1 className="text-lg font-semibold">Test Management</h1>
          <div className="w-8" />
        </div>

        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Module Test Creation</h1>
                <p className="text-muted-foreground">
                  Create tests for modules using questions from the global question bank. Tests are stored in the ModuleTest table.
                </p>
              </div>
              <Dialog open={createExamDialogOpen} onOpenChange={setCreateExamDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Module Test
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Module Test</DialogTitle>
                    <DialogDescription>
                      Create a new test for a module using questions from the question bank.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="exam-name">Exam Name</Label>
                      <Input
                        id="exam-name"
                        value={examName}
                        onChange={(e) => setExamName(e.target.value)}
                        placeholder="Enter exam name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="exam-description">Description</Label>
                      <Textarea
                        id="exam-description"
                        value={examDescription}
                        onChange={(e) => setExamDescription(e.target.value)}
                        placeholder="Enter exam description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="passing-score">Passing Score (%)</Label>
                        <Input
                          id="passing-score"
                          type="number"
                          value={passingScore}
                          onChange={(e) => setPassingScore(Number(e.target.value))}
                          min="0"
                          max="100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                        <Input
                          id="time-limit"
                          type="number"
                          value={timeLimit}
                          onChange={(e) => setTimeLimit(Number(e.target.value))}
                          min="1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="module-select">Select Module for Test</Label>
                      <Select value={selectedModuleId} onValueChange={setSelectedModuleId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a module" />
                        </SelectTrigger>
                        <SelectContent>
                          {modules.map((module) => (
                            <SelectItem key={module.id} value={module.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {module.title}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {module.category} • {module.difficultyLevel}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label>Select Questions ({selectedQuestions.length} selected)</Label>
                        <div className="flex items-center gap-2 text-sm">
                          <Calculator className="h-4 w-4" />
                          <span className="font-medium">Total Marks: {calculateTotalMarks()}</span>
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto border rounded-md p-4 space-y-2">
                        {allQuestions.filter(q => q.isActive).map((question) => (
                          <div key={question.id} className="flex items-start space-x-2 p-2 border rounded">
                            <Checkbox
                              id={`question-${question.id}`}
                              checked={selectedQuestions.includes(question.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedQuestions([...selectedQuestions, question.id])
                                } else {
                                  setSelectedQuestions(selectedQuestions.filter(id => id !== question.id))
                                }
                              }}
                            />
                            <div className="flex-1">
                              <Label htmlFor={`question-${question.id}`} className="text-sm leading-relaxed cursor-pointer">
                                <div className="font-medium">{question.question}</div>
                                <div className="text-muted-foreground flex items-center gap-2 mt-1">
                                  <span>{question.category} • {question.subjectModel} • {question.difficulty}</span>
                                  <span className="font-medium text-primary">{question.marks || 1} marks</span>
                                </div>
                              </Label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setCreateExamDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateExam}>
                            Create Module Test
                          </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Module Tests Table */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Created Module Tests</CardTitle>
                  <CardDescription>
                    Overview of all module tests that have been created.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {moduleTests.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No module tests created yet. Click "Create Module Test" to get started.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2 font-medium">#</th>
                            <th className="text-left p-2 font-medium">Module</th>
                            <th className="text-left p-2 font-medium">Test Title</th>
                            <th className="text-left p-2 font-medium">Questions</th>
                            <th className="text-left p-2 font-medium">Passing Score</th>
                            <th className="text-left p-2 font-medium">Time Limit</th>
                            <th className="text-left p-2 font-medium">Status</th>
                            <th className="text-left p-2 font-medium">Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {moduleTests.map((test, index) => (
                            <tr key={test.id} className="border-b hover:bg-muted/50">
                              <td className="p-2 text-sm">{index + 1}</td>
                              <td className="p-2 text-sm font-medium">
                                {test.module?.title || 'Unknown Module'}
                              </td>
                              <td className="p-2 text-sm font-medium">
                                {test.title}
                              </td>
                              <td className="p-2 text-sm">
                                {test.totalQuestions || (test.questions?.length || 0)}
                              </td>
                              <td className="p-2 text-sm">
                                {test.passingScore}%
                              </td>
                              <td className="p-2 text-sm">
                                {Math.floor(test.timeLimit / 60)} min
                              </td>
                              <td className="p-2 text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  test.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {test.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="p-2 text-sm text-muted-foreground">
                                {new Date(test.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </main>

    </div>
  )
}
