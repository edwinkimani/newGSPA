"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Plus,
  Edit,
  Eye,
  Trash2,
  BookOpen,
  Users,
  Clock,
  Target
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Module {
  id: string
  title: string
  description: string
  category: string
  difficultyLevel: string
  estimatedDuration: number
  price: number
  isActive: boolean
  isFeatured: boolean
  createdAt: string
  question_count?: number
  level_count?: number
  enrollment_count?: number
}

export default function MasterPractitionerModulesPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMasterPractitioner, setIsMasterPractitioner] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkMasterPractitionerAndLoadData = async () => {
      try {
        // Check authentication via API
        const authRes = await fetch('/api/auth/user')
        if (authRes.status === 401) {
          router.push('/auth/login')
          return
        }
        const authData = await authRes.json()
        const profile = authData.profile
        if (!profile) {
          router.push('/register')
          return
        }

        // Check if master practitioner
        if (!profile.role_id) {
          router.push("/dashboard")
          return
        }

        const roleRes = await fetch(`/api/roles/${profile.role_id}`)
        const roleData = await roleRes.json()
        if (roleData.role?.name !== 'master_practitioner') {
          router.push("/dashboard")
          return
        }

        setIsMasterPractitioner(true)
        await loadModules()
      } catch (error) {
        console.error('Error loading data:', error)
        setIsLoading(false)
      }
    }

    checkMasterPractitionerAndLoadData()
  }, [router])

  const loadModules = async () => {
    try {
      const response = await fetch('/api/modules')
      if (response.ok) {
        const modulesData = await response.json()
        // Get additional counts for each module
        const modulesWithCounts = await Promise.all(
          modulesData.map(async (module: any) => {
            // For now, we'll use the questions count from the include
            const questionCount = module.questions?.length || 0
            const enrollmentCount = module.enrollments?.length || 0

            // Try to get level count
            let levelCount = 0
            try {
              const levelsResponse = await fetch(`/api/levels?moduleId=${module.id}`)
              if (levelsResponse.ok) {
                const levelsData = await levelsResponse.json()
                levelCount = levelsData.length
              }
            } catch (error) {
              console.warn('Levels API not available yet')
            }

            return {
              ...module,
              question_count: questionCount,
              level_count: levelCount,
              enrollment_count: enrollmentCount
            }
          })
        )
        setModules(modulesWithCounts)
      }
    } catch (error) {
      console.error('Error loading modules:', error)
    }

    setIsLoading(false)
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this module? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/modules?id=${moduleId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setModules(modules.filter(module => module.id !== moduleId))
      }
    } catch (error) {
      console.error('Error deleting module:', error)
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/master-practitioner">
            <Button variant="ghost" className="mb-4">
              ← Back to Dashboard
            </Button>
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Module Management</h1>
              <p className="text-muted-foreground">
                Create and manage learning modules for practitioners
              </p>
            </div>
            <Link href="/master-practitioner/modules/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Module
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{modules.length}</div>
              <p className="text-xs text-muted-foreground">
                Learning modules created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{modules.filter(m => m.isActive).length}</div>
              <p className="text-xs text-muted-foreground">
                Currently available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{modules.reduce((sum, module) => sum + (module.enrollment_count || 0), 0)}</div>
              <p className="text-xs text-muted-foreground">
                Students enrolled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Levels</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{modules.reduce((sum, module) => sum + (module.level_count || 0), 0)}</div>
              <p className="text-xs text-muted-foreground">
                Learning levels across modules
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Modules Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Modules</CardTitle>
            <CardDescription>
              Manage your learning modules and their content
            </CardDescription>
          </CardHeader>
          <CardContent>
            {modules.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No modules created yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first learning module to get started
                </p>
                <Link href="/master-practitioner/modules/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Module
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Levels</TableHead>
                    <TableHead>Enrollments</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.map((module) => (
                    <TableRow key={module.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{module.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {module.question_count} questions
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{module.category}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{module.difficultyLevel}</Badge>
                      </TableCell>
                      <TableCell>{module.level_count || 0}</TableCell>
                      <TableCell>{module.enrollment_count || 0}</TableCell>
                      <TableCell>
                        <Badge variant={module.isActive ? "default" : "secondary"}>
                          {module.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>${module.price}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/master-practitioner/modules/${module.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/master-practitioner/modules/${module.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteModule(module.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
