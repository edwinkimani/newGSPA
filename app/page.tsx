"use client"

import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Award, Users, BookOpen, ArrowRight, CreditCard, Zap, Star, Globe, Target, Rocket, CheckCircle } from "lucide-react"
import Link from "next/link"
import { AdminSetupNotice } from "@/components/admin-setup-notice"
import { UserAdvertisement } from "@/components/user-advertisement"
import Script from "next/script"
import { motion } from "framer-motion"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-muted/20 to-background">
      <Navigation />
      <AdminSetupNotice />
      <UserAdvertisement />

      <main id="main-content" className="flex-1">
        {/* Enhanced Hero Section */}
        <section className="relative py-16 sm:py-20 lg:py-24 xl:py-28 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 overflow-hidden" aria-label="Hero section">
          {/* Background decorative elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72 bg-blue-500/10 rounded-full blur-2xl lg:blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-60 sm:h-60 lg:w-96 lg:h-96 bg-purple-500/10 rounded-full blur-2xl lg:blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-40 sm:h-48 lg:h-64 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div
                className="text-center lg:text-left space-y-6 lg:space-y-8"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.div
                  className="flex justify-center lg:justify-start"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
                >
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-4 lg:mb-6 focus:outline-none focus:ring-2 focus:ring-yellow-400" tabIndex={0} aria-label="Global Security Certification badge">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-white/80">Global Security Certification</span>
                  </div>
                </motion.div>
                
                <div className="space-y-4 lg:space-y-6">
                  <motion.h1
                    className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-balance leading-tight"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                  >
                    <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                      Global Security
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
                      Practitioners Alliance
                    </span>
                  </motion.h1>
                  <motion.p
                    className="text-lg sm:text-xl lg:text-2xl text-blue-100 text-pretty leading-relaxed max-w-2xl mx-auto lg:mx-0"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                  >
                    Elevate your security career with globally recognized certifications, comprehensive training, 
                    and a professional community of 50,000+ security experts worldwide.
                  </motion.p>
                </div>

                {/* Quick Stats */}
                <motion.div
                  className="grid grid-cols-2 gap-4 sm:flex sm:gap-6 lg:gap-8 pt-4 justify-center sm:justify-center lg:justify-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.8 }}
                >
                  {[
                    { number: "50K+", label: "Professionals" },
                    { number: "120+", label: "Countries" },
                    { number: "98%", label: "Satisfaction" },
                    { number: "25%", label: "Salary Boost" }
                  ].map((stat, index) => (
                    <div key={index} className="text-center min-w-[100px] sm:min-w-[120px]">
                      <div className="text-xl sm:text-2xl font-bold text-white">{stat.number}</div>
                      <div className="text-blue-200 text-xs sm:text-sm">{stat.label}</div>
                    </div>
                  ))}
                </motion.div>

                <motion.div
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 justify-center lg:justify-start pt-6 lg:pt-8 w-full max-w-md mx-auto lg:mx-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                >
                  <Button
                    size="lg"
                    className="text-base sm:text-lg px-5 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-6 w-full sm:w-auto shadow-xl sm:shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-400"
                    asChild
                    aria-label="Start Certification"
                  >
                    <Link href="/register">
                      Start Certification <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-base sm:text-lg px-5 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-6 w-full sm:w-auto border-2 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-200"
                    asChild
                    aria-label="Learn More About GSPA"
                  >
                    <Link href="/about">Learn More</Link>
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div
                className="flex justify-center lg:justify-end"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              >
                <div className="relative group">
                  <div className="absolute -inset-3 sm:-inset-4 lg:-inset-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl lg:blur-3xl group-hover:blur-3xl sm:group-hover:blur-4xl transition-all duration-500 opacity-20"></div>
                  <div className="relative w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[400px] md:max-w-[450px] lg:max-w-[500px] h-auto aspect-[3/4] bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl sm:rounded-3xl flex items-center justify-center border border-slate-700/50 shadow-xl sm:shadow-2xl backdrop-blur-sm overflow-hidden mx-auto">
                    <div className="text-center p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
                      <div className="relative">
                        <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg sm:blur-xl lg:blur-2xl opacity-50"></div>
                        <Shield className="relative h-20 w-20 sm:h-24 sm:w-24 lg:h-32 lg:w-32 text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text mx-auto" />
                      </div>
                      <div className="space-y-3 sm:space-y-4">
                        <p className="text-blue-200 font-bold text-lg sm:text-xl lg:text-2xl">Professional Security Certification</p>
                        <p className="text-blue-300 text-sm sm:text-base lg:text-lg">Globally Recognized • Industry Standard</p>
                      </div>
                      
                      {/* Floating elements */}
                      <Star className="absolute top-4 left-4 sm:top-6 sm:left-6 h-4 w-4 sm:h-6 sm:w-6 text-yellow-400" />
                      <Award className="absolute top-4 right-4 sm:top-6 sm:right-6 h-4 w-4 sm:h-6 sm:w-6 text-blue-400" />
                      <Globe className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 h-4 w-4 sm:h-6 sm:w-6 text-purple-400" />
                      <Target className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 h-4 w-4 sm:h-6 sm:w-6 text-green-400" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Enhanced Accreditation Prompt */}
        <section className="relative py-16 sm:py-20 -mt-12 sm:-mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 shadow-xl sm:shadow-2xl overflow-hidden">
              <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-2xl sm:blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-2xl sm:blur-3xl"></div>
              </div>
              
              <div className="text-center space-y-6 sm:space-y-8 relative z-10">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <img
                    src="/Global-Security-Practitioners-Alliance.png"
                    alt="Global Security Practitioners Alliance logo"
                    className="h-16 sm:h-20 w-auto brightness-0 invert focus:outline-none focus:ring-2 focus:ring-blue-400"
                    tabIndex={0}
                  />
                </div>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full text-sm font-semibold shadow-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400" tabIndex={0} aria-label="Global Accreditation Authority">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                  Global Accreditation Authority
                </div>
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white text-balance px-2 sm:px-4">
                    Get Accredited Globally – Take the Security Aptitude Exam
                  </h2>
                  <p className="text-base sm:text-lg lg:text-xl text-blue-100 text-pretty max-w-3xl mx-auto leading-relaxed px-2 sm:px-4">
                    Join thousands of security professionals worldwide who have earned their GSPA certification. 
                    Demonstrate your expertise and accelerate your career growth with industry-leading credentials.
                  </p>
                </div>
                <div className="pt-2 sm:pt-4">
                  <Button
                    size="lg"
                    asChild
                    className="bg-white text-blue-600 hover:bg-blue-50 text-base sm:text-lg px-6 py-4 sm:px-8 sm:py-5 lg:px-10 lg:py-6 shadow-xl sm:shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 font-semibold rounded-xl sm:rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-400"
                    aria-label="Start Accreditation Process"
                  >
                    <Link href="/register">
                      Start Accreditation Process <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-12 sm:mb-16 lg:mb-20 px-2 sm:px-0">
              <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-full mb-3 sm:mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400" tabIndex={0} aria-label="Why Choose GSPA">
                Why Choose GSPA?
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance mb-4 sm:mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Transform Your Security Career
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground text-pretty max-w-3xl mx-auto leading-relaxed">
                Join 50,000+ security professionals who have advanced their careers through our comprehensive certification program.
              </p>
            </div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, staggerChildren: 0.1 }}
              viewport={{ once: true }}
            >
              {[
                {
                  icon: Award,
                  title: "Professional Certification",
                  description: "Earn globally recognized security certifications that validate your expertise and boost your career.",
                  color: "from-blue-500 to-blue-600",
                  bg: "bg-blue-50"
                },
                {
                  icon: BookOpen,
                  title: "Comprehensive Testing",
                  description: "Rigorous security aptitude tests designed by industry experts with real-world scenarios.",
                  color: "from-purple-500 to-purple-600",
                  bg: "bg-purple-50"
                },
                {
                  icon: Users,
                  title: "Global Community",
                  description: "Connect with 50,000+ security professionals across 120+ countries and growing.",
                  color: "from-green-500 to-green-600",
                  bg: "bg-green-50"
                },
                {
                  icon: Shield,
                  title: "Industry Recognition",
                  description: "Certificates recognized by Fortune 500 companies and government agencies worldwide.",
                  color: "from-orange-500 to-orange-600",
                  bg: "bg-orange-50"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="text-center group hover:shadow-xl sm:hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 border-0 bg-card/80 backdrop-blur-sm overflow-hidden focus-within:ring-4 focus-within:ring-blue-400 h-full" tabIndex={0} aria-label={feature.title}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    <CardHeader className="pb-4 sm:pb-6 relative z-10">
                      <div className="relative mx-auto mb-4 sm:mb-6">
                        <div className={`absolute -inset-2 sm:-inset-3 bg-gradient-to-r ${feature.color} rounded-xl sm:rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-20`}></div>
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center shadow group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-300">
                          {feature.title === "Professional Certification" ? (
                            <feature.icon className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 drop-shadow" />
                          ) : feature.title === "Comprehensive Testing" ? (
                            <feature.icon className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600 drop-shadow" />
                          ) : feature.title === "Global Community" ? (
                            <feature.icon className="h-8 w-8 sm:h-10 sm:w-10 text-green-600 drop-shadow" />
                          ) : feature.title === "Industry Recognition" ? (
                            <feature.icon className="h-8 w-8 sm:h-10 sm:w-10 text-orange-500 drop-shadow" />
                          ) : (
                            <feature.icon className="h-8 w-8 sm:h-10 sm:w-10 text-primary drop-shadow" />
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <CardDescription className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Enhanced Process Section */}
        <section className="py-16 sm:py-20 lg:py-24 bg-background relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-12 sm:mb-16 lg:mb-20 px-2 sm:px-0">
              <div className="inline-block bg-gradient-to-r from-green-600 to-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-full mb-3 sm:mb-4 focus:outline-none focus:ring-2 focus:ring-green-400" tabIndex={0} aria-label="Simple 4-Step Process">
                Simple 4-Step Process
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance mb-4 sm:mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Get Certified in 4 Easy Steps
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground text-pretty max-w-3xl mx-auto leading-relaxed">
                Simple, streamlined process to earn your professional security certification and advance your career.
              </p>
            </div>

            {/* Desktop Process with enhanced design */}
            <div className="hidden lg:block relative">
              <div className="absolute top-20 sm:top-24 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/20 via-blue-500/40 to-blue-500/20 rounded-full"></div>
              <div className="grid grid-cols-4 gap-6 lg:gap-8 relative">
                {[
                  { step: 1, icon: Users, title: "Register", description: "Create your profile with required documentation", color: "from-blue-500 to-blue-600" },
                  { step: 2, icon: CreditCard, title: "Payment", description: "Secure payment processing for certification fee", color: "from-purple-500 to-purple-600" },
                  { step: 3, icon: BookOpen, title: "Take Test", description: "Complete the security aptitude assessment", color: "from-green-500 to-green-600" },
                  { step: 4, icon: Award, title: "Get Certified", description: "Receive your official certificate upon passing", color: "from-orange-500 to-orange-600" }
                ].map((item, index) => (
                  <div key={index} className="text-center group focus-within:ring-4 focus-within:ring-blue-400" tabIndex={0} aria-label={item.title}>
                    <div className="relative mb-6 lg:mb-8">
                      <div className={`absolute -inset-3 sm:-inset-4 bg-gradient-to-r ${item.color} rounded-full blur-xl group-hover:blur-2xl transition-all duration-300 opacity-20`}></div>
                      <div className={`relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br ${item.color} text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold shadow-xl sm:shadow-2xl group-hover:scale-105 sm:group-hover:scale-110 transition-transform duration-300`}>
                        {item.step}
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-muted to-background rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-border shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:border-border">
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${item.color} rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg`}>
                        <item.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-foreground">{item.title}</h3>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Mobile Process */}
            <div className="lg:hidden space-y-4 sm:space-y-6">
              {[
                { step: 1, icon: Users, title: "Register", description: "Create your profile with required documentation", color: "from-blue-500 to-blue-600" },
                { step: 2, icon: CreditCard, title: "Payment", description: "Secure payment processing for certification fee", color: "from-purple-500 to-purple-600" },
                { step: 3, icon: BookOpen, title: "Take Test", description: "Complete the security aptitude assessment", color: "from-green-500 to-green-600" },
                { step: 4, icon: Award, title: "Get Certified", description: "Receive your official certificate upon passing", color: "from-orange-500 to-orange-600" }
              ].map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-gradient-to-r from-muted to-background rounded-xl sm:rounded-2xl border border-border shadow-lg focus-within:ring-4 focus-within:ring-blue-400" tabIndex={0} aria-label={item.title}>
                  <div className="flex-shrink-0 flex items-center gap-4 sm:block">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${item.color} text-white rounded-full flex items-center justify-center text-base sm:text-lg font-bold shadow-lg`}>
                      {item.step}
                    </div>
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center sm:mx-auto sm:mt-4`}>
                      <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-bold text-lg sm:text-xl text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden" aria-label="Call to action">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-48 h-48 sm:w-64 sm:h-64 bg-blue-500/10 rounded-full blur-2xl sm:blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-purple-500/10 rounded-full blur-2xl sm:blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="space-y-6 lg:space-y-8">
                <div className="flex justify-center lg:justify-start mb-4 sm:mb-6">
                  <img
                    src="/Global-Security-Practitioners-Alliance.png"
                    alt="Global Security Practitioners Alliance logo"
                    className="h-16 sm:h-20 w-auto brightness-0 invert focus:outline-none focus:ring-2 focus:ring-blue-400"
                    tabIndex={0}
                  />
                </div>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400" tabIndex={0} aria-label="Ready to Transform Your Career?">
                  <Rocket className="h-4 w-4" />
                  Ready to Transform Your Career?
                </div>
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white text-balance leading-tight">
                    Start Your Certification Journey Today
                  </h2>
                  <p className="text-base sm:text-lg lg:text-xl text-blue-100 text-pretty leading-relaxed max-w-2xl">
                    Join thousands of security professionals who have accelerated their careers with GSPA certification. 
                    Your journey to global recognition starts here.
                  </p>
                  
                  {/* Benefits list */}
                  <div className="space-y-2 sm:space-y-3">
                    {["Globally Recognized Certification", "Career Advancement Opportunities", "Professional Network Access", "24/7 Support"].map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3 text-blue-200">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 flex-shrink-0" />
                        <span className="text-sm sm:text-base">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button
                    size="lg"
                    asChild
                    className="bg-white text-blue-600 hover:bg-blue-50 text-base sm:text-lg px-5 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-6 w-full sm:w-auto shadow-xl sm:shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 font-semibold rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400"
                    aria-label="Start Certification Now"
                  >
                    <Link href="/register">Start Certification Now</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 text-base sm:text-lg px-5 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-6 w-full sm:w-auto rounded-xl backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-blue-200"
                    aria-label="Download Brochure"
                  >
                    Download Brochure
                  </Button>
                </div>
              </div>
              <div className="flex justify-center lg:justify-end">
                <div className="relative group">
                  <div className="absolute -inset-3 sm:-inset-4 lg:-inset-6 bg-white/10 rounded-xl sm:rounded-2xl lg:rounded-3xl blur-lg sm:blur-xl lg:blur-2xl group-hover:blur-xl sm:group-hover:blur-2xl lg:group-hover:blur-3xl transition-all duration-500"></div>
                  <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md h-64 sm:h-72 lg:h-80 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl lg:rounded-3xl flex items-center justify-center border border-white/20 shadow-xl sm:shadow-2xl">
                    <div className="text-center p-6 sm:p-8 space-y-4 sm:space-y-6">
                      <div className="relative">
                        <div className="absolute -inset-3 sm:-inset-4 bg-white/20 rounded-full blur-lg sm:blur-xl"></div>
                        <Award className="relative h-16 w-16 sm:h-20 sm:w-20 text-white mx-auto" />
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        <p className="text-white font-bold text-xl sm:text-2xl lg:text-3xl">Your Future Starts Here</p>
                        <p className="text-white/80 text-sm sm:text-base lg:text-lg">Join the elite ranks of certified security professionals</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Structured Data */}
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Global Security Practitioners Alliance",
            "url": "https://gspa.org",
            "logo": "https://gspa.org/Global-Security-Practitioners-Alliance.png",
            "description": "Professional security certification and training organization offering globally recognized certifications in Cybersecurity, Network Security, and Digital Forensics.",
            "foundingDate": "2020",
            "sameAs": [
              "https://facebook.com/gspa",
              "https://twitter.com/gspa",
              "https://linkedin.com/company/gspa",
              "https://youtube.com/gspa"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+1-555-123-4567",
              "contactType": "customer service",
              "email": "info@gspa.org"
            },
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "123 Security Boulevard",
              "addressLocality": "Professional District",
              "addressRegion": "NY",
              "postalCode": "10001",
              "addressCountry": "US"
            },
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Security Certification Programs",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Course",
                    "name": "Cybersecurity Professional Certification",
                    "description": "Comprehensive cybersecurity certification covering threat detection, risk assessment, and security implementation.",
                    "provider": {
                      "@type": "Organization",
                      "name": "Global Security Practitioners Alliance"
                    }
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Course",
                    "name": "Network Security Specialist Certification",
                    "description": "Advanced network security certification focusing on infrastructure protection and secure network design.",
                    "provider": {
                      "@type": "Organization",
                      "name": "Global Security Practitioners Alliance"
                    }
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Course",
                    "name": "Digital Forensics Expert Certification",
                    "description": "Digital forensics certification covering evidence collection, analysis techniques, and legal procedures.",
                    "provider": {
                      "@type": "Organization",
                      "name": "Global Security Practitioners Alliance"
                    }
                  }
                }
              ]
            }
          })
        }}
      />
    </div>
  )
}