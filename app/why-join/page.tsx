import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Award, Network, BookOpen, Shield, Users, CheckCircle, ArrowRight, Star, Zap, Globe, Target, Rocket } from "lucide-react"
import Link from "next/link"

export default function WhyJoinPage() {
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
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-yellow-400" tabIndex={0} aria-label="Join 50,000+ Certified Professionals">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-white/80">Join 50,000+ Certified Professionals</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent" tabIndex={0} aria-label="Why Join GSPA?">
                Why Join GSPA?
              </h1>
              <p className="text-xl text-blue-100 text-pretty mb-8 leading-relaxed max-w-3xl mx-auto" tabIndex={0}>
                Unlock your potential with globally recognized security certification. Join a community of elite
                professionals and accelerate your career growth with industry-leading credentials.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-12">
                <div className="text-center" tabIndex={0} aria-label="50K+ Members">
                  <div className="text-3xl font-bold text-white mb-2">50K+</div>
                  <div className="text-blue-200 text-sm">Members</div>
                </div>
                <div className="text-center" tabIndex={0} aria-label="120+ Countries">
                  <div className="text-3xl font-bold text-white mb-2">120+</div>
                  <div className="text-blue-200 text-sm">Countries</div>
                </div>
                <div className="text-center" tabIndex={0} aria-label="25% Salary Boost">
                  <div className="text-3xl font-bold text-white mb-2">25%</div>
                  <div className="text-blue-200 text-sm">Salary Boost</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Key Benefits */}
        <section className="relative py-20 -mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-block bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-semibold px-4 py-2 rounded-full mb-4">
                Career Acceleration
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-balance mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Transform Your Security Career
              </h2>
              <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
                GSPA certification opens doors to new opportunities and validates your expertise with industry-leading credentials.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: TrendingUp,
                  title: "Career Growth",
                  description: "Certified professionals earn 25% more on average and access senior-level positions in leading organizations.",
                  color: "from-primary to-accent",
                  bg: "bg-primary/10"
                },
                {
                  icon: Award,
                  title: "Global Recognition",
                  description: "GSPA certifications are recognized by Fortune 500 companies and government agencies worldwide.",
                  color: "from-accent to-secondary",
                  bg: "bg-accent/10"
                },
                {
                  icon: Network,
                  title: "Professional Network",
                  description: "Connect with 50,000+ certified security professionals across 120 countries and growing.",
                  color: "from-secondary to-primary",
                  bg: "bg-secondary/10"
                },
                {
                  icon: BookOpen,
                  title: "Continuous Learning",
                  description: "Access exclusive resources, webinars, and continuing education opportunities to stay ahead.",
                  color: "from-primary to-primary/80",
                  bg: "bg-primary/10"
                },
                {
                  icon: Shield,
                  title: "Credibility Boost",
                  description: "Demonstrate your commitment to professional excellence and ethical security practices.",
                  color: "from-accent to-accent/80",
                  bg: "bg-accent/10"
                },
                {
                  icon: Users,
                  title: "Community Support",
                  description: "Join local chapters, attend global events, and participate in professional development.",
                  color: "from-secondary to-secondary/80",
                  bg: "bg-secondary/10"
                }
              ].map((benefit, index) => (
                <Card key={index} className="relative border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group overflow-hidden focus-within:ring-4 focus-within:ring-blue-400" tabIndex={0} aria-label={benefit.title}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${benefit.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <CardHeader className="relative z-10">
                    <div className={`inline-flex p-3 rounded-2xl ${benefit.bg} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <benefit.icon className={`h-8 w-8 bg-gradient-to-r ${benefit.color} bg-clip-text text-transparent`} />
                    </div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                      {benefit.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-base text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Certification Benefits */}
        <section className="py-20 bg-gradient-to-br from-muted/20 to-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-semibold px-4 py-2 rounded-full mb-4">
                  Membership Perks
                </div>
                <h2 className="text-4xl font-bold text-balance mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Exclusive Member Benefits
                </h2>
                <div className="space-y-6">
                  {[
                    {
                      icon: Award,
                      title: "Official Certificate & Digital Badge",
                      description: "Digital and physical certificates with unique QR verification codes for instant validation"
                    },
                    {
                      icon: Globe,
                      title: "Global Member Directory",
                      description: "Get listed in our worldwide directory and connect with security professionals globally"
                    },
                    {
                      icon: BookOpen,
                      title: "Continuing Education",
                      description: "Unlimited access to exclusive training materials, industry reports, and updates"
                    },
                    {
                      icon: Target,
                      title: "Career Support",
                      description: "Premium job board access, resume reviews, and career advancement resources"
                    },
                    {
                      icon: Rocket,
                      title: "Industry Partnerships",
                      description: "Discounts on security tools, software, and exclusive partner offers"
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:bg-card transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-blue-400" tabIndex={0} aria-label={item.title}>
                      <div className="bg-gradient-to-r from-primary to-accent p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <item.icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enhanced Stats Card */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary to-accent rounded-3xl blur-lg opacity-20"></div>
                <Card className="relative bg-card/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl overflow-hidden focus-within:ring-4 focus-within:ring-blue-400" tabIndex={0} aria-label="Certification Success Metrics">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      Certification Success Metrics
                    </CardTitle>
                    <CardDescription>Real results from our certified professionals</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {[
                      { label: "Exam Pass Rate", value: 78, color: "from-primary to-accent" },
                      { label: "Career Advancement", value: 85, color: "from-accent to-secondary" },
                      { label: "Salary Increase", value: 25, color: "from-secondary to-primary" },
                      { label: "Member Satisfaction", value: 94, color: "from-primary to-primary/80" }
                    ].map((stat, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-foreground">{stat.label}</span>
                          <span className="text-sm font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{stat.value}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-3 rounded-full bg-gradient-to-r ${stat.color} transition-all duration-1000 ease-out`}
                            style={{ width: `${stat.value}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Comparison Section */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-block bg-gradient-to-r from-destructive to-orange-600 text-destructive-foreground text-sm font-semibold px-4 py-2 rounded-full mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400" tabIndex={0} aria-label="Industry Comparison">
                Industry Comparison
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-balance mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Why GSPA Stands Out
              </h2>
              <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
                See how GSPA outperforms other certification providers with innovative features and superior value.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-border">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                      <th className="p-6 text-left font-semibold text-lg">Feature</th>
                      <th className="p-6 text-center font-semibold text-lg bg-primary-foreground/10 border-l border-primary-foreground/20">
                        <div className="flex items-center justify-center gap-2">
                          <Star className="h-5 w-5 text-yellow-400" />
                          GSPA
                        </div>
                      </th>
                      <th className="p-6 text-center font-semibold text-lg border-l border-primary-foreground/20">Competitor A</th>
                      <th className="p-6 text-center font-semibold text-lg border-l border-primary-foreground/20">Competitor B</th>
                      <th className="p-6 text-center font-semibold text-lg border-l border-primary-foreground/20">Competitor C</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: "Annual Membership", gspa: "$70", a: "$150", b: "$200", c: "$120", highlight: true },
                      { feature: "Global Recognition", gspa: "✓", a: "✓", b: "Limited", c: "✓" },
                      { feature: "QR Code Verification", gspa: "✓", a: "✗", b: "✗", c: "✗", highlight: true },
                      { feature: "Practical Exams", gspa: "✓", a: "✓", b: "Theory Only", c: "✓" },
                      { feature: "Continuing Education", gspa: "✓", a: "Limited", b: "✓", c: "Extra Cost", highlight: true },
                      { feature: "Industry Partnerships", gspa: "✓", a: "Few", b: "✓", c: "Regional" },
                      { feature: "Mobile Learning", gspa: "✓", a: "✓", b: "✗", c: "Limited" },
                      { feature: "24/7 Support", gspa: "✓", a: "Business Hours", b: "Business Hours", c: "✓" },
                      { feature: "Average Pass Rate", gspa: "78%", a: "65%", b: "72%", c: "68%", highlight: true }
                    ].map((row, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-muted/30" : "bg-background"}>
                        <td className="p-6 font-medium text-foreground border-t border-border">{row.feature}</td>
                        <td className={`p-6 text-center font-semibold border-t border-border border-l ${row.highlight ? "bg-primary/10 text-primary" : ""}`}>
                          {row.gspa}
                        </td>
                        <td className="p-6 text-center border-t border-border border-l text-muted-foreground">{row.a}</td>
                        <td className="p-6 text-center border-t border-border border-l text-muted-foreground">{row.b}</td>
                        <td className="p-6 text-center border-t border-border border-l text-muted-foreground">{row.c}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-muted-foreground mb-8 text-sm">
                *Comparison based on industry standards and competitor analysis as of 2024
              </p>
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-8 max-w-2xl mx-auto shadow-lg">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Target className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold text-foreground">The GSPA Advantage</h3>
                </div>
                <p className="text-muted-foreground">
                  With significantly lower costs, higher pass rates, and innovative features like instant QR verification,
                  GSPA delivers exceptional value and modern certification solutions for today's security professionals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary via-accent to-primary relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl"></div>
          </div>

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-primary-foreground mb-4" tabIndex={0} aria-label="Ready to Transform Your Career?">Ready to Transform Your Career?</h2>
            <p className="text-xl text-primary-foreground/90 text-pretty max-w-2xl mx-auto mb-8 leading-relaxed" tabIndex={0}>
              Join thousands of security professionals who have accelerated their careers with GSPA certification.
              Your journey to global recognition starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" variant="secondary" className="rounded-xl px-8 py-3 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-400" asChild aria-label="Start Your Registration">
                <Link href="/register">
                  Start Your Registration <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl px-8 py-3 text-lg font-semibold border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-blue-200" aria-label="Download Brochure">
                Download Brochure
              </Button>
            </div>
            <p className="text-primary-foreground/80 text-sm mt-6" tabIndex={0}>No commitment required. Get started in 5 minutes.</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
