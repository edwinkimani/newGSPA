"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import ExamPopup from "./exam-popup"
import { fetchJson } from '@/lib/api/client'

interface ExamPopupWrapperProps {
  children: React.ReactNode
}

export default function ExamPopupWrapper({ children }: ExamPopupWrapperProps) {
  const [showPopup, setShowPopup] = useState(false)
  const [isRegisteredUser, setIsRegisteredUser] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const pathname = usePathname()
  useEffect(() => {
    const checkUserAndShowPopup = async () => {
      try {
        const res = await fetch('/api/auth/user')
        if (res.status === 401) {
          if (pathname === "/" && !localStorage.getItem("exam-popup-seen")) {
            setTimeout(() => setShowPopup(true), 3000)
          }
          return
        }
        const data = await res.json()
        const profile = data.profile
        setUser(data)
        if (profile && profile.membership_fee_paid && !profile.test_completed) {
          setIsRegisteredUser(true)
          setShowPopup(true)
        }
      } catch (err) {
        console.error('Error checking user for exam popup', err)
      }
    }

    checkUserAndShowPopup()
  }, [pathname])

  const handleClosePopup = () => {
    setShowPopup(false)
  }

  return (
    <>
      {children}
      <ExamPopup
        isOpen={showPopup}
        onClose={handleClosePopup}
        isRegisteredUser={isRegisteredUser}
      />
    </>
  )
}
