import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HelpCircle, BookOpen, Users, Award } from "lucide-react"

export default function FAQPage() {
  const faqs = [
    {
      category: "Certification Process",
      icon: Award,
      questions: [
        {
          question: "How do I get started with GSPA certification?",
          answer: "Begin by registering on our website and paying the $70 membership fee. Once registered, you'll have access to our modules and can schedule your exam within 3 months."
        },
        {
          question: "What is the cost of certification?",
          answer: "The membership fee is $70, which includes access to all training materials, exam scheduling, and certificate issuance upon passing."
        },
        {
          question: "How long does the certification process take?",
          answer: "The entire process typically takes 2-4 weeks from registration to certificate issuance, depending on your study pace and exam scheduling."
        },
        {
          question: "What is the exam format?",
          answer: "Exams are timed (90 minutes), consist of randomized questions from our question bank, and are auto-evaluated with instant results."
        }
      ]
    },
    {
      category: "Training & Modules",
      icon: BookOpen,
      questions: [
        {
          question: "What fields of security are covered?",
          answer: "We cover Cybersecurity, Network Security, and Digital Forensics, organized into Schools with multiple Modules for comprehensive learning."
        },
        {
          question: "How are modules structured?",
          answer: "Modules are grouped under Schools (e.g., School of Cybersecurity includes Network Security Basics, Cloud Security). Each module includes training materials, videos, and practice questions."
        },
        {
          question: "Can I access materials after certification?",
          answer: "Yes, certified practitioners maintain access to materials for continuing education and can retake exams if needed."
        },
        {
          question: "Are there prerequisites for modules?",
          answer: "Most modules have no prerequisites, but some advanced topics may recommend prior knowledge. Our system tracks your progress."
        }
      ]
    },
    {
      category: "Membership & Benefits",
      icon: Users,
      questions: [
        {
          question: "What benefits do I get as a member?",
          answer: "Members receive access to training materials, exam scheduling, certificates with QR verification, progress tracking, and notifications."
        },
        {
          question: "How long is my membership valid?",
          answer: "Membership is valid for one year from the date of certification. You can renew annually to maintain access and certification status."
        },
        {
          question: "Can I transfer my membership?",
          answer: "Memberships are non-transferable but you can update your profile information. Certificates remain valid indefinitely."
        },
        {
          question: "What support is available for members?",
          answer: "We provide email support, FAQ resources, and community forums. Premium support is available for enterprise clients."
        }
      ]
    },
    {
      category: "Technical Support",
      icon: HelpCircle,
      questions: [
        {
          question: "What browsers are supported?",
          answer: "Our platform works on all modern browsers including Chrome, Firefox, Safari, and Edge. Mobile devices are also supported."
        },
        {
          question: "How do I reset my password?",
          answer: "Use the 'Forgot Password' link on the login page. You'll receive an email with reset instructions."
        },
        {
          question: "What if I encounter technical issues during an exam?",
          answer: "Contact support immediately. We can pause your exam and reschedule if technical issues are verified."
        },
        {
          question: "How do I verify a certificate?",
          answer: "Certificates include QR codes linking to our verification system. You can also search our Certification Directory by name or certificate number."
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 lg:py-32 bg-gradient-to-br from-background via-background to-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl lg:text-6xl font-bold text-balance mb-6">Frequently Asked Questions</h1>
              <p className="text-xl text-muted-foreground text-pretty mb-8 leading-relaxed">
                Find answers to common questions about GSPA certification, training, and membership.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {faqs.map((category, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-4">
                      <category.icon className="h-8 w-8 text-primary" />
                      <CardTitle className="text-2xl">{category.category}</CardTitle>
                    </div>
                    <CardDescription>
                      Common questions about {category.category.toLowerCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, faqIndex) => (
                        <AccordionItem key={faqIndex} value={`item-${index}-${faqIndex}`}>
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-20 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">Still Have Questions?</h2>
            <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto mb-8">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/contact" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Contact Support
              </a>
              <a href="mailto:support@gspa.org" className="inline-flex items-center justify-center px-6 py-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                Email Us
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
