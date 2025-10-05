"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Award, X, Star, Shield, Globe, Rocket } from "lucide-react"
import { useRouter } from "next/navigation"
import { fetchJson } from '@/lib/api/client'

interface ExamPopupProps {
  isOpen: boolean
  onClose: () => void
  isRegisteredUser?: boolean
}

export default function ExamPopup({ isOpen, onClose, isRegisteredUser = false }: ExamPopupProps) {
  const [user, setUser] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()
  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch('/api/auth/user')
        if (!res.ok) return
        const data = await res.json()
        setUser(data.profile || null)
      } catch {}
    }
    getUser()
  }, [])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 100)
    } else {
      setIsVisible(false)
    }
  }, [isOpen])

  const handleTakeExam = () => {
    if (isRegisteredUser && user) {
      router.push("/dashboard/test")
    } else {
      router.push("/register")
    }
    onClose()
  }

  const handleMaybeLater = () => {
    if (!isRegisteredUser) {
      localStorage.setItem("exam-popup-seen", "true")
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-2xl border-0 bg-transparent shadow-none overflow-visible mx-2">
        <div className={`
          relative bg-gradient-to-br from-background via-muted/50 to-background
          dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-800
          rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-2xl border border-border/50
          transform transition-all duration-500 ease-out max-h-[90vh] overflow-y-auto
          ${isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-10'}
        `}>

          {/* Company Logo */}
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 md:top-6 md:left-6 z-20">
            <div className="bg-background/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-1 sm:p-2 md:p-3 border border-border/50 shadow-lg">
              <img
                src="/Global-Security-Practitioners-Alliance.png"
                alt="GSPA Logo"
                className="h-5 sm:h-6 md:h-8 lg:h-10 w-auto"
              />
            </div>
          </div>

          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl md:rounded-3xl">
            <div className="absolute -top-16 -right-16 sm:-top-20 sm:-right-20 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-2xl sm:blur-3xl"></div>
            <div className="absolute -bottom-16 -left-16 sm:-bottom-20 sm:-left-20 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-r from-accent/10 to-secondary/10 rounded-full blur-2xl sm:blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-32 bg-gradient-to-r from-transparent via-primary/5 to-transparent"></div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center relative z-10">
            {/* Left side - Visual content */}
            <div className="text-center md:text-left order-2 md:order-1">
              <DialogHeader className="pb-4 sm:pb-6">
                {/* Animated icon */}
                <div className="flex justify-center md:justify-start mb-4 sm:mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl sm:rounded-2xl blur-lg opacity-75 animate-pulse"></div>
                    <div className="relative bg-background dark:bg-slate-800 border border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-2xl">
                      <Award className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text" />
                    </div>
                    {/* Floating stars */}
                    <Star className="absolute -top-2 -right-2 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-yellow-400" />
                    <Star className="absolute -bottom-2 -left-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-yellow-300" />
                  </div>
                </div>

                <DialogTitle className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent leading-tight">
                  Unlock Your Global Potential
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mt-2 sm:mt-4 font-light">
                  Take the Security Aptitude Exam & Get Certified
                </DialogDescription>
              </DialogHeader>

              {/* Benefits list */}
              <div className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
                <div className="flex items-center gap-2 sm:gap-3 text-foreground">
                  <div className="bg-primary/20 p-1.5 sm:p-2 rounded-lg">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <span className="font-medium text-sm sm:text-base">Professional Accreditation</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-foreground">
                  <div className="bg-accent/20 p-1.5 sm:p-2 rounded-lg">
                    <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                  </div>
                  <span className="font-medium text-sm sm:text-base">Global Recognition</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-foreground">
                  <div className="bg-secondary/20 p-1.5 sm:p-2 rounded-lg">
                    <Rocket className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                  </div>
                  <span className="font-medium text-sm sm:text-base">Career Advancement</span>
                </div>
              </div>
            </div>

            {/* Right side - Content and actions */}
            <div className="space-y-4 sm:space-y-6 order-1 md:order-2">
              {/* Description */}
              <div className="text-center md:text-left">
                <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm md:text-base lg:text-lg font-light">
                  {isRegisteredUser
                    ? "Complete your certification journey and join elite security professionals worldwide. Demonstrate your expertise and advance your career."
                    : "Join thousands of certified professionals across 150+ countries. Start your journey to becoming a globally recognized security expert today!"
                  }
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg sm:rounded-xl backdrop-blur-sm border border-border/50">
                <div className="text-center">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-primary">10K+</div>
                  <div className="text-xs text-muted-foreground mt-1">Certified</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-accent">150+</div>
                  <div className="text-xs text-muted-foreground mt-1">Countries</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-secondary">98%</div>
                  <div className="text-xs text-muted-foreground mt-1">Success Rate</div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3 sm:space-y-4 pt-1 sm:pt-2">
                <Button
                  onClick={handleTakeExam}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90
                           text-primary-foreground font-bold py-3 sm:py-4 rounded-lg sm:rounded-xl shadow-2xl hover:shadow-3xl
                           transition-all duration-300 hover:scale-105 group relative overflow-hidden text-sm sm:text-base md:text-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-2 sm:mr-3 relative z-10" />
                  <span className="relative z-10">
                    {isRegisteredUser ? "Take Exam Now" : "Start Your Journey Today"}
                  </span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleMaybeLater}
                  className="w-full bg-background/50 hover:bg-muted text-foreground border-border
                           hover:border-primary/50 font-medium py-3 sm:py-4 rounded-lg sm:rounded-xl transition-all duration-300
                           hover:scale-105 backdrop-blur-sm text-sm sm:text-base md:text-lg"
                >
                  Maybe Later
                </Button>
              </div>

              {/* Trust indicator */}
              <div className="text-center pt-1 sm:pt-2">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Trusted by professionals worldwide
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
