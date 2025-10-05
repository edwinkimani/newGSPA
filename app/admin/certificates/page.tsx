"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, Download, Menu, Eye, Calendar, User, Settings, Save, Palette } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import CertificateSeal from "@/components/certificate-seal"

interface CertificateUser {
  id: string
  first_name: string
  last_name: string
  email: string
  certificate_issued: boolean
  certificate_url: string | null
  certificate_available_at: string | null
  test_completed: boolean
  test_score: number | null
  created_at: string
}

interface CertificateTemplate {
  id: string
  template_name: string
  organization_name: string
  organization_logo_url: string | null
  certificate_title: string
  certificate_subtitle: string
  main_title: string
  recipient_title: string
  achievement_description: string
  date_label: string
  score_label: string
  certificate_id_label: string
  signature_name: string
  signature_title: string
  signature_organization: string
  background_color: string
  primary_color: string
  accent_color: string
  font_family: string
  watermark_text: string | null
  is_active: boolean
  created_at: string
}

export default function AdminCertificatesPage() {
  const [certifiedUsers, setCertifiedUsers] = useState<CertificateUser[]>([])
  const [certificateTemplates, setCertificateTemplates] = useState<CertificateTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("certificates")

  // Certificate template form state
  const [templateForm, setTemplateForm] = useState({
    template_name: "Default Certificate",
    organization_name: "Global Security Practitioners Alliance",
    certificate_title: "Certificate of Excellence",
    certificate_subtitle: "Professional Security Certification",
    main_title: "Certificate of Excellence",
    recipient_title: "This certifies that",
    achievement_description: "has demonstrated exceptional mastery and professional excellence in the field of Cybersecurity and Risk Management, successfully completing the comprehensive Security Aptitude Assessment with distinction. This achievement represents a commitment to the highest standards of professional competency in security protocols, threat analysis, compliance frameworks, and emergency response procedures.",
    date_label: "Date of Achievement",
    score_label: "Excellence Score",
    certificate_id_label: "Certification ID",
    signature_name: "Dr. Alexandra Sterling",
    signature_title: "Director of Professional Certification",
    signature_organization: "Global Security Institute",
    director_signature: "",
    background_color: "#fefefe",
    primary_color: "#1a2332",
    accent_color: "#c9aa68",
    font_family: "Cormorant Garamond, Times New Roman, serif",
    watermark_text: "CERTIFIED"
  })

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

        // Load users with certificates
        const { data: users, error: usersError } = await supabase
          .from("profiles")
          .select("*")
          .eq("certificate_issued", true)
          .order("created_at", { ascending: false })

      if (!usersError && users) {
        setCertifiedUsers(users)
      }

      // Load certificate templates
      const { data: templates, error: templatesError } = await supabase
        .from("certificate_templates")
        .select("*")
        .order("created_at", { ascending: false })

      if (!templatesError && templates) {
        setCertificateTemplates(templates)

  // Load the active template into the form
  const activeTemplate = templates.find((t: CertificateTemplate) => t.is_active) || templates[0]
        if (activeTemplate) {
          setTemplateForm({
            template_name: activeTemplate.template_name,
            organization_name: activeTemplate.organization_name,
            certificate_title: activeTemplate.certificate_title,
            certificate_subtitle: activeTemplate.certificate_subtitle,
            main_title: activeTemplate.main_title,
            recipient_title: activeTemplate.recipient_title,
            achievement_description: activeTemplate.achievement_description,
            date_label: activeTemplate.date_label,
            score_label: activeTemplate.score_label,
            certificate_id_label: activeTemplate.certificate_id_label,
            signature_name: activeTemplate.signature_name,
            signature_title: activeTemplate.signature_title,
            signature_organization: activeTemplate.signature_organization,
            director_signature: (activeTemplate as any).director_signature || "",
            background_color: activeTemplate.background_color,
            primary_color: activeTemplate.primary_color,
            accent_color: activeTemplate.accent_color,
            font_family: activeTemplate.font_family,
            watermark_text: activeTemplate.watermark_text || ""
          })
        }
      }

      setIsLoading(false)
      } catch (error) {
        console.error('Error checking admin:', error)
        router.push('/auth/login')
        return
      }
    }

    checkAdminAndLoadData()
  }, [supabase, router])

  const handleSaveTemplate = async () => {
    try {
      const activeTemplate = certificateTemplates.find(t => t.is_active)

      if (activeTemplate) {
        const { error } = await supabase
          .from("certificate_templates")
          .update({
            ...templateForm,
            updated_at: new Date().toISOString()
          })
          .eq("id", activeTemplate.id)

        if (error) throw error

        alert("Certificate template updated successfully!")
      } else {
        // Create new template
        const { error } = await supabase
          .from("certificate_templates")
          .insert({
            ...templateForm,
            is_active: true
          })

        if (error) throw error

        alert("Certificate template created successfully!")

        // Reload templates
        const { data: templates } = await supabase
          .from("certificate_templates")
          .select("*")
          .order("created_at", { ascending: false })

        if (templates) {
          setCertificateTemplates(templates)
        }
      }
    } catch (error) {
      console.error("Error saving template:", error)
      alert("Error saving certificate template. Please try again.")
    }
  }

  const handleTemplateChange = (field: string, value: string) => {
    setTemplateForm(prev => ({
      ...prev,
      [field]: value
    }))
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
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <DashboardSidebar
          userRole="admin"
          userName={userName}
          userEmail={userEmail}
        />
      </div>

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

      <main className="flex-1 min-h-screen overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden bg-background border-b border-border p-4 flex items-center justify-between sticky top-0 z-30">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileMenuOpen(true)}
            className="border-border hover:bg-muted"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Certificate Management</h1>
          <div className="w-8" /> {/* Spacer for balance */}
        </header>

        <div className="p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Certificate Management</h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Manage issued certificates and customize certificate templates.
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="certificates"
                  className="flex items-center gap-2"
                >
                  <Award className="h-4 w-4" />
                  <span className="hidden sm:inline">Issued Certificates</span>
                  <span className="sm:hidden">Certificates</span>
                </TabsTrigger>
                <TabsTrigger
                  value="templates"
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Certificate Templates</span>
                  <span className="sm:hidden">Templates</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="certificates" className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
                      <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{certifiedUsers.length}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">This Month</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {certifiedUsers.filter(u => {
                          const certDate = new Date(u.certificate_available_at || u.created_at)
                          const now = new Date()
                          return certDate.getMonth() === now.getMonth() &&
                            certDate.getFullYear() === now.getFullYear()
                        }).length}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">High Scorers</CardTitle>
                      <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {certifiedUsers.filter(u => (u.test_score || 0) >= 80).length}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                      <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {certifiedUsers.length > 0
                          ? Math.round(certifiedUsers.reduce((sum, u) => sum + (u.test_score || 0), 0) / certifiedUsers.length)
                          : 0}%
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Certificates Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Issued Certificates</CardTitle>
                    <CardDescription>
                      All certificates that have been issued to certified users.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {certifiedUsers.length === 0 ? (
                      <div className="text-center py-12">
                        <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Certificates Issued</h3>
                        <p className="text-muted-foreground">
                          No users have been issued certificates yet.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Score</TableHead>
                              <TableHead>Issued Date</TableHead>
                              <TableHead>Certificate ID</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {certifiedUsers.map((user) => (
                              <TableRow key={user.id}>
                                <TableCell className="font-medium">
                                  {user.first_name} {user.last_name}
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                  <Badge variant="secondary">
                                    {user.test_score}%
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {user.certificate_available_at
                                    ? new Date(user.certificate_available_at).toLocaleDateString()
                                    : new Date(user.created_at).toLocaleDateString()
                                  }
                                </TableCell>
                                <TableCell>
                                  <code className="text-xs bg-muted px-2 py-1 rounded">
                                    GSPA-{user.id.toUpperCase().slice(0, 8)}
                                  </code>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="templates" className="space-y-6">
                {/* Template Editor */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Certificate Template Editor
                    </CardTitle>
                    <CardDescription>
                      Customize the appearance and content of certificates issued to users.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Organization Settings */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          Organization Details
                        </h3>

                        <div className="space-y-2">
                          <Label htmlFor="template_name">Template Name</Label>
                          <Input
                            id="template_name"
                            value={templateForm.template_name}
                            onChange={(e) => handleTemplateChange('template_name', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="organization_name">Organization Name</Label>
                          <Input
                            id="organization_name"
                            value={templateForm.organization_name}
                            onChange={(e) => handleTemplateChange('organization_name', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="certificate_title">Certificate Title</Label>
                          <Input
                            id="certificate_title"
                            value={templateForm.certificate_title}
                            onChange={(e) => handleTemplateChange('certificate_title', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="certificate_subtitle">Certificate Subtitle</Label>
                          <Input
                            id="certificate_subtitle"
                            value={templateForm.certificate_subtitle}
                            onChange={(e) => handleTemplateChange('certificate_subtitle', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Content Settings */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Certificate Content
                        </h3>

                        <div className="space-y-2">
                          <Label htmlFor="main_title">Main Title</Label>
                          <Input
                            id="main_title"
                            value={templateForm.main_title}
                            onChange={(e) => handleTemplateChange('main_title', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="recipient_title">Recipient Title</Label>
                          <Input
                            id="recipient_title"
                            value={templateForm.recipient_title}
                            onChange={(e) => handleTemplateChange('recipient_title', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="achievement_description">Achievement Description</Label>
                          <Textarea
                            id="achievement_description"
                            value={templateForm.achievement_description}
                            onChange={(e) => handleTemplateChange('achievement_description', e.target.value)}
                            rows={4}
                            className="resize-vertical"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4">
                      <Button
                        onClick={handleSaveTemplate}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save Template Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Certificate Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Certificate Preview
                    </CardTitle>
                    <CardDescription>
                      Live preview of how the certificate will appear with your current settings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 bg-muted/50">
                      <div
                        className="bg-white border-4 border-blue-600 rounded-lg p-8 mx-auto max-w-4xl shadow-2xl relative overflow-hidden"
                        style={{
                          fontFamily: templateForm.font_family,
                          background: templateForm.background_color,
                        }}
                      >
                        {/* Certificate content remains the same */}
                        <div className="flex justify-center mb-4">
                          <img
                            src="/Global-Security-Practitioners-Alliance.png"
                            alt="GSPA Logo"
                            className="h-28 w-auto"
                          />
                        </div>

                        <div className="absolute inset-4 border-2 border-yellow-400 rounded pointer-events-none"></div>

                        <div className="text-center mb-8 relative z-10">
                          <div className="text-3xl font-bold mb-3" style={{ color: templateForm.primary_color }}>
                            {templateForm.organization_name}
                          </div>
                          <div className="text-xl mb-4 font-semibold" style={{ color: templateForm.accent_color }}>
                            {templateForm.certificate_subtitle}
                          </div>
                          <div className="w-24 h-1 mx-auto rounded-full" style={{ 
                            background: `linear-gradient(to right, ${templateForm.primary_color}, ${templateForm.accent_color})` 
                          }}></div>
                        </div>

                        <h1 className="text-5xl font-bold text-center mb-8 italic" style={{ color: templateForm.primary_color }}>
                          {templateForm.main_title}
                        </h1>

                        <div className="text-center mb-8 relative z-10">
                          <p className="text-2xl mb-6 italic font-semibold text-center text-gray-700">
                            {templateForm.recipient_title}
                          </p>
                          <div 
                            className="text-4xl font-bold inline-block px-8 py-3 border-b-4 rounded-lg"
                            style={{ 
                              borderColor: templateForm.accent_color,
                              background: `linear-gradient(135deg, ${templateForm.background_color} 0%, #f8fafc 100%)`
                            }}
                          >
                            John Doe
                          </div>
                        </div>

                        {/* Rest of the certificate preview content */}
                        <div className="flex justify-between items-center mb-12 px-8 relative z-10">
                          <div className="text-center bg-white/80 p-4 rounded-lg shadow-md">
                            <div className="text-sm font-bold mb-2 uppercase tracking-wide" style={{ color: templateForm.primary_color }}>
                              {templateForm.date_label}
                            </div>
                            <div className="text-lg font-semibold" style={{ color: templateForm.primary_color }}>
                              {new Date().toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>

                          <div className="text-center p-4 rounded-lg shadow-md" style={{ backgroundColor: templateForm.accent_color }}>
                            <div className="text-sm font-bold mb-2 uppercase tracking-wide" style={{ color: templateForm.primary_color }}>
                              {templateForm.score_label}
                            </div>
                            <div className="text-2xl font-bold" style={{ color: templateForm.primary_color }}>
                              95%
                            </div>
                          </div>

                          <div className="text-center bg-white/80 p-4 rounded-lg shadow-md">
                            <div className="text-sm font-bold mb-2 uppercase tracking-wide" style={{ color: templateForm.primary_color }}>
                              {templateForm.certificate_id_label}
                            </div>
                            <div className="font-mono text-lg font-semibold" style={{ color: templateForm.primary_color }}>
                              GSPA-ABC123
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-end relative z-10 px-8">
                          <div className="text-center">
                            <div className="w-64 h-px mx-auto mb-4" style={{ 
                              background: `linear-gradient(to right, transparent, ${templateForm.primary_color}, transparent)` 
                            }}></div>
                            {templateForm.director_signature && (
                              <div className="mb-4">
                                <img
                                  src={templateForm.director_signature}
                                  alt="Director's Signature"
                                  className="h-16 w-auto mx-auto"
                                />
                              </div>
                            )}
                            <div className="text-2xl font-bold italic mb-2" style={{ color: templateForm.primary_color }}>
                              {templateForm.signature_name}
                            </div>
                            <div className="text-lg text-gray-600 mb-1">
                              {templateForm.signature_title}
                            </div>
                            <div className="text-base font-semibold" style={{ color: templateForm.accent_color }}>
                              {templateForm.signature_organization}
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            <CertificateSeal size={140} />
                          </div>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div 
                            className="text-8xl font-black transform -rotate-45 select-none"
                            style={{ color: `${templateForm.primary_color}05` }}
                          >
                            {templateForm.watermark_text}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
