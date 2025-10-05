import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Target, Globe, Users, Award, Rocket, Heart, Gem } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About GSPA - Global Security Practitioners Alliance",
  description:
    "Learn about the Global Security Practitioners Alliance, our mission to advance security excellence through professional certification, and our global community of 50,000+ security professionals.",
  keywords: [
    "about GSPA",
    "security certification organization",
    "professional security alliance",
    "security training",
    "global security community",
  ],
  openGraph: {
    title: "About GSPA - Global Security Practitioners Alliance",
    description:
      "Learn about the Global Security Practitioners Alliance, our mission to advance security excellence through professional certification, and our global community of 50,000+ security professionals.",
    type: "website",
    url: "https://gspa.org/about",
    images: [
      {
        url: "/Global-Security-Practitioners-Alliance.png",
        width: 1200,
        height: 630,
        alt: "GSPA Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About GSPA - Global Security Practitioners Alliance",
    description:
      "Learn about the Global Security Practitioners Alliance, our mission to advance security excellence through professional certification.",
    images: ["/Global-Security-Practitioners-Alliance.png"],
  },
  alternates: {
    canonical: "https://gspa.org/about",
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-muted/20 to-background">
      <Navigation />

      <main className="flex-1">
        {/* Enhanced Hero Section */}
        <section className="relative py-24 lg:py-32 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-64 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                <Shield className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-white/80">Leading Security Certification Since 2010</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                About GSPA
              </h1>
              <p className="text-xl text-blue-100 text-pretty mb-8 leading-relaxed max-w-3xl mx-auto">
                The Global Security Practitioners Alliance is dedicated to advancing security excellence through
                professional certification, innovative training, and global community building.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">50K+</div>
                  <div className="text-blue-200 text-sm">Professionals</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">120+</div>
                  <div className="text-blue-200 text-sm">Countries</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">14</div>
                  <div className="text-blue-200 text-sm">Years</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Mission & Vision */}
        <section className="relative py-20 -mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary to-accent rounded-3xl blur-lg opacity-20"></div>
                <Card className="relative bg-card/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-primary/10 p-3 rounded-2xl">
                        <Target className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Our Mission
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed text-muted-foreground">
                      To establish and maintain the highest standards of professional competency in the security
                      industry through comprehensive certification programs, continuous education, and fostering a
                      global community of security practitioners committed to excellence and innovation.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-accent to-secondary rounded-3xl blur-lg opacity-20"></div>
                <Card className="relative bg-card/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-secondary"></div>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-accent/10 p-3 rounded-2xl">
                        <Globe className="h-8 w-8 text-accent" />
                      </div>
                      <CardTitle className="text-2xl bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
                        Our Vision
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed text-muted-foreground">
                      To be the world's leading authority in security professional certification, recognized globally
                      for our rigorous standards, innovative assessment methods, and unwavering commitment to advancing
                      the security profession through cutting-edge research and development.
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Accreditation & Recognition */}
        <section className="py-20 bg-gradient-to-br from-muted/20 to-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-block bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-semibold px-4 py-2 rounded-full mb-4">
                Global Recognition
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-balance mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Accreditation & Recognition
              </h2>
              <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
                GSPA certifications are globally recognized by leading organizations, governments, and Fortune 500
                companies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {[
                {
                  icon: Shield,
                  title: "ISO 9001:2015",
                  description: "Certified quality management system for consistent delivery of certification services.",
                  color: "from-primary to-accent",
                  bg: "bg-primary/10",
                },
                {
                  icon: Award,
                  title: "ANSI Accreditation",
                  description: "Accredited by the American National Standards Institute for personnel certification.",
                  color: "from-accent to-secondary",
                  bg: "bg-accent/10",
                },
                {
                  icon: Globe,
                  title: "Global Recognition",
                  description: "Recognized by Fortune 500 companies and government agencies in 120+ countries.",
                  color: "from-secondary to-primary",
                  bg: "bg-secondary/10",
                },
                {
                  icon: Users,
                  title: "Industry Partnerships",
                  description:
                    "Strategic partnerships with leading security organizations and educational institutions.",
                  color: "from-primary to-primary/80",
                  bg: "bg-primary/10",
                },
              ].map((item, index) => (
                <Card key={index} className="relative border-0 shadow-xl overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-5`}></div>
                  <CardHeader className="text-center relative z-10">
                    <div className={`inline-flex p-4 rounded-2xl ${item.bg} mb-4`}>
                      <item.icon className={`h-10 w-10 bg-gradient-to-r ${item.color} bg-clip-text text-transparent`} />
                    </div>
                    <CardTitle className="text-lg font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-sm leading-relaxed">{item.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Enhanced Core Values */}
            <div className="text-center mb-16">
              <div className="inline-block bg-gradient-to-r from-accent to-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-full mb-4">
                Our Foundation
              </div>
              <h3 className="text-3xl lg:text-4xl font-bold text-balance mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Our Core Values
              </h3>
              <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
                The principles that guide everything we do at GSPA and shape our global community.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Gem,
                  title: "Excellence",
                  description:
                    "We maintain the highest standards in all our certification programs and educational offerings.",
                  color: "from-primary to-accent",
                },
                {
                  icon: Heart,
                  title: "Integrity",
                  description: "We operate with transparency, honesty, and ethical practices in all our interactions.",
                  color: "from-accent to-secondary",
                },
                {
                  icon: Rocket,
                  title: "Innovation",
                  description: "We continuously evolve our methods and technologies to stay ahead of industry trends.",
                  color: "from-secondary to-primary",
                },
              ].map((value, index) => (
                <Card key={index} className="text-center border-0 shadow-xl">
                  <CardHeader>
                    <div className="bg-gradient-to-r from-muted to-background p-6 rounded-2xl mb-4">
                      <value.icon
                        className={`h-12 w-12 bg-gradient-to-r ${value.color} bg-clip-text text-transparent mx-auto`}
                      />
                    </div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                      {value.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">{value.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Leadership Team */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-block bg-gradient-to-r from-accent to-secondary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-full mb-4">
                Meet Our Team
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-balance mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Leadership Team
              </h2>
              <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
                The visionary leaders driving GSPA's mission to advance security excellence worldwide.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: "Dr. Sarah Chen",
                  role: "Executive Director",
                  bio: "Former CISO at Fortune 500 companies with 20+ years in cybersecurity leadership and policy development.",
                  color: "from-primary to-accent",
                },
                {
                  name: "Michael Rodriguez",
                  role: "Chief Certification Officer",
                  bio: "Expert in certification program development with extensive experience in network security and compliance.",
                  color: "from-accent to-secondary",
                },
                {
                  name: "Emma Thompson",
                  role: "Director of Education",
                  bio: "Digital forensics specialist and educator with a PhD in Computer Science and 15 years of teaching experience.",
                  color: "from-secondary to-primary",
                },
                {
                  name: "James Wilson",
                  role: "VP of Operations",
                  bio: "Operations expert with background in enterprise security management and international business development.",
                  color: "from-primary to-primary/80",
                },
                {
                  name: "Lisa Park",
                  role: "Chief Technology Officer",
                  bio: "Technology innovation leader specializing in cloud security, AI, and next-generation security platforms.",
                  color: "from-accent to-accent/80",
                },
                {
                  name: "David Kumar",
                  role: "Director of Research",
                  bio: "Security researcher and thought leader with publications in top-tier journals and speaking engagements worldwide.",
                  color: "from-secondary to-secondary/80",
                },
              ].map((member, index) => (
                <Card key={index} className="text-center border-0 shadow-xl overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${member.color} opacity-5`}></div>
                  <CardHeader className="relative z-10">
                    <div className="relative mx-auto mb-4">
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${member.color} rounded-full blur-lg opacity-50`}
                      ></div>
                      <div className="relative w-20 h-20 bg-gradient-to-br from-muted to-background rounded-full flex items-center justify-center border-4 border-background shadow-lg">
                        <Users className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </div>
                    <CardTitle className="text-lg font-bold text-foreground">{member.name}</CardTitle>
                    <CardDescription
                      className={`font-semibold bg-gradient-to-r ${member.color} bg-clip-text text-transparent`}
                    >
                      {member.role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Simplified History Section - Removed animated background elements */}
        <section className="py-20 bg-slate-900 relative overflow-hidden">
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-full px-4 py-2 mb-6">
                <Shield className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-300">Our Journey Since 2010</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">Our Story</h2>
              <p className="text-xl text-slate-300 text-pretty max-w-2xl mx-auto">
                Founded by security professionals, for security professionals. A legacy of excellence and innovation.
              </p>
            </div>

            <div className="prose prose-lg max-w-none text-slate-300">
              <p className="leading-relaxed mb-6 text-lg">
                The Global Security Practitioners Alliance was established in response to the growing need for
                standardized, globally recognized security certifications. As the security landscape evolved rapidly
                with new threats and technologies, industry leaders recognized the importance of having a unified
                approach to professional development and certification.
              </p>

              <p className="leading-relaxed mb-6 text-lg">
                Our founding members, comprising seasoned security professionals from various sectors including
                corporate security, cybersecurity, physical security, and risk management, came together with a shared
                vision: to create a certification body that would set the gold standard for security professional
                competency worldwide.
              </p>

              <p className="leading-relaxed text-lg">
                Today, GSPA serves thousands of security professionals across 120+ countries, offering rigorous
                certification programs that are recognized by leading organizations across industries. Our commitment to
                excellence and continuous improvement ensures that our certifications remain relevant and valuable in an
                ever-changing security landscape.
              </p>
            </div>

            {/* Timeline visual */}
            <div className="grid grid-cols-4 gap-4 mt-12">
              {[2010, 2014, 2018, 2024].map((year, index) => (
                <div key={year} className="text-center">
                  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <div className="text-2xl font-bold text-white mb-1">{year}</div>
                    <div className="text-slate-400 text-sm">Milestone</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
