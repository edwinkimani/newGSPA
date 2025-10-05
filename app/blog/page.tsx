import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BookOpen, Calendar, User, Search, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: "The Future of Cybersecurity: Trends to Watch in 2024",
      excerpt: "Explore emerging cybersecurity trends including AI-driven security, zero-trust architecture, and quantum-resistant encryption.",
      author: "Dr. Sarah Chen",
      date: "2024-01-15",
      category: "Cybersecurity",
      readTime: "5 min read",
      image: "/placeholder.jpg"
    },
    {
      id: 2,
      title: "Network Security Best Practices for Modern Enterprises",
      excerpt: "Learn essential network security strategies including segmentation, monitoring, and incident response planning.",
      author: "Michael Rodriguez",
      date: "2024-01-10",
      category: "Network Security",
      readTime: "7 min read",
      image: "/placeholder.jpg"
    },
    {
      id: 3,
      title: "Digital Forensics: Investigating Cyber Crimes",
      excerpt: "A comprehensive guide to digital forensics techniques, tools, and methodologies used in modern investigations.",
      author: "Emma Thompson",
      date: "2024-01-05",
      category: "Digital Forensics",
      readTime: "6 min read",
      image: "/placeholder.jpg"
    },
    {
      id: 4,
      title: "Building a Security-First Culture in Organizations",
      excerpt: "How to foster a security-conscious culture and implement effective security awareness training programs.",
      author: "James Wilson",
      date: "2023-12-28",
      category: "Security Culture",
      readTime: "4 min read",
      image: "/placeholder.jpg"
    },
    {
      id: 5,
      title: "Cloud Security Challenges and Solutions",
      excerpt: "Addressing common cloud security challenges and implementing robust protection strategies for cloud environments.",
      author: "Lisa Park",
      date: "2023-12-20",
      category: "Cloud Security",
      readTime: "8 min read",
      image: "/placeholder.jpg"
    },
    {
      id: 6,
      title: "The Role of AI in Modern Security Operations",
      excerpt: "How artificial intelligence is transforming security operations centers and threat detection capabilities.",
      author: "David Kumar",
      date: "2023-12-15",
      category: "AI & Security",
      readTime: "6 min read",
      image: "/placeholder.jpg"
    }
  ]

  const categories = ["All", "Cybersecurity", "Network Security", "Digital Forensics", "Cloud Security", "AI & Security", "Security Culture"]

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 lg:py-32 bg-gradient-to-br from-background via-background to-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl lg:text-6xl font-bold text-balance mb-6">Knowledge Hub</h1>
              <p className="text-xl text-muted-foreground text-pretty mb-8 leading-relaxed">
                Stay informed with the latest insights, trends, and best practices in security certification and professional development.
              </p>

              {/* Search Bar */}
              <div className="max-w-md mx-auto relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  className="pl-10 pr-4 py-3"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={category === "All" ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-primary/80 transition-colors px-4 py-2"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <Card key={post.id} className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                  <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{post.category}</Badge>
                      <span className="text-sm text-muted-foreground">{post.readTime}</span>
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(post.date).toLocaleDateString()}
                      </div>
                    </div>
                    <Button variant="ghost" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
                      <Link href={`/blog/${post.id}`}>
                        Read More <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">Stay Updated</h2>
            <p className="text-lg opacity-90 text-pretty max-w-2xl mx-auto mb-8">
              Subscribe to our newsletter for the latest security insights, certification updates, and industry trends.
            </p>
            <div className="max-w-md mx-auto flex gap-2">
              <Input
                placeholder="Enter your email"
                className="bg-primary-foreground text-primary"
              />
              <Button variant="secondary">
                Subscribe
              </Button>
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">Explore More Resources</h2>
              <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
                Access additional learning materials and tools to enhance your security knowledge.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Study Guides</CardTitle>
                  <CardDescription>
                    Comprehensive study materials for all certification modules
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/resources/study-guides">Access Guides</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <User className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Webinars</CardTitle>
                  <CardDescription>
                    Live and recorded sessions with industry experts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/resources/webinars">Watch Webinars</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle>Events</CardTitle>
                  <CardDescription>
                    Upcoming conferences, workshops, and networking events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/events">View Events</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
