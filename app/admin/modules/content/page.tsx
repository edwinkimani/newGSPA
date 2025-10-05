"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, FileText, Video, BookOpen, Upload, Eye, EyeOff, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"

interface Module {
  id: string
  title: string
  description: string
}

interface ModuleContent {
  id: string
  title: string
  description: string
  content_type: string
  content_url: string
  content_text: string
  duration_minutes: number
  is_required: boolean
  order_index: number
  is_published: boolean
  published_at: string
  created_at: string
}

interface ContentFormData {
  title: string
  description: string
  content_type: string
  content_url: string
  content_text: string
  duration_minutes: number
  is_required: boolean
  order_index: number
  is_published: boolean
}

export default function ModuleContentPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [content, setContent] = useState<ModuleContent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingContent, setEditingContent] = useState<ModuleContent | null>(null)
  const [formData, setFormData] = useState<ContentFormData>({
    title: '',
    description: '',
    content_type: 'notes',
    content_url: '',
    content_text: '',
    duration_minutes: 0,
    is_required: true,
    order_index: 0,
    is_published: false
  })

  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const moduleId = searchParams.get('moduleId')

  useEffect(() => {
    fetchModules()
  }, [])

  useEffect(() => {
    if (moduleId) {
      const module = modules.find(m => m.id === moduleId)
      if (module) {
        setSelectedModule(module)
        fetchContent(moduleId)
      }
    }
  }, [modules, moduleId])

  const fetchModules = async () => {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('id, title, description')
        .order('title')

      if (error) throw error
      setModules(data || [])
    } catch (error) {
      console.error('Error fetching modules:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchContent = async (moduleId: string) => {
    try {
      const { data, error } = await supabase
        .from('module_content')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index')

      if (error) throw error
      setContent(data || [])
    } catch (error) {
      console.error('Error fetching content:', error)
    }
  }

  const handleModuleSelect = (module: Module) => {
    setSelectedModule(module)
    fetchContent(module.id)
    router.push(`/admin/modules/content?moduleId=${module.id}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedModule) {
      alert('Please select a module first')
      return
    }

    try {
      const contentData = {
        ...formData,
        module_id: selectedModule.id,
        published_at: formData.is_published ? new Date().toISOString() : null
      }

      if (editingContent) {
        const { error } = await supabase
          .from('module_content')
          .update(contentData)
          .eq('id', editingContent.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('module_content')
          .insert(contentData)

        if (error) throw error
      }

      // Refresh content
      fetchContent(selectedModule.id)

      // Reset form
      setFormData({
        title: '',
        description: '',
        content_type: 'notes',
        content_url: '',
        content_text: '',
        duration_minutes: 0,
        is_required: true,
        order_index: content.length,
        is_published: false
      })
      setEditingContent(null)
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error saving content:', error)
      alert('Error saving content. Please try again.')
    }
  }

  const handleEdit = (contentItem: ModuleContent) => {
    setEditingContent(contentItem)
    setFormData({
      title: contentItem.title,
      description: contentItem.description || '',
      content_type: contentItem.content_type,
      content_url: contentItem.content_url || '',
      content_text: contentItem.content_text || '',
      duration_minutes: contentItem.duration_minutes || 0,
      is_required: contentItem.is_required,
      order_index: contentItem.order_index,
      is_published: contentItem.is_published
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return

    try {
      const { error } = await supabase
        .from('module_content')
        .delete()
        .eq('id', contentId)

      if (error) throw error

      if (selectedModule) {
        fetchContent(selectedModule.id)
      }
    } catch (error) {
      console.error('Error deleting content:', error)
      alert('Error deleting content. Please try again.')
    }
  }

  const togglePublish = async (contentItem: ModuleContent) => {
    try {
      const { error } = await supabase
        .from('module_content')
        .update({
          is_published: !contentItem.is_published,
          published_at: !contentItem.is_published ? new Date().toISOString() : null
        })
        .eq('id', contentItem.id)

      if (error) throw error

      if (selectedModule) {
        fetchContent(selectedModule.id)
      }
    } catch (error) {
      console.error('Error toggling publish status:', error)
      alert('Error updating publish status. Please try again.')
    }
  }

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />
      case 'document': return <FileText className="h-4 w-4" />
      case 'notes': return <BookOpen className="h-4 w-4" />
      case 'quiz': return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Module Content Management</h1>
          <p className="text-muted-foreground">Create and manage coursework, notes, and materials for training modules.</p>
        </div>

        {/* Module Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Module</CardTitle>
            <CardDescription>Choose a module to manage its content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((module) => (
                <Card
                  key={module.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedModule?.id === module.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleModuleSelect(module)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{module.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{module.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedModule && (
          <>
            {/* Content Management */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Content for: {selectedModule.title}</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingContent(null)
                    setFormData({
                      title: '',
                      description: '',
                      content_type: 'notes',
                      content_url: '',
                      content_text: '',
                      duration_minutes: 0,
                      is_required: true,
                      order_index: content.length,
                      is_published: false
                    })
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Content
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingContent ? 'Edit Content' : 'Add New Content'}</DialogTitle>
                    <DialogDescription>
                      Create coursework, notes, or materials for students to study.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="content_type">Content Type *</Label>
                        <Select value={formData.content_type} onValueChange={(value) => setFormData({ ...formData, content_type: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="notes">Study Notes</SelectItem>
                            <SelectItem value="document">Document/PDF</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="quiz">Quiz</SelectItem>
                            <SelectItem value="assignment">Assignment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>

                    {(formData.content_type === 'notes' || formData.content_type === 'assignment') && (
                      <div>
                        <Label htmlFor="content_text">Content Text</Label>
                        <Textarea
                          id="content_text"
                          value={formData.content_text}
                          onChange={(e) => setFormData({ ...formData, content_text: e.target.value })}
                          rows={8}
                          placeholder="Enter the study notes or assignment content here..."
                        />
                      </div>
                    )}

                    {(formData.content_type === 'video' || formData.content_type === 'document') && (
                      <div>
                        <Label htmlFor="content_url">Content URL</Label>
                        <Input
                          id="content_url"
                          type="url"
                          value={formData.content_url}
                          onChange={(e) => setFormData({ ...formData, content_url: e.target.value })}
                          placeholder="https://example.com/content"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                        <Input
                          id="duration_minutes"
                          type="number"
                          value={formData.duration_minutes}
                          onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                          min="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="order_index">Order</Label>
                        <Input
                          id="order_index"
                          type="number"
                          value={formData.order_index}
                          onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_required"
                        checked={formData.is_required}
                        onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                      />
                      <Label htmlFor="is_required">Required content</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_published"
                        checked={formData.is_published}
                        onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                      />
                      <Label htmlFor="is_published">Publish immediately</Label>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        {editingContent ? 'Update Content' : 'Create Content'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Content List */}
            {content.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No content yet</h3>
                  <p className="text-muted-foreground">Add study materials, notes, and coursework for this module.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {content.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            {getContentTypeIcon(item.content_type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{item.title}</h3>
                              <Badge variant={item.is_published ? "default" : "secondary"}>
                                {item.is_published ? "Published" : "Draft"}
                              </Badge>
                              {item.is_required && (
                                <Badge variant="outline">Required</Badge>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-muted-foreground mb-2">{item.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Type: {item.content_type}</span>
                              {item.duration_minutes > 0 && (
                                <span>Duration: {item.duration_minutes} min</span>
                              )}
                              <span>Order: {item.order_index}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => togglePublish(item)}
                          >
                            {item.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
