"use client"

import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Clock, Users, DollarSign, Search, Filter, BookOpen, Award, Star, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"

interface Module {
  id: string
  title: string
  description: string
  short_description: string
  category: string
  difficulty: string
  duration_hours: number
  price_kes: number
  price_usd: number
  max_students: number
  instructor_name: string
  instructor_bio: string
  learning_objectives: string[]
  is_enrolled?: boolean
  enrollment_status?: string
}

export default function ModulesPage() {
   const { data: session } = useSession()
   const [modules, setModules] = useState<Module[]>([])
   const [filteredModules, setFilteredModules] = useState<Module[]>([])
   const [isLoading, setIsLoading] = useState(true)
   const [searchTerm, setSearchTerm] = useState("")
   const [categoryFilter, setCategoryFilter] = useState("all")
   const [difficultyFilter, setDifficultyFilter] = useState("all")
   const [selectedModule, setSelectedModule] = useState<Module | null>(null)
   const [isEnrolling, setIsEnrolling] = useState(false)

   const router = useRouter()

  useEffect(() => {
    fetchModules()
  }, [session])

  useEffect(() => {
    filterModules()
  }, [modules, searchTerm, categoryFilter, difficultyFilter])

  const fetchModules = async () => {
    try {
      // Get all active modules
      const modulesRes = await fetch('/api/modules?active=true')
      if (!modulesRes.ok) throw new Error('Failed to fetch modules')
      const modulesData = await modulesRes.json()

      // Map to interface
      let mappedModules = modulesData.map((module: any) => ({
        id: module.id,
        title: module.title,
        description: module.description,
        short_description: module.description.substring(0, 100) + '...',
        category: module.category,
        difficulty: module.difficultyLevel,
        duration_hours: module.estimatedDuration || 0,
        price_usd: module.currency === 'USD' ? module.price : Math.round(module.price / 130),
        price_kes: module.currency === 'KES' ? module.price : Math.round(module.price * 130),
        max_students: module.maxStudents || 100,
        instructor_name: module.instructorName || 'TBD',
        instructor_bio: module.instructorBio || '',
        learning_objectives: [], // Not in API, set empty
        is_enrolled: false,
        enrollment_status: 'not_enrolled'
      }))

      // Check user authentication and enrollment status
      if (session?.user?.id) {
        // Get user's enrollments
        const enrollmentsRes = await fetch(`/api/user-enrollments?userId=${session.user.id}`)
        if (enrollmentsRes.ok) {
          const enrollments = await enrollmentsRes.json()
          // Mark enrolled modules
          mappedModules = mappedModules.map((module: Module) => {
            const enrollment = enrollments.find((e: any) => e.moduleId === module.id)
            return {
              ...module,
              is_enrolled: !!enrollment,
              enrollment_status: enrollment?.paymentStatus || 'not_enrolled'
            }
          })
        }
      }

      setModules(mappedModules)
    } catch (error) {
      console.error('Error fetching modules:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterModules = () => {
    let filtered = modules

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(module =>
        module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(module => module.category === categoryFilter)
    }

    // Difficulty filter
    if (difficultyFilter !== "all") {
      filtered = filtered.filter(module => module.difficulty === difficultyFilter)
    }

    setFilteredModules(filtered)
  }

  const handleEnroll = (module: Module) => {
    router.push('/register')
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getEnrollmentStatus = (module: Module) => {
    if (!module.is_enrolled) return null

    switch (module.enrollment_status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Enrolled</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Payment Pending</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Payment Failed</Badge>
      default:
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Enrolled</Badge>
    }
  }

  const categories = [...new Set(modules.map(m => m.category))]

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
  <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white py-24" aria-label="Modules hero section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6" tabIndex={0} aria-label="Professional Training Modules">
                Professional Training Modules
              </h1>
              <p className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto mb-8" tabIndex={0}>
                Expand your cybersecurity expertise with our comprehensive training modules.
                Learn from industry experts and earn recognized certifications.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" tabIndex={0} aria-label="Expert-Led Courses">
                  <BookOpen className="h-4 w-4" />
                  <span>Expert-Led Courses</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" tabIndex={0} aria-label="Industry Certifications">
                  <Award className="h-4 w-4" />
                  <span>Industry Certifications</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" tabIndex={0} aria-label="Practical Learning">
                  <Star className="h-4 w-4" />
                  <span>Practical Learning</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters Section */}
  <section className="py-8 bg-muted/30 border-b" aria-label="Module filters">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search modules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 focus:ring-2 focus:ring-blue-400"
                    aria-label="Search modules"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-48 focus:ring-2 focus:ring-blue-400" aria-label="Filter by category">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="w-full sm:w-48 focus:ring-2 focus:ring-blue-400" aria-label="Filter by difficulty">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                {filteredModules.length} module{filteredModules.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>
        </section>

        {/* Modules Grid */}
  <section className="py-12" aria-label="Modules grid">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredModules.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No modules found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredModules.map((module) => (
                  <Card
                    key={module.id}
                    className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm overflow-hidden focus-within:ring-4 focus-within:ring-blue-400"
                    tabIndex={0}
                    aria-label={module.title}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge className={getDifficultyColor(module.difficulty)}>
                          {module.difficulty}
                        </Badge>
                        {getEnrollmentStatus(module)}
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                        {module.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {module.short_description || module.description.substring(0, 100) + '...'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{module.duration_hours}h</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{module.category}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-primary">
                          ${module.price_usd}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          KES {module.price_kes.toLocaleString()}
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <strong>Instructor:</strong> {module.instructor_name}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                              onClick={() => setSelectedModule(module)}
                              aria-label={`View details for ${module.title}`}
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-label={`Details for ${module.title}`}> 
                            <DialogHeader>
                              <DialogTitle className="text-2xl">{module.title}</DialogTitle>
                              <DialogDescription className="text-base">
                                {module.short_description}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div>
                                <h4 className="font-semibold mb-2">Description</h4>
                                <p className="text-muted-foreground">{module.description}</p>
                              </div>

                              {module.learning_objectives && module.learning_objectives.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-2">Learning Objectives</h4>
                                  <ul className="space-y-1">
                                    {module.learning_objectives.map((objective, index) => (
                                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>{objective}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <strong>Duration:</strong> {module.duration_hours} hours
                                </div>
                                <div>
                                  <strong>Difficulty:</strong> {module.difficulty}
                                </div>
                                <div>
                                  <strong>Category:</strong> {module.category}
                                </div>
                                <div>
                                  <strong>Instructor:</strong> {module.instructor_name}
                                </div>
                              </div>

                              <div className="border-t pt-4">
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    <div className="text-2xl font-bold text-primary">
                                      ${module.price_usd}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      (KES {module.price_kes.toLocaleString()})
                                    </div>
                                  </div>
                                  {module.is_enrolled ? (
                                    <Badge className="bg-green-100 text-green-800">
                                      Already Enrolled
                                    </Badge>
                                  ) : (
                                    <Button
                                      onClick={() => handleEnroll(module)}
                                      className="px-6 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                      aria-label={`Enroll in ${module.title}`}
                                    >
                                      Enroll Now
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {!module.is_enrolled && (
                          <Button
                            onClick={() => handleEnroll(module)}
                            className="flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            aria-label={`Enroll in ${module.title}`}
                          >
                            Enroll
                          </Button>
                        )}

                        {module.is_enrolled && module.enrollment_status === 'completed' && (
                          <Button
                            asChild
                            variant="outline"
                            className="flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            aria-label={`Continue learning ${module.title}`}
                          >
                            <Link href={`/dashboard/my-modules/${module.id}`}>
                              Continue Learning
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
