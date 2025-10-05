"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, User, Lock, CheckCircle } from "lucide-react"

export function AdminSetupNotice() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show notice for first-time setup
    const hasSeenNotice = localStorage.getItem("admin-setup-notice-seen")
    if (!hasSeenNotice) {
      setIsVisible(true)
    }
  }, [])

  const dismissNotice = () => {
    localStorage.setItem("admin-setup-notice-seen", "true")
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Account Setup</CardTitle>
          <CardDescription>Your default administrator account is ready</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              The system has been configured with a default admin account for managing questions, users, and reports.
            </AlertDescription>
          </Alert>

          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Email:</span>
              <code className="text-sm bg-background px-2 py-1 rounded">admin@gmail.com</code>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Password:</span>
              <code className="text-sm bg-background px-2 py-1 rounded">@Admin123</code>
            </div>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Important:</strong> Please change the default password after your first login for security.
            </p>
            <p>The admin dashboard provides access to:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Question management (100 default questions included)</li>
              <li>User profile monitoring</li>
              <li>Payment and certification reports</li>
            </ul>
          </div>

          <Button onClick={dismissNotice} className="w-full">
            Got it, thanks!
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
