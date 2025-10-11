import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, XCircle, Filter, Search, Trophy, Target, BookOpen } from "lucide-react"
import { format } from "date-fns"

interface TestResult {
  id: string
  type: 'level' | 'subtopic'
  testId: string
  testTitle: string
  testDescription: string | null
  score: number
  totalQuestions: number
  correctAnswers: number
  passed: boolean
  completedAt: string
  module: {
    id: string
    title: string
  }
  level: {
    id: string
    title: string
  }
  subtopic: {
    id: string
    title: string
  } | null
}

interface TestResultsTableProps {
  userId?: string
}

export function TestResultsTable({ userId }: TestResultsTableProps) {
  const [results, setResults] = useState<TestResult[]>([])
  const [filteredResults, setFilteredResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  console.log('TestResultsTable rendered, loading:', loading, 'results:', results.length)

  // Filter states
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [moduleFilter, setModuleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Get unique modules for filter dropdown
  const uniqueModules = Array.from(new Set(results.map(r => r.module.title)))

  useEffect(() => {
    fetchResults()
  }, [userId])

  useEffect(() => {
    applyFilters()
  }, [results, typeFilter, moduleFilter, statusFilter, searchTerm])

  const fetchResults = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (userId) params.set('userId', userId)
      params.set('type', 'all')

      console.log('Fetching test results with params:', params.toString())
      const response = await fetch(`/api/test-results?${params}`)
      console.log('API response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API error response:', errorText)
        throw new Error(`Failed to fetch test results: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      console.log('API response data:', data)
      setResults(data)
    } catch (err) {
      console.error('Error in fetchResults:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...results]

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.type === typeFilter)
    }

    // Module filter
    if (moduleFilter !== 'all') {
      filtered = filtered.filter(r => r.module.title === moduleFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => {
        if (statusFilter === 'passed') return r.passed
        if (statusFilter === 'failed') return !r.passed
        return true
      })
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(r =>
        r.testTitle.toLowerCase().includes(term) ||
        r.module.title.toLowerCase().includes(term) ||
        r.level.title.toLowerCase().includes(term) ||
        (r.subtopic?.title.toLowerCase().includes(term))
      )
    }

    setFilteredResults(filtered)
  }

  const clearFilters = () => {
    setTypeFilter('all')
    setModuleFilter('all')
    setStatusFilter('all')
    setSearchTerm('')
  }

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full text-center text-red-600 py-8">
        <XCircle className="h-12 w-12 mx-auto mb-4" />
        <p>Error loading test results: {error}</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <Trophy className="h-6 w-6" />
          Test Results History
        </h2>
        <p className="text-muted-foreground">
          View all your test results from modules, levels, and subtopics
        </p>
      </div>

      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tests, modules, levels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="level">Level Tests</SelectItem>
                <SelectItem value="subtopic">Subtopic Tests</SelectItem>
              </SelectContent>
            </Select>

            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Module" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {uniqueModules.map(module => (
                  <SelectItem key={module} value={module}>{module}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters} size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-primary">{results.length}</div>
            <div className="text-sm text-muted-foreground">Total Tests</div>
          </div>
          <div className="bg-card p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-green-600">
              {results.filter(r => r.passed).length}
            </div>
            <div className="text-sm text-muted-foreground">Passed</div>
          </div>
          <div className="bg-card p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-blue-600">
              {results.filter(r => r.type === 'level').length}
            </div>
            <div className="text-sm text-muted-foreground">Level Tests</div>
          </div>
          <div className="bg-card p-4 rounded-lg border text-center">
            <div className="text-2xl font-bold text-purple-600">
              {results.filter(r => r.type === 'subtopic').length}
            </div>
            <div className="text-sm text-muted-foreground">Subtopic Tests</div>
          </div>
        </div>

        {/* Results Table */}
        {filteredResults.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Test Results Found</h3>
            <p className="text-muted-foreground">
              {results.length === 0
                ? "You haven't completed any tests yet."
                : "No results match your current filters."}
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Type</TableHead>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Subtopic</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>
                      <Badge variant={result.type === 'level' ? 'default' : 'secondary'}>
                        {result.type === 'level' ? 'Level' : 'Subtopic'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{result.testTitle}</div>
                        {result.testDescription && (
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {result.testDescription}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{result.module.title}</TableCell>
                    <TableCell>{result.level.title}</TableCell>
                    <TableCell>
                      {result.subtopic ? result.subtopic.title : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">
                        {result.score}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {result.correctAnswers}/{result.totalQuestions}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={result.passed ? "default" : "destructive"}>
                        {result.passed ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Passed
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Failed
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(result.completedAt), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}