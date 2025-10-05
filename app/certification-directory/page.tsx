import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Award, Calendar, MapPin, ExternalLink, Filter } from "lucide-react"

export default function CertificationDirectoryPage() {
  // Mock data - in real app, this would come from Supabase
  const certifications = [
    {
      id: "CERT-001",
      name: "John Smith",
      certification: "Cybersecurity Professional",
      issueDate: "2024-01-15",
      expiryDate: "2025-01-15",
      location: "New York, USA",
      status: "Active",
      qrCode: "/qr-codes/cert-001.png"
    },
    {
      id: "CERT-002",
      name: "Sarah Johnson",
      certification: "Network Security Specialist",
      issueDate: "2024-01-10",
      expiryDate: "2025-01-10",
      location: "London, UK",
      status: "Active",
      qrCode: "/qr-codes/cert-002.png"
    },
    {
      id: "CERT-003",
      name: "Michael Chen",
      certification: "Digital Forensics Expert",
      issueDate: "2024-01-05",
      expiryDate: "2025-01-05",
      location: "Singapore",
      status: "Active",
      qrCode: "/qr-codes/cert-003.png"
    },
    {
      id: "CERT-004",
      name: "Emma Davis",
      certification: "Cybersecurity Professional",
      issueDate: "2023-12-20",
      expiryDate: "2024-12-20",
      location: "Sydney, Australia",
      status: "Active",
      qrCode: "/qr-codes/cert-004.png"
    },
    {
      id: "CERT-005",
      name: "David Wilson",
      certification: "Network Security Specialist",
      issueDate: "2023-12-15",
      expiryDate: "2024-12-15",
      location: "Toronto, Canada",
      status: "Active",
      qrCode: "/qr-codes/cert-005.png"
    }
  ]

  const stats = {
    totalCertifications: 15420,
    activeThisMonth: 234,
    countries: 120,
    avgPassRate: 78
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 lg:py-32 bg-gradient-to-br from-background via-background to-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl lg:text-6xl font-bold text-balance mb-6">Certification Directory</h1>
              <p className="text-xl text-muted-foreground text-pretty mb-8 leading-relaxed">
                Verify GSPA certifications and explore our global community of certified security professionals.
              </p>

              {/* Search and Filter */}
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, certification, or certificate ID..."
                      className="pl-10"
                    />
                  </div>
                  <Select>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Certification Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
                      <SelectItem value="network">Network Security</SelectItem>
                      <SelectItem value="forensics">Digital Forensics</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stats.totalCertifications.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Certifications</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stats.activeThisMonth}</div>
                <div className="text-sm text-muted-foreground">Active This Month</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stats.countries}</div>
                <div className="text-sm text-muted-foreground">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stats.avgPassRate}%</div>
                <div className="text-sm text-muted-foreground">Average Pass Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Certification Results */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Recent Certifications</h2>
              <p className="text-muted-foreground">Showing 5 of {stats.totalCertifications.toLocaleString()} certifications</p>
            </div>

            <div className="space-y-6">
              {certifications.map((cert) => (
                <Card key={cert.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Award className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-semibold">{cert.name}</h3>
                              <Badge variant="secondary">{cert.status}</Badge>
                            </div>
                            <p className="text-muted-foreground mb-2">{cert.certification}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Issued: {new Date(cert.issueDate).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {cert.location}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-center">
                          <div className="text-sm font-medium mb-1">Certificate ID</div>
                          <div className="text-xs text-muted-foreground font-mono">{cert.id}</div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/verify/${cert.id}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Verify
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button variant="outline">
                Load More Certifications
              </Button>
            </div>
          </div>
        </section>

        {/* Verification Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">Verify a Certificate</h2>
            <p className="text-lg opacity-90 text-pretty max-w-2xl mx-auto mb-8">
              Enter a certificate ID or scan a QR code to instantly verify the authenticity of any GSPA certification.
            </p>
            <div className="max-w-md mx-auto space-y-4">
              <Input
                placeholder="Enter certificate ID (e.g., CERT-001)"
                className="bg-primary-foreground text-primary"
              />
              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1">
                  Verify Certificate
                </Button>
                <Button variant="outline" className="px-4">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm opacity-75 mt-4">
              All GSPA certificates include unique QR codes for instant verification
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">How Certificate Verification Works</h2>
              <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
                Our verification system ensures the authenticity and validity of all GSPA certifications.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Search Directory</CardTitle>
                  <CardDescription>
                    Search our public directory by name, certificate ID, or certification type
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Scan QR Code</CardTitle>
                  <CardDescription>
                    Every certificate includes a unique QR code that links directly to verification
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Check Validity</CardTitle>
                  <CardDescription>
                    Instantly confirm certificate authenticity, issue date, and expiration status
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
