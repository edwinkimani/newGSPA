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
  GraduationCap,
  BookOpen,
  FileText,
  CheckCircle,
  Clock
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Level {
  id: string
  title: string
  description: string
  orderIndex: number
  isActive: boolean
  estimatedDuration: number
  created_at: string
  module_title?: string
  content_count?: number
  has_test?: boolean
}

export default function MasterPractitionerLevelsPage() {
  const [levels, setLevels] = useState<Level[]>([])
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
        await loadLevels()
      } catch (error) {
        console.error('Error loading data:', error)
        setIsLoading(false)
      }
    }

    checkMasterPractitionerAndLoadData()
  }, [router])

  const loadLevels = async () => {
    try {
      const response = await fetch('/api/levels')
      if (response.ok) {
        const levelsData = await response.json()
        // The API already includes content and test info
        const levelsWithCounts = levelsData.map((level: any) => ({
          ...level,
          content_count: level.contents?.length || 0,
          has_test: !!level.levelTest,
          module_title: level.module?.title || 'Unknown Module'
        }))
        setLevels(levelsWithCounts)
      } else {
        // API not available yet, set empty array
        setLevels([])
      }
    } catch (error) {
      console.warn('Levels API not available yet, setting empty levels')
      setLevels([])
    }

    setIsLoading(false)
  }

  const handleDeleteLevel = async (levelId: string) => {
    if (!confirm("Are you sure you want to delete this level? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/levels?id=${levelId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setLevels(levels.filter(level => level.id !== levelId))
      }
    } catch (error) {
      console.error('Error deleting level:', error)
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
              <h1 className="text-3xl font-bold mb-2">Level Management</h1>
              <p className="text-muted-foreground">
                Create and manage learning levels for your modules
              </p>
            </div>
            <Link href="/master-practitioner/levels/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Level
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Levels</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{levels.length}</div>
              <p className="text-xs text-muted-foreground">
                Learning levels created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Levels</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{levels.filter(l => l.isActive).length}</div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With Tests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{levels.filter(l => l.has_test).length}</div>
              <p className="text-xs text-muted-foreground">
                Levels with assessments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Content</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{levels.reduce((sum, level) => sum + (level.content_count || 0), 0)}</div>
              <p className="text-xs text-muted-foreground">
                Content items across levels
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Levels Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Levels</CardTitle>
            <CardDescription>
              Manage your learning levels and their content
            </CardDescription>
          </CardHeader>
          <CardContent>
            {levels.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No levels created yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first learning level to get started
                </p>
                <Link href="/master-practitioner/levels/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Level
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Level</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Test</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {levels.map((level) => (
                    <TableRow key={level.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{level.title}</div>
                          <div className="text-sm text-muted-foreground">
                            Level {level.orderIndex + 1}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{level.module_title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {level.content_count} items
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {level.has_test ? (
                          <Badge variant="default">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={level.isActive ? "default" : "secondary"}>
                          {level.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(level.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/master-practitioner/levels/${level.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/master-practitioner/levels/${level.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLevel(level.id)}
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
