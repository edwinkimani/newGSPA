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
        <section className="relative py-16 lg:py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-48 h-48 lg:w-72 lg:h-72 bg-blue-500/10 rounded-full blur-2xl lg:blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 lg:w-96 lg:h-96 bg-purple-500/10 rounded-full blur-2xl lg:blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6" tabIndex={0} aria-label="Leading Security Certification Since 2010">
                <Shield className="h-4 w-4 text-blue-300" />
                <span className="text-sm text-white/80">Leading Security Certification Since 2010</span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent" tabIndex={0} aria-label="About GSPA">
                About GSPA
              </h1>
              <p className="text-lg lg:text-xl text-blue-100 mb-8 leading-relaxed max-w-3xl mx-auto" tabIndex={0}>
                The Global Security Practitioners Alliance is dedicated to advancing security excellence through
                professional certification, innovative training, and global community building.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-8">
                <div className="text-center" tabIndex={0} aria-label="50K+ Professionals">
                  <div className="text-2xl lg:text-3xl font-bold text-white mb-2">50K+</div>
                  <div className="text-blue-200 text-sm">Professionals</div>
                </div>
                <div className="text-center" tabIndex={0} aria-label="120+ Countries">
                  <div className="text-2xl lg:text-3xl font-bold text-white mb-2">120+</div>
                  <div className="text-blue-200 text-sm">Countries</div>
                </div>
                <div className="text-center" tabIndex={0} aria-label="14 Years">
                  <div className="text-2xl lg:text-3xl font-bold text-white mb-2">14</div>
                  <div className="text-blue-200 text-sm">Years</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Mission & Vision */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl blur-lg opacity-10"></div>
                <Card className="relative bg-card/90 backdrop-blur-sm border-0 shadow-md rounded-2xl overflow-hidden" tabIndex={0} aria-label="Our Mission">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-100 p-3 rounded-2xl">
                        <Target className="h-7 w-7 text-blue-700" />
                      </div>
                      <CardTitle className="text-xl bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                        Our Mission
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      To establish and maintain the highest standards of professional competency in the security
                      industry through comprehensive certification programs, continuous education, and fostering a
                      global community of security practitioners committed to excellence and innovation.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl blur-lg opacity-10"></div>
                <Card className="relative bg-card/90 backdrop-blur-sm border-0 shadow-md rounded-2xl overflow-hidden" tabIndex={0} aria-label="Our Vision">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-green-100 p-3 rounded-2xl">
                        <Globe className="h-7 w-7 text-green-700" />
                      </div>
                      <CardTitle className="text-xl bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                        Our Vision
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      To be the world's leading authority in security professional certification, recognized globally
                      for our rigorous standards, innovative assessment methods, and unwavering commitment to advancing
                      the security profession through cutting-edge research and development.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Accreditation & Recognition */}
        <section className="py-16 bg-gradient-to-br from-muted/20 to-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-full mb-4">
                Global Recognition
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Accreditation & Recognition
              </h2>
              <p className="text-muted-foreground text-pretty max-w-2xl mx-auto">
                GSPA certifications are globally recognized by leading organizations, governments, and Fortune 500
                companies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                {
                  icon: Shield,
                  title: "ISO 9001:2015",
                  description: "Certified quality management system for consistent delivery of certification services.",
                  color: "from-blue-500 to-blue-600",
                  bg: "bg-blue-50",
                },
                {
                  icon: Award,
                  title: "ANSI Accreditation",
                  description: "Accredited by the American National Standards Institute for personnel certification.",
                  color: "from-green-500 to-green-600",
                  bg: "bg-green-50",
                },
                {
                  icon: Globe,
                  title: "Global Recognition",
                  description: "Recognized by Fortune 500 companies and government agencies in 120+ countries.",
                  color: "from-purple-500 to-purple-600",
                  bg: "bg-purple-50",
                },
                {
                  icon: Users,
                  title: "Industry Partnerships",
                  description:
                    "Strategic partnerships with leading security organizations and educational institutions.",
                  color: "from-orange-500 to-orange-600",
                  bg: "bg-orange-50",
                },
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-slate-200 to-slate-100 rounded-xl blur-md opacity-40"></div>
                  <Card className="relative border-0 shadow-md overflow-hidden" tabIndex={0} aria-label={item.title}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-5`}></div>
                    <CardHeader className="text-center pb-4 relative z-10 flex flex-col items-center">
                      <div className={`flex items-center justify-center mx-auto p-4 rounded-full bg-white shadow-md mb-4`}>
                        {item.title === "Global Recognition" ? (
                          <item.icon className="h-8 w-8 text-purple-600 drop-shadow" />
                        ) : item.title === "Industry Partnerships" ? (
                          <item.icon className="h-8 w-8 text-orange-500 drop-shadow" />
                        ) : (
                          <item.icon className={`h-8 w-8 ${item.color.replace('from-', 'text-').replace(' to-', ' ')} drop-shadow`} />
                        )}
                      </div>
                      <CardTitle className="text-lg font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Enhanced Core Values */}
            <div className="text-center mb-12">
              <div className="inline-block bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-semibold px-4 py-2 rounded-full mb-4">
                Our Foundation
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-balance mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Our Core Values
              </h3>
              <p className="text-muted-foreground text-pretty max-w-2xl mx-auto">
                The principles that guide everything we do at GSPA and shape our global community.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Gem,
                  title: "Excellence",
                  description:
                    "We maintain the highest standards in all our certification programs and educational offerings.",
                  color: "from-blue-500 to-blue-600",
                },
                {
                  icon: Heart,
                  title: "Integrity",
                  description: "We operate with transparency, honesty, and ethical practices in all our interactions.",
                  color: "from-green-500 to-green-600",
                },
                {
                  icon: Rocket,
                  title: "Innovation",
                  description: "We continuously evolve our methods and technologies to stay ahead of industry trends.",
                  color: "from-purple-500 to-purple-600",
                },
              ].map((value, index) => (
                <div key={index} className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-slate-200 to-slate-100 rounded-xl blur-md opacity-40"></div>
                  <Card className="relative text-center border-0 shadow-md" tabIndex={0} aria-label={value.title}>
                    <CardHeader>
                      <div className="bg-gradient-to-r from-muted to-background p-4 rounded-2xl mb-4 relative z-10">
                        <value.icon
                          className={`h-10 w-10 ${value.color.replace('from-', 'text-').replace(' to-', ' ')} drop-shadow mx-auto`}
                        />
                      </div>
                      <CardTitle className="text-lg font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent relative z-10">
                        {value.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Leadership Team */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-block bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-full mb-4">
                Meet Our Team
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Leadership Team
              </h2>
              <p className="text-muted-foreground text-pretty max-w-2xl mx-auto">
                The visionary leaders driving GSPA's mission to advance security excellence worldwide.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: "Dr. Sarah Chen",
                  role: "Executive Director",
                  bio: "Former CISO at Fortune 500 companies with 20+ years in cybersecurity leadership and policy development.",
                  color: "from-blue-500 to-blue-600",
                },
                {
                  name: "Michael Rodriguez",
                  role: "Chief Certification Officer",
                  bio: "Expert in certification program development with extensive experience in network security and compliance.",
                  color: "from-green-500 to-green-600",
                },
                {
                  name: "Emma Thompson",
                  role: "Director of Education",
                  bio: "Digital forensics specialist and educator with a PhD in Computer Science and 15 years of teaching experience.",
                  color: "from-purple-500 to-purple-600",
                },
                {
                  name: "James Wilson",
                  role: "VP of Operations",
                  bio: "Operations expert with background in enterprise security management and international business development.",
                  color: "from-orange-500 to-orange-600",
                },
                {
                  name: "Lisa Park",
                  role: "Chief Technology Officer",
                  bio: "Technology innovation leader specializing in cloud security, AI, and next-generation security platforms.",
                  color: "from-pink-500 to-pink-600",
                },
                {
                  name: "David Kumar",
                  role: "Director of Research",
                  bio: "Security researcher and thought leader with publications in top-tier journals and speaking engagements worldwide.",
                  color: "from-indigo-500 to-indigo-600",
                },
              ].map((member, index) => (
                <div key={index} className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-slate-200 to-slate-100 rounded-xl blur-md opacity-40"></div>
                  <Card className="relative text-center border-0 shadow-md overflow-hidden" tabIndex={0} aria-label={member.name}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${member.color} opacity-5`}></div>
                    <CardHeader className="relative z-10">
                      <div className="relative mx-auto mb-4">
                        <div
                          className={`absolute inset-0 bg-gradient-to-r ${member.color} rounded-full blur-md opacity-20`}
                        ></div>
                        <div className="relative w-16 h-16 bg-gradient-to-br from-muted to-background rounded-full flex items-center justify-center border-4 border-background">
                          <Users className={`h-7 w-7 ${member.color.replace('from-', 'text-').replace(' to-', ' ')} drop-shadow`} />
                        </div>
                      </div>
                      <CardTitle className="text-lg font-bold text-foreground">{member.name}</CardTitle>
                      <p className={`font-semibold bg-gradient-to-r ${member.color} bg-clip-text text-transparent`}>
                        {member.role}
                      </p>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <p className="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced History Section */}
        <section className="py-16 bg-slate-900 relative overflow-hidden">
          {/* Background gradient overlay */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl"></div>
          </div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-slate-800 backdrop-blur-sm border border-slate-700 rounded-full px-4 py-2 mb-6" tabIndex={0} aria-label="Our Journey Since 2010">
                <Shield className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-300">Our Journey Since 2010</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Our Story</h2>
              <p className="text-lg text-slate-300 text-pretty max-w-2xl mx-auto">
                Founded by security professionals, for security professionals. A legacy of excellence and innovation.
              </p>
            </div>

            <div className="text-slate-300 space-y-6">
              <p className="leading-relaxed text-lg">
                The Global Security Practitioners Alliance was established in response to the growing need for
                standardized, globally recognized security certifications. As the security landscape evolved rapidly
                with new threats and technologies, industry leaders recognized the importance of having a unified
                approach to professional development and certification.
              </p>

              <p className="leading-relaxed text-lg">
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
              {[2010, 2014, 2018, 2024].map((year, index) => (
                <div key={year} className="text-center relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg blur-sm"></div>
                  <div className="relative bg-slate-800 rounded-lg p-4 border border-slate-700 backdrop-blur-sm">
                    <div className="text-xl font-bold text-white mb-1">{year}</div>
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