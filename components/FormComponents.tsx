"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Eye, EyeOff, Info } from "lucide-react"
import { cn } from "@/lib/utils"

// Enhanced Input Component with better accessibility
export const EnhancedInput = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input> & {
  label: string
  error?: string
  required?: boolean
  tooltip?: string
  helperText?: string
}>(({ label, error, required, tooltip, helperText, className, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const inputType = props.type === 'password' && showPassword ? 'text' : props.type

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={props.id} className={error ? "text-red-600" : ""}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {tooltip && (
          <div className="group relative">
            <Info className="h-4 w-4 text-gray-400 cursor-help" />
            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              {tooltip}
              <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        )}
      </div>
      
      <div className="relative">
        <Input
          ref={ref}
          type={inputType}
          className={cn(
            error && "border-red-500 focus:ring-red-500",
            props.type === 'password' && "pr-10",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
          {...props}
        />
        
        {props.type === 'password' && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        )}
      </div>
      
      {error && (
        <p id={`${props.id}-error`} className="text-sm text-red-600 flex items-center gap-1">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p id={`${props.id}-helper`} className="text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  )
})
EnhancedInput.displayName = 'EnhancedInput'

// Date Picker Component
export const DatePicker = ({ 
  value, 
  onChange, 
  label, 
  error, 
  required,
  placeholder = "Pick a date",
  fromDate,
  toDate
}: {
  value?: Date
  onChange: (date: Date | undefined) => void
  label: string
  error?: string
  required?: boolean
  placeholder?: string
  fromDate?: Date
  toDate?: Date
}) => {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-2">
      <Label className={error ? "text-red-600" : ""}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
              error && "border-red-500"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date: Date | undefined) => {
              onChange(date)
              setOpen(false)
            }}
            fromDate={fromDate}
            toDate={toDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

// Phone Input with formatting
export const PhoneInput = ({ 
  value, 
  onChange, 
  label, 
  error, 
  required,
  placeholder = "+1 (555) 123-4567"
}: {
  value: string
  onChange: (value: string) => void
  label: string
  error?: string
  required?: boolean
  placeholder?: string
}) => {
  const formatPhoneNumber = (input: string) => {
    // Remove all non-digits
    const digits = input.replace(/\D/g, '')
    
    // Handle international format
    if (digits.length > 0) {
      if (digits.startsWith('1') && digits.length <= 11) {
        // US format
        const area = digits.slice(1, 4)
        const prefix = digits.slice(4, 7)
        const line = digits.slice(7, 11)
        
        if (digits.length > 7) {
          return `+1 (${area}) ${prefix}-${line}`
        } else if (digits.length > 4) {
          return `+1 (${area}) ${prefix}`
        } else if (digits.length > 1) {
          return `+1 (${area}`
        } else {
          return '+1'
        }
      } else {
        // International format
        return `+${digits}`
      }
    }
    return ''
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    onChange(formatted)
  }

  return (
    <EnhancedInput
      label={label}
      value={value}
      onChange={handleChange}
      error={error}
      required={required}
      placeholder={placeholder}
      maxLength={20}
    />
  )
}

// Form Section Component
export const FormSection = ({ 
  title, 
  description, 
  children 
}: {
  title: string
  description?: string
  children: React.ReactNode
}) => (
  <div className="space-y-4">
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-600">{description}</p>}
    </div>
    {children}
  </div>
)

// Loading State Component
export const FormLoading = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center p-8">
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      <span className="text-gray-600">{message}</span>
    </div>
  </div>
)

// Error State Component
export const FormError = ({ 
  message, 
  onRetry,
  className = "" 
}: {
  message: string
  onRetry?: () => void
  className?: string
}) => (
  <div className={cn("flex items-center justify-center p-8", className)}>
    <div className="text-center space-y-3">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-gray-700 font-medium">Something went wrong</p>
      <p className="text-sm text-gray-600">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          Try Again
        </Button>
      )}
    </div>
  </div>
)

// Success State Component
export const FormSuccess = ({ 
  message, 
  onContinue,
  className = "" 
}: {
  message: string
  onContinue?: () => void
  className?: string
}) => (
  <div className={cn("flex items-center justify-center p-8", className)}>
    <div className="text-center space-y-3">
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="text-gray-700 font-medium">Success!</p>
      <p className="text-sm text-gray-600">{message}</p>
      {onContinue && (
        <Button onClick={onContinue} size="sm">
          Continue
        </Button>
      )}
    </div>
  </div>
)
