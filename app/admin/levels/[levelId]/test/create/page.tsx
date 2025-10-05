"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { toast } from "sonner"

interface Level {
  id: string
  title: string
  module_title?: string
}

interface Question {
  id: string
  question: string
  category: string
  difficulty: string
}

export default function CreateLevelTestPage() {
  const params = useParams()
  const levelId = params.levelId as string
  const [level, setLevel] = useState<Level | null>(null)
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isMasterPractitioner, setIsMasterPractitioner] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    totalQuestions: 10,
    passingScore: 70,
    timeLimit: 1800, // 30 minutes
    isActive: true
  })

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkMasterPractitionerAndLoadData = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push("/auth/login")
        return
      }

      // Check if master practitioner
      const { data: profile } = await supabase
        .from('profiles')
        .select('role_id')
        .eq('id', authUser.id)
        .single()

      if (!profile?.role_id) {
        router.push("/practitioner")
        return
      }

      const { data: role } = await supabase
        .from('roles')
        .select('name')
        .eq('id', profile.role_id)
        .single()

      if (role?.name !== 'master_practitioner') {
        router.push("/practitioner")
        return
      }

      setIsMasterPractitioner(true)
      await loadLevelData()
      await loadAvailableQuestions()
    }

    if (levelId) {
      checkMasterPractitionerAndLoadData()
    }
  }, [levelId, supabase, router])

  const loadLevelData = async () => {
    const { data: levelData, error } = await supabase
      .from("levels")
      .select(`
        id, title,
        modules:module_id (
          title
        )
      `)
      .eq("id", levelId)
      .single()

    if (error || !levelData) {
      router.push("/admin/levels")
      return
    }

    setLevel({
      ...levelData,
      module_title: levelData.modules?.title || 'Unknown Module'
    })
  }

  const loadAvailableQuestions = async () => {
    // Get questions from the module that this level belongs to
    const { data: levelData } = await supabase
      .from("levels")
      .select("module_id")
      .eq("id", levelId)
      .single()

    if (levelData) {
      const { data: questions, error } = await supabase
        .from("test_questions")
        .select("id, question, category, difficulty")
        .eq("module_id", levelData.module_id)
        .eq("isActive", true)
        .order("created_at", { ascending: false })

      if (!error && questions) {
        setAvailableQuestions(questions)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate that we have enough questions selected
      if (selectedQuestions.length < formData.totalQuestions) {
        toast.error(`Please select at least ${formData.totalQuestions} questions`)
        return
      }

      const { data, error } = await supabase
        .from("level_tests")
        .insert({
          level_id: levelId,
          title: formData.title,
          description: formData.description,
          questions: selectedQuestions.slice(0, formData.totalQuestions),
          totalQuestions: formData.totalQuestions,
          passingScore: formData.passingScore,
          timeLimit: formData.timeLimit,
          isActive: formData.isActive
        })
        .select()
        .single()

      if (error) throw error

      toast.success("Level test created successfully!")
      router.push(`/admin/levels/${levelId}`)
    } catch (error) {
      console.error("Error creating level test:", error)
      toast.error("Failed to create level test. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleQuestionToggle = (questionId: string) => {
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    )
  }

  if (!isMasterPractitioner || !level) {
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href={`/admin/levels/${levelId}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Level
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Create Level Test</h1>
          <p className="text-muted-foreground">
            Create an assessment for level: {level.title}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
              <CardDescription>
                Set up the basic test parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Test Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="e.g., Level 1 Assessment"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe what this test assesses"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalQuestions">Total Questions</Label>
                    <Input
                      id="totalQuestions"
                      type="number"
                      value={formData.totalQuestions}
                      onChange={(e) => handleInputChange("totalQuestions", parseInt(e.target.value) || 0)}
                      min="1"
                      max={availableQuestions.length}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passingScore">Passing Score (%)</Label>
                    <Input
                      id="passingScore"
                      type="number"
                      value={formData.passingScore}
                      onChange={(e) => handleInputChange("passingScore", parseInt(e.target.value) || 0)}
                      min="1"
                      max="100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      value={Math.floor(formData.timeLimit / 60)}
                      onChange={(e) => handleInputChange("timeLimit", parseInt(e.target.value) * 60 || 0)}
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="isActive">Active Status</Label>
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                      />
                      <Label htmlFor="isActive" className="text-sm">
                        {formData.isActive ? "Active" : "Inactive"}
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Link href={`/admin/levels/${levelId}`}>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Creating..." : "Create Test"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Question Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Question Selection</CardTitle>
              <CardDescription>
                Select questions for this test ({selectedQuestions.length}/{formData.totalQuestions} selected)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableQuestions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No questions available. Please create questions for this module first.
                  </p>
                  <Link href="/admin/modules">
                    <Button className="mt-4">Go to Modules</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {availableQuestions.map((question) => (
                    <div
                      key={question.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedQuestions.includes(question.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleQuestionToggle(question.id)}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedQuestions.includes(question.id)}
                          onChange={() => handleQuestionToggle(question.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{question.question}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">{question.category}</span>
                            <span className="text-xs px-2 py-1 bg-muted rounded">
                              {question.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
