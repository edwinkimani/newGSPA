"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ArrowLeft,
  Plus,
  Edit,
  Eye,
  Trash2,
  FileText,
  Video,
  BookOpen,
  CheckCircle,
  Clock,
  Target
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface Level {
  id: string
  title: string
  description: string
  orderIndex: number
  isActive: boolean
  estimatedDuration: number
  learningObjectives: any
  created_at: string
  module_title?: string
}

interface ModuleContent {
  id: string
  title: string
  description: string
  contentType: string
  durationMinutes: number
  isRequired: boolean
  orderIndex: number
  isPublished: boolean
  created_at: string
}

interface LevelTest {
  id: string
  title: string
  description: string
  totalQuestions: number
  passingScore: number
  timeLimit: number
  isActive: boolean
}

export default function LevelDetailPage() {
  const params = useParams()
  const levelId = params.levelId as string
  const [level, setLevel] = useState<Level | null>(null)
  const [contents, setContents] = useState<ModuleContent[]>([])
  const [levelTest, setLevelTest] = useState<LevelTest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMasterPractitioner, setIsMasterPractitioner] = useState(false)
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
    }

    if (levelId) {
      checkMasterPractitionerAndLoadData()
    }
  }, [levelId, supabase, router])

  const loadLevelData = async () => {
    // Load level details
    const { data: levelData, error: levelError } = await supabase
      .from("levels")
      .select(`
        *,
        modules:module_id (
          title
        )
      `)
      .eq("id", levelId)
      .single()

    if (levelError || !levelData) {
      router.push("/admin/levels")
      return
    }

    setLevel({
      ...levelData,
      module_title: levelData.modules?.title || 'Unknown Module'
    })

    // Load level contents
    const { data: contentsData, error: contentsError } = await supabase
      .from("module_contents")
      .select("*")
      .eq("level_id", levelId)
      .order("orderIndex", { ascending: true })

    if (!contentsError && contentsData) {
      setContents(contentsData)
    }

    // Load level test
    const { data: testData, error: testError } = await supabase
      .from("level_tests")
      .select("*")
      .eq("level_id", levelId)
      .single()

    if (!testError && testData) {
      setLevelTest(testData)
    }

    setIsLoading(false)
  }

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm("Are you sure you want to delete this content? This action cannot be undone.")) {
      return
    }

    const { error } = await supabase
      .from("module_contents")
      .delete()
      .eq("id", contentId)

    if (!error) {
      setContents(contents.filter(content => content.id !== contentId))
    }
  }

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType.toLowerCase()) {
      case 'video':
        return <Video className="h-4 w-4" />
      case 'document':
      case 'notes':
      case 'study_guide':
        return <FileText className="h-4 w-4" />
      case 'quiz':
        return <Target className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
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
          <Link href="/admin/levels">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Levels
            </Button>
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{level.title}</h1>
              <p className="text-muted-foreground mb-2">{level.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Module: {level.module_title}</span>
                <span>•</span>
                <span>Level {level.orderIndex + 1}</span>
                <span>•</span>
                <Badge variant={level.isActive ? "default" : "secondary"}>
                  {level.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/levels/${levelId}/edit`}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Level
                </Button>
              </Link>
              <Link href={`/admin/levels/${levelId}/content/create`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Content
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Level Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Content</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contents.length}</div>
              <p className="text-xs text-muted-foreground">
                Content items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contents.filter(c => c.isPublished).length}</div>
              <p className="text-xs text-muted-foreground">
                Published content
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Required</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contents.filter(c => c.isRequired).length}</div>
              <p className="text-xs text-muted-foreground">
                Required items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Level Test</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{levelTest ? "Yes" : "No"}</div>
              <p className="text-xs text-muted-foreground">
                Assessment available
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Level Content */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Level Content</CardTitle>
                <CardDescription>Content items in this level</CardDescription>
              </div>
              <Link href={`/admin/levels/${levelId}/content/create`}>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Content
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {contents.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No content added yet</p>
                  <Link href={`/admin/levels/${levelId}/content/create`}>
                    <Button>Add Your First Content</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {contents.map((content) => (
                    <div key={content.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getContentTypeIcon(content.contentType)}
                        <div>
                          <div className="font-medium text-sm">{content.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {content.contentType} • {content.durationMinutes} min • Order: {content.orderIndex}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={content.isPublished ? "default" : "secondary"}>
                          {content.isPublished ? "Published" : "Draft"}
                        </Badge>
                        {content.isRequired && (
                          <Badge variant="outline">Required</Badge>
                        )}
                        <div className="flex gap-1">
                          <Link href={`/admin/levels/${levelId}/content/${content.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/levels/${levelId}/content/${content.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteContent(content.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Level Test */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Level Assessment</CardTitle>
                <CardDescription>Test at the end of this level</CardDescription>
              </div>
              {levelTest ? (
                <Link href={`/admin/levels/${levelId}/test/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Test
                  </Button>
                </Link>
              ) : (
                <Link href={`/admin/levels/${levelId}/test/create`}>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Test
                  </Button>
                </Link>
              )}
            </CardHeader>
            <CardContent>
              {levelTest ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">{levelTest.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{levelTest.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Questions:</span>
                      <span className="ml-2 font-medium">{levelTest.totalQuestions}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Passing Score:</span>
                      <span className="ml-2 font-medium">{levelTest.passingScore}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time Limit:</span>
                      <span className="ml-2 font-medium">{Math.floor(levelTest.timeLimit / 60)} min</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={levelTest.isActive ? "default" : "secondary"} className="ml-2">
                        {levelTest.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No test created for this level</p>
                  <Link href={`/admin/levels/${levelId}/test/create`}>
                    <Button>Create Level Test</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
