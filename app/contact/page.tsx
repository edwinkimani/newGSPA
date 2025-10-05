"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Send,
  Zap,
  Users,
  Globe,
  Loader2,
  CheckCircle,
} from "lucide-react"

interface ContactForm {
  firstName: string
  lastName: string
  email: string
  subject: string
  message: string
}

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [honeypot, setHoneypot] = useState("")

  useEffect(() => {
    document.title = "Contact Us - GSPA | Global Security Practitioners Alliance"

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Contact the Global Security Practitioners Alliance for certification inquiries, support, and questions. We respond within 24 hours.",
      )
    } else {
      const meta = document.createElement("meta")
      meta.name = "description"
      meta.content =
        "Contact the Global Security Practitioners Alliance for certification inquiries, support, and questions. We respond within 24 hours."
      document.head.appendChild(meta)
    }
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    clearErrors,
    setError,
  } = useForm<ContactForm>({
    mode: "onChange", // Validate on change for immediate feedback
  })

  // Debug: watch form values
  const watchedValues = watch()
  console.log("Form values:", watchedValues)

  // Clear submit error when user starts typing
  useEffect(() => {
    if (submitError && Object.values(watchedValues).some((value) => value && value.length > 0)) {
      setSubmitError(null)
    }
  }, [watchedValues, submitError])

  const onSubmit = async (data: ContactForm) => {
    // Check honeypot
    if (honeypot) {
      setSubmitError("Spam detected. Please try again.")
      return
    }

    console.log("Form data:", data) // Debug log
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      console.log("API response:", result) // Debug log

      if (!response.ok) {
        // Handle specific error types
        if (response.status === 400) {
          setSubmitError("Please check your input and try again.")
        } else if (response.status === 500) {
          setSubmitError("Server error. Please try again later.")
        } else {
          setSubmitError(result.error || "Failed to send message")
        }
        return
      }

      setSubmitSuccess(true)
      reset()
      // Clear success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000)
    } catch (error: any) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        setSubmitError("Network error. Please check your connection and try again.")
      } else {
        setSubmitError(error.message || "Failed to send message. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }
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
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-white/80">We're here to help you succeed</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Let's Talk
              </h1>
              <p className="text-xl text-blue-100 text-pretty mb-8 leading-relaxed max-w-3xl mx-auto">
                Ready to advance your security career? Our team is here to guide you through certification, answer your
                questions, and help you achieve global recognition.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">24h</div>
                  <div className="text-blue-200 text-sm">Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">120+</div>
                  <div className="text-blue-200 text-sm">Countries Served</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">98%</div>
                  <div className="text-blue-200 text-sm">Satisfaction Rate</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Contact Form & Info */}
        <section className="relative py-20 -mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Enhanced Contact Form */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary to-accent rounded-3xl blur-lg opacity-20"></div>
                <Card className="relative bg-card/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      Send us a Message
                    </CardTitle>
                    <CardDescription className="text-lg">
                      We typically respond within 2-4 hours during business days.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {submitSuccess && (
                      <Alert className="mb-6 border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          Thank you for your message! We'll get back to you within 2-4 hours.
                        </AlertDescription>
                      </Alert>
                    )}

                    {submitError && (
                      <Alert className="mb-6 border-red-200 bg-red-50">
                        <AlertDescription className="text-red-800">{submitError}</AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-sm font-semibold">
                            First Name *
                          </Label>
                          <Input
                            id="firstName"
                            {...register("firstName", {
                              required: "First name is required",
                              minLength: { value: 2, message: "Must be at least 2 characters" },
                            })}
                            placeholder="John"
                            className={`border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-xl h-12 ${errors.firstName ? "border-red-500" : ""}`}
                          />
                          {errors.firstName && <p className="text-sm text-red-600">{errors.firstName.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-sm font-semibold">
                            Last Name *
                          </Label>
                          <Input
                            id="lastName"
                            {...register("lastName", {
                              required: "Last name is required",
                              minLength: { value: 2, message: "Must be at least 2 characters" },
                            })}
                            placeholder="Doe"
                            className={`border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-xl h-12 ${errors.lastName ? "border-red-500" : ""}`}
                          />
                          {errors.lastName && <p className="text-sm text-red-600">{errors.lastName.message}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          {...register("email", {
                            required: "Email is required",
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: "Enter a valid email address",
                            },
                          })}
                          placeholder="john@example.com"
                          className={`border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-xl h-12 ${errors.email ? "border-red-500" : ""}`}
                        />
                        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-sm font-semibold">
                          Subject *
                        </Label>
                        <Input
                          id="subject"
                          {...register("subject", {
                            required: "Subject is required",
                            minLength: { value: 5, message: "Subject must be at least 5 characters" },
                          })}
                          placeholder="How can we help you?"
                          className={`border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-xl h-12 ${errors.subject ? "border-red-500" : ""}`}
                        />
                        {errors.subject && <p className="text-sm text-red-600">{errors.subject.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-sm font-semibold">
                          Message *
                        </Label>
                        <Textarea
                          id="message"
                          {...register("message", {
                            required: "Message is required",
                            minLength: { value: 5, message: "Message must be at least 5 characters" },
                            maxLength: { value: 1000, message: "Message must be less than 1000 characters" },
                          })}
                          placeholder="Tell us more about your inquiry, certification goals, or how we can assist you..."
                          rows={5}
                          className={`border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-xl min-h-32 ${errors.message ? "border-red-500" : ""}`}
                          aria-describedby={errors.message ? "message-error" : undefined}
                        />
                        {errors.message && (
                          <p id="message-error" className="text-sm text-red-600" role="alert">
                            {errors.message.message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">Minimum 10 characters, maximum 1000 characters</p>
                      </div>

                      {/* Honeypot field for spam prevention */}
                      <input
                        type="text"
                        name="website"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                        style={{ display: "none" }}
                        tabIndex={-1}
                        autoComplete="off"
                      />

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Contact Information */}
              <div className="flex items-start">
                {/* Contact Methods */}
                <Card className="bg-gradient-to-br from-card to-muted border-0 shadow-2xl rounded-2xl overflow-hidden w-full">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg lg:text-base text-foreground flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Get in Touch
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-xs lg:text-xs">
                      Multiple ways to reach our expert support team
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-200">
                      <div className="bg-primary/20 p-2 rounded-lg flex-shrink-0">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm mb-1 text-foreground">Business Email</h3>
                        <p className="text-muted-foreground text-xs">info@cityspy.com.ke</p>
                        <p className="text-xs text-muted-foreground/80 mt-1">Typically responds within 2 hours</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-200">
                      <div className="bg-accent/20 p-2 rounded-lg flex-shrink-0">
                        <Phone className="h-4 w-4 text-accent" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm mb-1 text-foreground">Phone Support</h3>
                        <p className="text-muted-foreground text-xs">GSPA Global: +(202) 773-8943</p>
                        <p className="text-muted-foreground text-xs">GSPA Africa: +254715137492</p>
                        <p className="text-xs text-muted-foreground/80 mt-1">Mon-Fri: 9AM-6PM EST</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-200">
                      <div className="bg-secondary/20 p-2 rounded-lg flex-shrink-0">
                        <MapPin className="h-4 w-4 text-secondary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm mb-1 text-foreground">Global Headquarters</h3>
                        <p className="text-muted-foreground text-xs leading-tight">
                          123 Security Boulevard
                          <br />
                          Professional District
                          <br />
                          New York, NY 10001
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-200">
                      <div className="bg-primary/20 p-2 rounded-lg flex-shrink-0">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm mb-1 text-foreground">Business Hours</h3>
                        <p className="text-muted-foreground text-xs leading-tight">
                          Mon-Fri: 9AM-6PM EST
                          <br />
                          Sat: 10AM-4PM EST
                          <br />
                          Sun: Closed
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Connect with Us & FAQ Side by Side - Full Width */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
              {/* Social Media */}
              <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Connect With Us
                  </CardTitle>
                  <CardDescription>Follow for updates and security insights</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        icon: Facebook,
                        label: "Facebook",
                        color: "text-primary",
                        bg: "bg-primary/10",
                      },
                      {
                        icon: Twitter,
                        label: "Twitter",
                        color: "text-accent",
                        bg: "bg-accent/10",
                      },
                      {
                        icon: Linkedin,
                        label: "LinkedIn",
                        color: "text-primary",
                        bg: "bg-primary/10",
                      },
                      {
                        icon: Youtube,
                        label: "YouTube",
                        color: "text-secondary",
                        bg: "bg-secondary/10",
                      },
                    ].map((social, index) => (
                      <a
                        key={index}
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl border hover:shadow-md transition-all duration-200 hover:scale-105 group"
                      >
                        <div className={`p-2 rounded-lg ${social.bg} group-hover:scale-110 transition-transform`}>
                          <social.icon className={`h-4 w-4 ${social.color}`} />
                        </div>
                        <span className="font-medium text-sm">{social.label}</span>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Preview */}
              <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-accent/10 to-secondary/10">
                  <CardTitle>Quick Answers</CardTitle>
                  <CardDescription>Frequently asked questions</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {[
                      {
                        question: "How long does certification take?",
                        answer: "Typically 2-4 weeks with our accelerated process.",
                      },
                      {
                        question: "What is the pass rate?",
                        answer: "78% success rate with comprehensive materials.",
                      },
                      {
                        question: "Global recognition?",
                        answer: "Recognized in 120+ countries worldwide.",
                      },
                    ].map((faq, index) => (
                      <div key={index} className="group cursor-pointer">
                        <h4 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                          {faq.question}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                  <Button variant="link" className="p-0 h-auto text-primary mt-3 text-sm">
                    View all FAQs →
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Additional CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary to-accent">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Ready to Start Your Certification Journey?
            </h2>
            <p className="text-primary-foreground/90 text-lg mb-8">
              Join thousands of security professionals who have advanced their careers with GSPA certification.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-background text-foreground hover:bg-muted font-semibold rounded-xl px-8">
                Explore Certifications
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 rounded-xl px-8 bg-transparent"
              >
                Schedule a Call
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
