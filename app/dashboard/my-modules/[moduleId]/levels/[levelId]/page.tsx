  "use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Clock,
  BookOpen,
  FileText,
  CheckCircle,
  Play,
  ExternalLink,
  AlertCircle,
  ArrowLeft,
  ChevronDown,
} from "lucide-react"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useSession } from "next-auth/react"

export default function LevelDetailPage() {
  const { moduleId, levelId } = useParams()
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()

  const [level, setLevel] = useState<any | null>(null)
  const [enrollment, setEnrollment] = useState<any | null>(null)
  const [subtopics, setSubtopics] = useState<any[]>([])
  const [openAccordion, setOpenAccordion] = useState<string>("")
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false)
  const [selectedSubtopicContent, setSelectedSubtopicContent] = useState<any[]>([])
  const [userProgress, setUserProgress] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)
  const [completedSubtopicsWithTests, setCompletedSubtopicsWithTests] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (sessionStatus === "loading") {
      return // Wait for session to load
    }

    if (sessionStatus === "unauthenticated") {
      // Store the current URL to redirect back after login
      const currentPath = `/dashboard/my-modules/${moduleId}/levels/${levelId}`
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(currentPath)}`)
      return
    }

    if (moduleId && levelId && sessionStatus === "authenticated") {
      fetchLevelData()
    }
  }, [moduleId, levelId, sessionStatus])

  const handleAccordionChange = async (value: string) => {
    setOpenAccordion(value)
    if (value) {
      setIsLoadingContent(true)
      try {
        const response = await fetch(`/api/sub-topic-content?subTopicId=${value}`)
        if (response.ok) {
          const contents = await response.json()
          setSelectedSubtopicContent(contents)
        } else {
          const errorText = await response.text()
          console.error('Failed to fetch sub-topic content:', errorText)
          setSelectedSubtopicContent([])
        }
      } catch (error) {
        console.error('Error fetching sub-topic content:', error)
        setSelectedSubtopicContent([])
      } finally {
        setIsLoadingContent(false)
      }
    } else {
      setSelectedSubtopicContent([])
    }
  }

  const fetchLevelData = async () => {
    try {
      setIsInitialLoading(true)
      console.log("Starting fetchLevelData for moduleId:", moduleId, "levelId:", levelId)

      const userId = session?.user?.id
      if (!userId) {
        console.log("No user ID found, redirecting to login")
        const currentPath = `/dashboard/my-modules/${moduleId}/levels/${levelId}`
        router.push(`/auth/login?callbackUrl=${encodeURIComponent(currentPath)}`)
        return
      }
      console.log("User authenticated:", !!session?.user, "user id:", userId)

      // Get level details from API
      console.log("Fetching levels for moduleId:", moduleId, "looking for levelId:", levelId)
      const levelRes = await fetch(`/api/levels?moduleId=${moduleId}`)
      console.log("Levels response status:", levelRes.status)
      if (!levelRes.ok) throw new Error("Failed to fetch levels")
      const levelsData = await levelRes.json()
      console.log("Levels data:", levelsData)
      const levelData = levelsData.find((l: any) => l.id === levelId)
      console.log("Found level:", levelData)
      if (!levelData) {
        console.log("Level not found, redirecting to module")
        router.push(`/dashboard/my-modules/${moduleId}`)
        return
      }
      setLevel(levelData)

      // Get enrollment details from API
      console.log("Fetching enrollments for userId:", userId)
      const enrollmentRes = await fetch(`/api/user-enrollments?userId=${userId}`)
      console.log("Enrollments response status:", enrollmentRes.status)
      if (!enrollmentRes.ok) {
        const errorText = await enrollmentRes.text()
        console.error("Failed to fetch enrollments:", errorText)
        throw new Error("Failed to fetch enrollments")
      }
      const enrollmentsData = await enrollmentRes.json()
      console.log("Enrollments data:", enrollmentsData)
      const enrollmentData = enrollmentsData.find(
        (e: any) => e.moduleId === moduleId && e.paymentStatus === "COMPLETED",
      )
      console.log("Found enrollment:", enrollmentData)

      if (!enrollmentData) {
        console.log("No completed enrollment, redirecting to models")
        router.push("/dashboard/models")
        return
      }
      setEnrollment(enrollmentData)

      console.log("Fetching subtopics for levelId:", levelId)
      const subtopicsRes = await fetch(`/api/sub-topics?levelId=${levelId}`)
      console.log("Subtopics response status:", subtopicsRes.status)
      if (subtopicsRes.ok) {
        const subtopicsData = await subtopicsRes.json()
        console.log("Raw subtopics data:", subtopicsData)

        // Remove duplicates using a Map to ensure only unique subtopics by ID
        const uniqueSubtopicsMap = new Map()
        subtopicsData.forEach((subtopic: any) => {
          if (!uniqueSubtopicsMap.has(subtopic.id)) {
            uniqueSubtopicsMap.set(subtopic.id, subtopic)
          }
        })

        // Convert Map back to array and sort by orderIndex
        const uniqueSubtopics = Array.from(uniqueSubtopicsMap.values())
        const sortedSubtopics = uniqueSubtopics.sort((a: any, b: any) => {
          // Ensure orderIndex is a number, default to 0 if undefined
          const orderA = typeof a.orderIndex === "number" ? a.orderIndex : 0
          const orderB = typeof b.orderIndex === "number" ? b.orderIndex : 0
          return orderA - orderB
        })

        console.log("Processed subtopics (unique and sorted):", sortedSubtopics)
        setSubtopics(sortedSubtopics)

        // Set initial open accordion to first incomplete subtopic, or first subtopic if all are complete
        const firstIncompleteSubtopic = sortedSubtopics.find((subtopic: any) => {
          const subtopicContents = subtopic.contents || []
          return !subtopicContents.every((c: any) => userProgress.some((p) => p.content_id === c.id && p.completed))
        })

        // If there's an incomplete subtopic, open it; otherwise open the first subtopic
        const subtopicToOpen = firstIncompleteSubtopic || sortedSubtopics[0]
        if (subtopicToOpen) {
          setOpenAccordion(subtopicToOpen.id)
          // Automatically load content for the first subtopic
          setIsLoadingContent(true)
          fetch(`/api/sub-topic-content?subTopicId=${subtopicToOpen.id}`)
            .then((response) => (response.ok ? response.json() : []))
            .then((contents) => setSelectedSubtopicContent(contents))
            .catch((error) => {
              console.error("Error fetching initial subtopic content:", error)
              setSelectedSubtopicContent([])
            })
            .finally(() => setIsLoadingContent(false))
        } else {
          setOpenAccordion("")
        }
      } else {
        console.error("Failed to fetch subtopics:", await subtopicsRes.text())
        setSubtopics([])
      }

      // Get user progress
      console.log("Fetching user progress for enrollment:", enrollmentData.id)
      try {
        const progressRes = await fetch(`/api/user-progress?enrollmentId=${enrollmentData.id}`)
        console.log("Progress response status:", progressRes.status)
        if (progressRes.ok) {
          const progressData = await progressRes.json()
          console.log("Progress data:", progressData)
          setUserProgress(progressData)
        } else {
          const errorText = await progressRes.text()
          console.error("Failed to fetch user progress:", errorText)
          setUserProgress([])
        }
      } catch (error) {
        console.error("Error fetching user progress:", error)
        setUserProgress([])
      }
    } catch (error) {
      console.error("Error fetching level data:", error)
      router.push(`/dashboard/my-modules/${moduleId}`)
    } finally {
      setIsLoading(false)
      setIsInitialLoading(false)
    }
  }

  const getTotalSubtopics = () => {
    return subtopics.length
  }

  const getLevelProgress = () => {
    const totalSubtopics = getTotalSubtopics()
    if (totalSubtopics === 0) return 0
    const completedSubtopics = subtopics.filter((subtopic: any) => {
      const subtopicContents = subtopic.contents.filter((c: any) => c.isPublished)
      return (
        subtopicContents.length > 0 &&
        subtopicContents.every((c: any) => userProgress.some((p: any) => p.content_id === c.id && p.completed))
      )
    }).length
    return Math.round((completedSubtopics / totalSubtopics) * 100 * 10) / 10
  }

  const getCompletedSubtopics = () => {
    return subtopics.filter((subtopic: any) => {
      const subtopicContents = subtopic.contents.filter((c: any) => c.isPublished)
      return (
        subtopicContents.length > 0 &&
        subtopicContents.every((c: any) => userProgress.some((p: any) => p.content_id === c.id && p.completed))
      )
    }).length
  }

  const isLevelCompleted = () => {
    return getLevelProgress() === 100
  }

  const isContentCompleted = (contentId: string) => {
    return userProgress.some((p: any) => p.content_id === contentId && p.completed)
  }

  const markSubtopicComplete = async (subtopicId: string) => {
    if (!enrollment || !session?.user) return

    try {
      // Mark subtopic as completed using the API
      const response = await fetch('/api/sub-topics/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subTopicId: subtopicId,
          completed: true
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to mark subtopic complete')
      }

      // Update progress for each content item
      const subtopicContents = selectedSubtopicContent
      for (const item of subtopicContents) {
        await fetch('/api/user-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contentId: item.id,
            completed: true
          })
        })
      }

      // Update local state for UI
      setUserProgress(prev => {
        const newProgress = [...prev]
        for (const item of subtopicContents) {
          const existing = newProgress.find(p => p.content_id === item.id)
          if (existing) {
            const index = newProgress.indexOf(existing)
            newProgress[index] = { ...existing, completed: true, completed_at: new Date().toISOString() }
          } else {
            newProgress.push({
              content_id: item.id,
              completed: true,
              completed_at: new Date().toISOString()
            })
          }
        }
        return newProgress
      })

      // Check if subtopic has a test and add to completed subtopics with tests
      const subtopic = subtopics.find(s => s.id === subtopicId)
      if (subtopic?.subTopicTest) {
        setCompletedSubtopicsWithTests(prev => new Set([...prev, subtopicId]))
      }

      // Open next accordion item (next subtopic)
      const currentSubtopicIndex = subtopics.findIndex(s => s.id === subtopicId)
      const nextSubtopic = subtopics[currentSubtopicIndex + 1]
      if (currentSubtopicIndex < subtopics.length - 1 && nextSubtopic) {
        // This will automatically fetch and set the content for the next subtopic
        handleAccordionChange(nextSubtopic.id)
      }

      // Refresh enrollment data to get updated progress
      if (session?.user) {
        const userId = (session.user as any).id
        if (userId) {
          const enrollmentRes = await fetch(`/api/user-enrollments?userId=${userId}`)
          if (enrollmentRes.ok) {
            const enrollmentsData = await enrollmentRes.json()
            const updatedEnrollment = enrollmentsData.find((e: any) => e.moduleId === moduleId && e.paymentStatus === 'COMPLETED')
            if (updatedEnrollment) {
              setEnrollment(updatedEnrollment)
            }
          }
        }
      }

    } catch (error) {
      console.error('Error marking subtopic complete:', error)
      alert('Error updating progress. Please try again.')
    }
  }

  if (isLoading || isInitialLoading || sessionStatus === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!level || !enrollment) {
    return (
      <div className="flex items-center justify-center py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Level not found or access denied.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="bg-slate-900 border-gray-600 text-white hover:bg-gray-700"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${isSidebarOpen ? "rotate-180" : ""}`} />
          Menu
        </Button>
      </div>

      {/* Left Sidebar - Accordion Navigation */}
      <div
        className={`fixed top-0 left-0 h-screen w-80 bg-slate-900 border-r border-gray-600 flex flex-col z-40 transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Header in Sidebar */}
        <div className="p-6 border-b border-gray-600">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/my-modules/${moduleId}`)}
            className="mb-4 w-full justify-start text-white border-gray-600 hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Module
          </Button>

          <div className="mb-4">
            <h1 className="text-xl font-bold mb-2 text-white">{level.title}</h1>
            {level.description && <p className="text-gray-300 text-sm mb-4">{level.description}</p>}

            <div className="flex flex-col gap-2 text-sm text-gray-300">
              {level.estimatedDuration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{level.estimatedDuration} minutes</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{getTotalSubtopics()} subtopics</span>
              </div>
            </div>

            {/* Progress Bar in Header */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-white">Progress</span>
                <span className="text-sm text-gray-300">{getLevelProgress()}%</span>
              </div>
              <Progress value={getLevelProgress()} className="h-2" />
              <div className="flex justify-between items-center mt-2 text-xs">
                <span className="text-gray-300">
                  {getCompletedSubtopics()} / {getTotalSubtopics()} completed
                </span>
                <Badge variant={isLevelCompleted() ? "default" : "secondary"} className="text-xs">
                  {isLevelCompleted() ? "Complete" : "In Progress"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Accordion Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          {subtopics.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-sm font-semibold mb-2 text-white">Content Coming Soon</h3>
              <p className="text-gray-400 text-xs">This level is being prepared.</p>
            </div>
          ) : (
            <Accordion
              type="single"
              collapsible
              value={openAccordion}
              onValueChange={handleAccordionChange}
              className="space-y-2"
            >
              {subtopics.map((subtopic: any, subtopicIndex: number) => {
                const subtopicContents = subtopic.contents.filter((c: any) => c.isPublished)
                const completed =
                  subtopicContents.length > 0 && subtopicContents.every((c: any) => isContentCompleted(c.id))

                // Check if this subtopic is accessible (first one or previous is completed)
                const isAccessible =
                  subtopicIndex === 0 ||
                  (() => {
                    const prevSubtopic = subtopics[subtopicIndex - 1]
                    const prevContents = prevSubtopic?.contents.filter((c: any) => c.isPublished) || []
                    return prevContents.length > 0 && prevContents.every((c: any) => isContentCompleted(c.id))
                  })()

                const isLast = subtopicIndex === subtopics.length - 1

                return (
                  <AccordionItem
                    key={subtopic.id}
                    value={subtopic.id}
                    className={`border rounded-lg ${
                      completed
                        ? "bg-green-900/20 border-green-600"
                        : isAccessible
                          ? "bg-gray-800 border-gray-600"
                          : "bg-gray-900/50 border-gray-700 opacity-60"
                    }`}
                    disabled={!isAccessible && !completed}
                  >
                    <AccordionTrigger
                      className={`px-4 py-3 hover:no-underline text-left ${
                        isAccessible || completed
                          ? "text-white hover:bg-gray-700 cursor-pointer"
                          : "text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            completed
                              ? "bg-green-600 text-white"
                              : isAccessible
                                ? "bg-blue-600 text-white"
                                : "bg-gray-600 text-gray-400"
                          }`}
                        >
                          {completed ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : isAccessible ? (
                            <BookOpen className="h-4 w-4" />
                          ) : (
                            <BookOpen className="h-4 w-4 opacity-50" />
                          )}
                        </div>
                        <div className="text-left flex-1">
                          <h3
                            className={`font-medium text-sm leading-tight ${
                              isAccessible || completed ? "text-white" : "text-gray-500"
                            }`}
                          >
                            {subtopic.title}
                          </h3>
                          <p className={`text-xs ${isAccessible || completed ? "text-gray-400" : "text-gray-600"}`}>
                            {subtopicContents.length} item{subtopicContents.length !== 1 ? "s" : ""}
                            {!isAccessible && !completed && " (Locked)"}
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-3">
                      <div className="space-y-3">
                        {subtopicContents.map((item: any, contentIndex: number) => (
                          <div key={item.id} className="text-sm">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  isContentCompleted(item.id) ? "bg-green-500" : "bg-gray-500"
                                }`}
                              />
                              <span className={isContentCompleted(item.id) ? "text-green-400" : "text-gray-300"}>
                                {item.title}
                              </span>
                            </div>
                          </div>
                        ))}

                        <div className="pt-3 border-t border-gray-600 space-y-2">
                          {!completed && subtopicContents.length > 0 && (
                            <Button
                              onClick={() => markSubtopicComplete(subtopic.id)}
                              size="sm"
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {isLast ? "Complete Level" : "Next Subtopic"}
                            </Button>
                          )}
                          {completed && (
                            <div className="space-y-2">
                              <div className="text-center text-green-400 text-sm font-medium">✓ Completed</div>
                              {completedSubtopicsWithTests.has(subtopic.id) && (
                                <Button
                                  asChild
                                  size="sm"
                                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                  <Link
                                    href={`/dashboard/my-modules/${moduleId}/levels/${levelId}/subtopics/${subtopic.id}/test`}
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Take Subtopic Test
                                  </Link>
                                </Button>
                              )}
                            </div>
                          )}
                          {subtopicContents.length === 0 && (
                            <div className="text-center text-gray-400 text-sm">No content available</div>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          )}
        </div>

        {/* Level Test & Next Level in Sidebar Footer */}
        {(isLevelCompleted() || (isLevelCompleted() && level.levelTestId)) && (
          <div className="p-4 border-t border-gray-600 space-y-3">
            {isLevelCompleted() && level.levelTestId && (
              <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white" size="sm">
                <Link href={`/dashboard/my-modules/${moduleId}/levels/${levelId}/test`}>
                  <FileText className="h-4 w-4 mr-2" />
                  Take Level Test
                </Link>
              </Button>
            )}

            {isLevelCompleted() && (
              <Button
                asChild
                variant="outline"
                className="w-full border-gray-600 text-white hover:bg-gray-700 bg-transparent"
                size="sm"
              >
                <Link href={`/dashboard/my-modules/${moduleId}`}>Back to Module</Link>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="md:ml-80 p-8 pt-16 md:pt-8 min-h-screen">
        <div className="w-full max-w-none">
          {openAccordion !== "" ? (
            (() => {
              const selectedSubtopic = subtopics.find((s: any) => s.id === openAccordion)
              return (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">{selectedSubtopic?.title}</h2>
                    <p className="text-muted-foreground text-lg">
                      Read through the content below and click "Next Subtopic" when you're done.
                    </p>
                  </div>

                  {isLoadingContent ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading content...</p>
                    </div>
                  ) : selectedSubtopicContent.length === 0 ? (
                    <Card className="p-12 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/10 dark:to-purple-950/10 border-blue-200/50 dark:border-blue-800/50">
                      <div className="text-center space-y-6">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            Content Coming Soon
                          </h3>
                          <p className="text-muted-foreground text-lg max-w-md mx-auto">
                            We're working hard to prepare engaging content for this subtopic.
                            Check back soon for an amazing learning experience!
                          </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span>In Development</span>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    selectedSubtopicContent.map((item: any, index: number) => (
                      <Card key={item.id} className="p-8 shadow-lg">
                        <div className="mb-6">
                          <h3 className="text-2xl font-semibold mb-3">{item.title}</h3>
                          {item.description && <p className="text-muted-foreground text-lg mb-6">{item.description}</p>}
                        </div>

                        {/* Content Display */}
                        {item.contentType === "NOTES" && item.contentText && (
                          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm relative overflow-hidden">
                            <div className="prose prose-slate dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-4">
                              <div
                                className="text-slate-800 dark:text-slate-200 leading-normal text-base [&>p]:my-2 [&>p+*]:mt-2 [&>br+*]:mt-1"
                                dangerouslySetInnerHTML={{
                                  __html: item.contentText.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>"),
                                }}
                              />
                            </div>
                            {/* Decorative element */}
                            <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-xl pointer-events-none"></div>
                          </div>
                        )}

                        {item.contentType === "VIDEO" && item.contentUrl && (
                          <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                            <Button asChild size="lg">
                              <a href={item.contentUrl} target="_blank" rel="noopener noreferrer">
                                <Play className="h-16 w-16 mr-4" />
                                <span className="text-lg">Watch Video</span>
                              </a>
                            </Button>
                          </div>
                        )}

                        {item.contentType === "DOCUMENT" && item.contentUrl && (
                          <div className="p-12 border-2 border-dashed border-gray-300 rounded-lg text-center">
                            <FileText className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                            <Button asChild variant="outline" size="lg">
                              <a href={item.contentUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-6 w-6 mr-3" />
                                <span className="text-lg">View Document</span>
                              </a>
                            </Button>
                          </div>
                        )}
                      </Card>
                    ))
                  )}

                  {/* Take Test Button - Show if subtopic has a test */}
                  {selectedSubtopic && selectedSubtopic.subTopicTest && (
                    <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Ready for a Test?</h3>
                          <p className="text-muted-foreground text-sm">
                            Test your knowledge with {selectedSubtopic.subTopicTest.questions?.length || 0} questions.
                          </p>
                        </div>
                        <Button
                          asChild
                          size="lg"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                        >
                          <Link
                            href={`/dashboard/my-modules/${moduleId}/levels/${levelId}/subtopics/${selectedSubtopic.id}/test`}
                          >
                            <FileText className="h-5 w-5 mr-2" />
                            Take Test
                          </Link>
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              )
            })()
          ) : (
            <div className="fixed inset-0 flex items-center justify-center bg-background z-10">
              <div className="text-center">
                <BookOpen className="h-32 w-32 text-muted-foreground mx-auto mb-8" />
                <h3 className="text-2xl font-semibold mb-4">Select a Subtopic</h3>
                <p className="text-muted-foreground text-lg">Choose a subtopic from the sidebar to start learning.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
