"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Award, Users, BookOpen, Shield, X } from "lucide-react"
import { fetchJson } from '@/lib/api/client'

export function UserAdvertisement() {
  const [isVisible, setIsVisible] = useState(false)
  const [shouldShow, setShouldShow] = useState(false)
  const [userStatus, setUserStatus] = useState<{
    isAuthenticated: boolean
    hasCompletedTest: boolean
    hasPaid: boolean
  }>({ isAuthenticated: false, hasCompletedTest: false, hasPaid: false })
  useEffect(() => {
    const checkUserStatus = async () => {
      const hasSeenAd = localStorage.getItem("user-ad-seen")

      // If user has already seen the ad, don't show it
      if (hasSeenAd) {
        setShouldShow(false)
        return
      }

      try {
        const res = await fetch('/api/auth/user')
        if (res.status === 401) {
          setUserStatus({ isAuthenticated: false, hasCompletedTest: false, hasPaid: false })
          setShouldShow(true)
          return
        }
        const data = await res.json()
        const profile = data.profile

        if (profile) {
          const status = {
            isAuthenticated: true,
            hasCompletedTest: profile.test_completed || false,
            hasPaid: profile.payment_status === 'COMPLETED' || profile.payment_status === 'completed'
          }
          setUserStatus(status)

          if (status.hasPaid) {
            setShouldShow(false)
            return
          }

          setShouldShow(true)
        } else {
          setUserStatus({ isAuthenticated: true, hasCompletedTest: false, hasPaid: false })
          setShouldShow(true)
        }
      } catch (error) {
        console.error("Error checking user status:", error)
        setUserStatus({ isAuthenticated: false, hasCompletedTest: false, hasPaid: false })
        setShouldShow(true)
      }
    }

    checkUserStatus()
  }, [])

  useEffect(() => {
    if (shouldShow) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [shouldShow])

  const dismissAd = () => {
    localStorage.setItem("user-ad-seen", "true")
    setIsVisible(false)
  }

  return (
    <Dialog open={isVisible} onOpenChange={setIsVisible}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-10 shadow-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">Welcome to GSPA Certification</DialogTitle>
                <DialogDescription className="text-base text-muted-foreground">
                  Global Security Practitioners Alliance – Your Path to Professional Excellence
                </DialogDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={dismissAd} className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <img
                src="/Global-Security-Practitioners-Alliance.png"
                alt="GSPA Logo"
                className="h-16 w-auto"
              />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary max-w-3xl mx-auto break-words leading-snug">
              {userStatus.hasCompletedTest ? (
                <>Ready for Your Next Challenge? <br className="hidden sm:block" />
                Retake the Security Aptitude Exam</>
              ) : (
                <>Get Accredited Globally <br className="hidden sm:block" />
                Take the Security Aptitude Exam</>
              )}
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              {userStatus.hasCompletedTest ? (
                "You've completed the test! Ready to improve your score? Retake the exam with a new set of questions."
              ) : (
                "Join thousands of professionals worldwide who have earned their GSPA certification. Start your journey today!"
              )}
            </p>
          </div>

          {/* Key Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {[
              { icon: Award, title: "Professional Certification", desc: "Globally recognized" },
              { icon: Users, title: "Industry Recognition", desc: "Elite community" },
              { icon: BookOpen, title: "Comprehensive Training", desc: "30-question test" },
              { icon: Shield, title: "Career Advancement", desc: "Better opportunities" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-5 bg-muted/30 rounded-xl hover:bg-muted/50 transition">
                <item.icon className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-base">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-xl text-center space-y-4 shadow-md">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {userStatus.isAuthenticated ? (
                userStatus.hasCompletedTest ? (
                  <Button asChild className="bg-primary hover:bg-primary/90 text-base px-6 py-3 rounded-xl shadow-md">
                    <a href="/dashboard/results">Pay for Retake (KES 4,550)</a>
                  </Button>
                ) : (
                  <Button asChild className="bg-primary hover:bg-primary/90 text-base px-6 py-3 rounded-xl shadow-md">
                    <a href="/dashboard/test">Take Exam Now</a>
                  </Button>
                )
              ) : (
                <Button asChild className="bg-primary hover:bg-primary/90 text-base px-6 py-3 rounded-xl shadow-md">
                  <a href="/register">Register to Take Exam Today</a>
                </Button>
              )}
              <Button variant="outline" onClick={dismissAd} className="text-base px-6 py-3 rounded-xl">
                Maybe Some Other Time
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {userStatus.hasCompletedTest
                ? "Improve your score • New questions • Professional certification"
                : "Professional certification • Global recognition • Career advancement"
              }
            </p>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Start your journey today! Join the global community of certified security professionals.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
