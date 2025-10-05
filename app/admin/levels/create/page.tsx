"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"

interface Module {
  id: string
  title: string
  description: string
}

export default function CreateLevelPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isMasterPractitioner, setIsMasterPractitioner] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    moduleId: "",
    orderIndex: 0,
    isActive: true,
    estimatedDuration: 60, // minutes
    learningObjectives: ""
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
      await loadModules()
    }

    checkMasterPractitionerAndLoadData()
  }, [supabase, router])

  const loadModules = async () => {
    const { data: modulesData, error } = await supabase
      .from("modules")
      .select("id, title, description")
      .order("title", { ascending: true })

    if (!error && modulesData) {
      setModules(modulesData)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Get the next order index for the selected module
      const { data: existingLevels } = await supabase
        .from("levels")
        .select("orderIndex")
        .eq("moduleId", formData.moduleId)
        .order("orderIndex", { ascending: false })
        .limit(1)

      const nextOrderIndex = existingLevels && existingLevels.length > 0
        ? existingLevels[0].orderIndex + 1
        : 0

      const { data, error } = await supabase
        .from("levels")
        .insert({
          title: formData.title,
          description: formData.description,
          moduleId: formData.moduleId,
          orderIndex: nextOrderIndex,
          isActive: formData.isActive,
          estimatedDuration: formData.estimatedDuration,
          learningObjectives: formData.learningObjectives ? JSON.parse(formData.learningObjectives) : null
        })
        .select()
        .single()

      if (error) throw error

      toast.success("Level created successfully!")
      router.push("/admin/levels")
    } catch (error) {
      console.error("Error creating level:", error)
      toast.error("Failed to create level. Please try again.")
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
          <Link href="/admin/levels">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Levels
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Create New Level</h1>
          <p className="text-muted-foreground">
            Create a learning level for your module
          </p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Level Information</CardTitle>
            <CardDescription>
              Fill in the details for the new learning level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="moduleId">Module *</Label>
                <Select
                  value={formData.moduleId}
                  onValueChange={(value) => handleInputChange("moduleId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a module" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Level Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., Introduction to Security Fundamentals"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe what students will learn in this level"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedDuration">Estimated Duration (minutes)</Label>
                  <Input
                    id="estimatedDuration"
                    type="number"
                    value={formData.estimatedDuration}
                    onChange={(e) => handleInputChange("estimatedDuration", parseInt(e.target.value) || 0)}
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

              <div className="space-y-2">
                <Label htmlFor="learningObjectives">Learning Objectives</Label>
                <Textarea
                  id="learningObjectives"
                  value={formData.learningObjectives}
                  onChange={(e) => handleInputChange("learningObjectives", e.target.value)}
                  placeholder='Enter learning objectives as JSON array: ["Objective 1", "Objective 2"]'
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Enter as JSON array format
                </p>
              </div>

              <div className="flex justify-end gap-4">
                <Link href="/admin/levels">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Creating..." : "Create Level"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
