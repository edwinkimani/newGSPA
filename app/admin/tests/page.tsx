"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Plus, Edit, Trash2, Menu, Eye, Users, Calendar, Clock, Award } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface TestQuestion {
  id: string
  question: string
  category: string
  difficulty: string
  is_active: boolean
  created_at: string
}

interface ExamConfiguration {
  id: string
  name: string
  description: string | null
  questions: string[]
  total_questions: number
  passing_score: number
  time_limit: number
  is_active: boolean
  created_at: string
}

interface UserExam {
  id: string
  user_id: string
  exam_configuration_id: string
  assigned_at: string
  available_from: string | null
  available_until: string | null
  is_completed: boolean
  completed_at: string | null
  score: number | null
  passed: boolean | null
  user_name?: string
  user_email?: string
}

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
}

interface CertificateTemplate {
  id: string
  name: string
  institution_name: string
  certificate_title: string
  certification_type: string
  achievement_description: string
  director_name: string
  director_title: string
  is_active: boolean
  created_at: string
}

export default function AdminTestsPage() {
  const [questions, setQuestions] = useState<TestQuestion[]>([])
  const [examConfigurations, setExamConfigurations] = useState<ExamConfiguration[]>([])
  const [userExams, setUserExams] = useState<UserExam[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [certificateTemplates, setCertificateTemplates] = useState<CertificateTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("questions")

  // Dialog states
  const [createExamDialogOpen, setCreateExamDialogOpen] = useState(false)
  const [assignExamDialogOpen, setAssignExamDialogOpen] = useState(false)
  const [addQuestionDialogOpen, setAddQuestionDialogOpen] = useState(false)

  // Form states
  const [examName, setExamName] = useState("")
  const [examDescription, setExamDescription] = useState("")
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [passingScore, setPassingScore] = useState(70)
  const [timeLimit, setTimeLimit] = useState(60) // minutes
  const [selectedUserId, setSelectedUserId] = useState("")
  const [selectedExamId, setSelectedExamId] = useState("")
  const [availableFrom, setAvailableFrom] = useState("")
  const [availableUntil, setAvailableUntil] = useState("")

  // Add question form states
  const [questionText, setQuestionText] = useState("")
  const [optionA, setOptionA] = useState("")
  const [optionB, setOptionB] = useState("")
  const [optionC, setOptionC] = useState("")
  const [optionD, setOptionD] = useState("")
  const [correctAnswer, setCorrectAnswer] = useState("")
  const [questionCategory, setQuestionCategory] = useState("")
  const [questionDifficulty, setQuestionDifficulty] = useState("easy")

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAdminAndLoadData = async () => {
      try {
        const userRes = await fetch('/api/auth/user')
        if (!userRes.ok) {
          router.push('/auth/login')
          return
        }
        const data = await userRes.json()
        const roleName = data?.profile?.role?.name
        if (roleName !== 'admin') {
          router.push('/dashboard')
          return
        }
        setIsAdmin(true)
        setUserName(`${data?.profile?.first_name || ''} ${data?.profile?.last_name || ''}`.trim() || 'Admin')
        setUserEmail(data?.email || '')
      } catch (err) {
        router.push('/auth/login')
        return
      }

      // Load test questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("test_questions")
        .select("*")
        .order("created_at", { ascending: false })

      if (!questionsError && questionsData) {
        setQuestions(questionsData)
      }

      // Load exam configurations
      const { data: examData, error: examError } = await supabase
        .from("exam_configurations")
        .select("*")
        .order("created_at", { ascending: false })

      if (!examError && examData) {
        setExamConfigurations(examData)
      }

      // Load user exams with user details
      const { data: userExamData, error: userExamError } = await supabase
        .from("user_exams")
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .order("assigned_at", { ascending: false })

      if (!userExamError && userExamData) {
        const formattedUserExams = userExamData.map((exam: any) => ({
          ...exam,
          user_name: exam.profiles ? `${exam.profiles.first_name} ${exam.profiles.last_name}` : 'Unknown',
          user_email: exam.profiles?.email || 'Unknown'
        }))
        setUserExams(formattedUserExams)
      }

      // Load users for assignment
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .order("first_name")

      if (!usersError && usersData) {
        setUsers(usersData)
      }

      // Load certificate templates
      const { data: templatesData, error: templatesError } = await supabase
        .from("certificate_templates")
        .select("*")
        .order("created_at", { ascending: false })

      if (!templatesError && templatesData) {
        setCertificateTemplates(templatesData)
      }

      setIsLoading(false)
    }

    checkAdminAndLoadData()
  }, [supabase, router])

  const handleCreateExam = async () => {
    if (!examName.trim() || selectedQuestions.length === 0) {
      alert("Please provide exam name and select at least one question.")
      return
    }

    try {
      const { data, error } = await supabase
        .from("exam_configurations")
        .insert({
          name: examName,
          description: examDescription,
          questions: selectedQuestions,
          total_questions: selectedQuestions.length,
          passing_score: passingScore,
          time_limit: timeLimit * 60, // Convert minutes to seconds
        })
        .select()
        .single()

      if (error) throw error

      setExamConfigurations([data, ...examConfigurations])
      setCreateExamDialogOpen(false)
      setExamName("")
      setExamDescription("")
      setSelectedQuestions([])
      setPassingScore(70)
      setTimeLimit(60)
    } catch (error) {
      console.error("Error creating exam:", error)
      alert("Error creating exam. Please try again.")
    }
  }

  const handleAssignExam = async () => {
    if (!selectedUserId || !selectedExamId) {
      alert("Please select both a user and an exam.")
      return
    }

    try {
      const availableFromDate = availableFrom ? new Date(availableFrom).toISOString() : null
      const availableUntilDate = availableUntil ? new Date(availableUntil).toISOString() : null

      const { data, error } = await supabase
        .from("user_exams")
        .insert({
          user_id: selectedUserId,
          exam_configuration_id: selectedExamId,
          available_from: availableFromDate,
          available_until: availableUntilDate,
        })
        .select()
        .single()

      if (error) throw error

      // Reload user exams
      const { data: userExamData, error: userExamError } = await supabase
        .from("user_exams")
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .order("assigned_at", { ascending: false })

      if (!userExamError && userExamData) {
        const formattedUserExams = userExamData.map((exam: any) => ({
          ...exam,
          user_name: exam.profiles ? `${exam.profiles.first_name} ${exam.profiles.last_name}` : 'Unknown',
          user_email: exam.profiles?.email || 'Unknown'
        }))
        setUserExams(formattedUserExams)
      }

      setAssignExamDialogOpen(false)
      setSelectedUserId("")
      setSelectedExamId("")
      setAvailableFrom("")
      setAvailableUntil("")
    } catch (error) {
      console.error("Error assigning exam:", error)
      alert("Error assigning exam. Please try again.")
    }
  }

  const handleAddQuestion = async () => {
    if (!questionText.trim() || !optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim() || !correctAnswer || !questionCategory.trim()) {
      alert("Please fill in all fields.")
      return
    }

    if (!['A', 'B', 'C', 'D'].includes(correctAnswer.toUpperCase())) {
      alert("Correct answer must be A, B, C, or D.")
      return
    }

    try {
      const { data, error } = await supabase
        .from("test_questions")
        .insert({
          question: questionText,
          option_a: optionA,
          option_b: optionB,
          option_c: optionC,
          option_d: optionD,
          correct_answer: correctAnswer.toUpperCase(),
          category: questionCategory,
          difficulty: questionDifficulty,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      setQuestions([data, ...questions])
      setAddQuestionDialogOpen(false)
      setQuestionText("")
      setOptionA("")
      setOptionB("")
      setOptionC("")
      setOptionD("")
      setCorrectAnswer("")
      setQuestionCategory("")
      setQuestionDifficulty("easy")
    } catch (error) {
      console.error("Error adding question:", error)
      alert("Error adding question. Please try again.")
    }
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex">
        <div className="flex-1 flex items-center justify-center">
          <Alert variant="destructive">
            <AlertDescription>Access denied. Admin privileges required.</AlertDescription>
          </Alert>
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
          userRole="admin"
          userName={userName}
          userEmail={userEmail}
          isMobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Desktop Sidebar */}
        <DashboardSidebar
          userRole="admin"
          userName={userName}
          userEmail={userEmail}
        />

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
                <h1 className="text-2xl md:text-3xl font-bold mb-2">Test Management</h1>
                <p className="text-muted-foreground">
                  Manage test questions, exam configurations, and user assignments.
                </p>
              </div>
              <div className="flex gap-2">
                <Dialog open={createExamDialogOpen} onOpenChange={setCreateExamDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Exam
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create Exam Configuration</DialogTitle>
                      <DialogDescription>
                        Create a new exam configuration with selected questions.
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
                        <Label>Select Questions ({selectedQuestions.length} selected)</Label>
                        <div className="max-h-60 overflow-y-auto border rounded-md p-4 space-y-2">
                          {questions.filter(q => q.is_active).map((question) => (
                            <div key={question.id} className="flex items-start space-x-2">
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
                              <Label htmlFor={`question-${question.id}`} className="text-sm leading-relaxed">
                                <div className="font-medium">{question.question}</div>
                                <div className="text-muted-foreground">
                                  {question.category} • {question.difficulty}
                                </div>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setCreateExamDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateExam}>
                          Create Exam
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={assignExamDialogOpen} onOpenChange={setAssignExamDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Users className="h-4 w-4 mr-2" />
                      Assign Exam
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Assign Exam to User</DialogTitle>
                      <DialogDescription>
                        Assign an exam configuration to a specific user with optional time restrictions.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="select-user">Select User</Label>
                        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a user" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.first_name} {user.last_name} ({user.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="select-exam">Select Exam</Label>
                        <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose an exam" />
                          </SelectTrigger>
                          <SelectContent>
                            {examConfigurations.filter(exam => exam.is_active).map((exam) => (
                              <SelectItem key={exam.id} value={exam.id}>
                                {exam.name} ({exam.total_questions} questions)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="available-from">Available From</Label>
                          <Input
                            id="available-from"
                            type="datetime-local"
                            value={availableFrom}
                            onChange={(e) => setAvailableFrom(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="available-until">Available Until</Label>
                          <Input
                            id="available-until"
                            type="datetime-local"
                            value={availableUntil}
                            onChange={(e) => setAvailableUntil(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setAssignExamDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAssignExam}>
                          Assign Exam
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {[
                    { id: 'questions', label: 'Questions', icon: FileText },
                    { id: 'exams', label: 'Exam Configurations', icon: FileText },
                    { id: 'assignments', label: 'User Assignments', icon: Users },
                    { id: 'certificates', label: 'Certificate Templates', icon: Award }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-primary text-primary'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon className="h-4 w-4 inline mr-2" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Questions Tab */}
            {activeTab === 'questions' && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{questions.length}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Questions</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {questions.filter(q => q.is_active).length}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Categories</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {new Set(questions.map(q => q.category)).size}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Easy Questions</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {questions.filter(q => q.difficulty === 'easy').length}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Questions Table */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Test Questions</CardTitle>
                        <CardDescription>
                          All test questions in the system. You can add, edit, or deactivate questions.
                        </CardDescription>
                      </div>
                      <Dialog open={addQuestionDialogOpen} onOpenChange={setAddQuestionDialogOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Question
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Add New Question</DialogTitle>
                            <DialogDescription>
                              Create a new test question with multiple choice options.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="question-text">Question</Label>
                              <Textarea
                                id="question-text"
                                value={questionText}
                                onChange={(e) => setQuestionText(e.target.value)}
                                placeholder="Enter the question text"
                                rows={3}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="option-a">Option A</Label>
                                <Input
                                  id="option-a"
                                  value={optionA}
                                  onChange={(e) => setOptionA(e.target.value)}
                                  placeholder="Enter option A"
                                />
                              </div>
                              <div>
                                <Label htmlFor="option-b">Option B</Label>
                                <Input
                                  id="option-b"
                                  value={optionB}
                                  onChange={(e) => setOptionB(e.target.value)}
                                  placeholder="Enter option B"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="option-c">Option C</Label>
                                <Input
                                  id="option-c"
                                  value={optionC}
                                  onChange={(e) => setOptionC(e.target.value)}
                                  placeholder="Enter option C"
                                />
                              </div>
                              <div>
                                <Label htmlFor="option-d">Option D</Label>
                                <Input
                                  id="option-d"
                                  value={optionD}
                                  onChange={(e) => setOptionD(e.target.value)}
                                  placeholder="Enter option D"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="correct-answer">Correct Answer</Label>
                                <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select correct answer" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="A">A</SelectItem>
                                    <SelectItem value="B">B</SelectItem>
                                    <SelectItem value="C">C</SelectItem>
                                    <SelectItem value="D">D</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="question-category">Category</Label>
                                <Input
                                  id="question-category"
                                  value={questionCategory}
                                  onChange={(e) => setQuestionCategory(e.target.value)}
                                  placeholder="e.g., Security, Networking"
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="question-difficulty">Difficulty</Label>
                              <Select value={questionDifficulty} onValueChange={setQuestionDifficulty}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="easy">Easy</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="hard">Hard</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setAddQuestionDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleAddQuestion}>
                                Add Question
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[300px]">Question</TableHead>
                            <TableHead className="min-w-[120px]">Category</TableHead>
                            <TableHead className="min-w-[100px]">Difficulty</TableHead>
                            <TableHead className="min-w-[100px]">Status</TableHead>
                            <TableHead className="min-w-[120px]">Created</TableHead>
                            <TableHead className="min-w-[120px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {questions.map((question) => (
                            <TableRow key={question.id}>
                              <TableCell className="font-medium">
                                <div className="max-w-xs truncate" title={question.question}>
                                  {question.question}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{question.category}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    question.difficulty === 'easy' ? 'default' :
                                    question.difficulty === 'medium' ? 'secondary' : 'destructive'
                                  }
                                >
                                  {question.difficulty}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={question.is_active ? "default" : "secondary"}>
                                  {question.is_active ? "Active" : "Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(question.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Exams Tab */}
            {activeTab === 'exams' && (
              <Card>
                <CardHeader>
                  <CardTitle>Exam Configurations</CardTitle>
                  <CardDescription>
                    Manage exam configurations with specific question sets and settings.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[200px]">Exam Name</TableHead>
                          <TableHead className="min-w-[300px]">Description</TableHead>
                          <TableHead className="min-w-[100px]">Questions</TableHead>
                          <TableHead className="min-w-[100px]">Passing Score</TableHead>
                          <TableHead className="min-w-[120px]">Time Limit</TableHead>
                          <TableHead className="min-w-[100px]">Status</TableHead>
                          <TableHead className="min-w-[120px]">Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {examConfigurations.map((exam) => (
                          <TableRow key={exam.id}>
                            <TableCell className="font-medium">{exam.name}</TableCell>
                            <TableCell>{exam.description || 'No description'}</TableCell>
                            <TableCell>{exam.total_questions}</TableCell>
                            <TableCell>{exam.passing_score}%</TableCell>
                            <TableCell>{Math.floor(exam.time_limit / 60)} min</TableCell>
                            <TableCell>
                              <Badge variant={exam.is_active ? "default" : "secondary"}>
                                {exam.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(exam.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Assignments Tab */}
            {activeTab === 'assignments' && (
              <Card>
                <CardHeader>
                  <CardTitle>User Exam Assignments</CardTitle>
                  <CardDescription>
                    View and manage exam assignments for users.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[150px]">User</TableHead>
                          <TableHead className="min-w-[200px]">Email</TableHead>
                          <TableHead className="min-w-[200px]">Exam</TableHead>
                          <TableHead className="min-w-[120px]">Assigned</TableHead>
                          <TableHead className="min-w-[120px]">Available From</TableHead>
                          <TableHead className="min-w-[120px]">Available Until</TableHead>
                          <TableHead className="min-w-[100px]">Status</TableHead>
                          <TableHead className="min-w-[100px]">Score</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userExams.map((assignment) => (
                          <TableRow key={assignment.id}>
                            <TableCell className="font-medium">{assignment.user_name}</TableCell>
                            <TableCell>{assignment.user_email}</TableCell>
                            <TableCell>
                              {examConfigurations.find(e => e.id === assignment.exam_configuration_id)?.name || 'Unknown Exam'}
                            </TableCell>
                            <TableCell>
                              {new Date(assignment.assigned_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {assignment.available_from
                                ? new Date(assignment.available_from).toLocaleString()
                                : 'Anytime'
                              }
                            </TableCell>
                            <TableCell>
                              {assignment.available_until
                                ? new Date(assignment.available_until).toLocaleString()
                                : 'No limit'
                              }
                            </TableCell>
                            <TableCell>
                              <Badge variant={assignment.is_completed ? "default" : "secondary"}>
                                {assignment.is_completed ? "Completed" : "Pending"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {assignment.score !== null ? `${assignment.score}%` : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Certificates Tab */}
            {activeTab === 'certificates' && (
              <Card>
                <CardHeader>
                  <CardTitle>Certificate Templates</CardTitle>
                  <CardDescription>
                    Customize certificate content, branding, and layout for issued certificates.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[200px]">Template Name</TableHead>
                          <TableHead className="min-w-[200px]">Institution</TableHead>
                          <TableHead className="min-w-[150px]">Certificate Title</TableHead>
                          <TableHead className="min-w-[100px]">Status</TableHead>
                          <TableHead className="min-w-[120px]">Created</TableHead>
                          <TableHead className="min-w-[120px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {certificateTemplates.map((template) => (
                          <TableRow key={template.id}>
                            <TableCell className="font-medium">{template.name}</TableCell>
                            <TableCell>{template.institution_name}</TableCell>
                            <TableCell>{template.certificate_title}</TableCell>
                            <TableCell>
                              <Badge variant={template.is_active ? "default" : "secondary"}>
                                {template.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(template.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
