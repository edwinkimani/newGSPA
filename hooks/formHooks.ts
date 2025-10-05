"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useForm, UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { debounceValidation } from '@/lib/validationUtils'

// Auto-save hook
export const useAutoSave = <T extends Record<string, any>>(
  form: UseFormReturn<T>,
  options?: {
    interval?: number
    storageKey?: string
    onSave?: (data: T) => void
    onLoad?: (data: T) => void
    maxAge?: number // in hours
  }
) => {
  const {
    interval = 30000,
    storageKey = 'form_auto_save',
    onSave,
    onLoad,
    maxAge = 24
  } = options || {}

  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const autoSaveInterval = useRef<NodeJS.Timeout>()

  const saveFormData = useCallback(async () => {
    const values = form.getValues()
    const isValid = form.formState.isValid
    const isDirty = form.formState.isDirty

    if (isDirty && isValid) {
      setIsAutoSaving(true)
      
      try {
        const saveData = {
          data: values,
          timestamp: new Date().toISOString(),
          isValid
        }

        localStorage.setItem(storageKey, JSON.stringify(saveData))
        setLastSaved(new Date())
        onSave?.(values)
      } catch (error) {
        console.error('Auto-save failed:', error)
      } finally {
        setTimeout(() => setIsAutoSaving(false), 1000)
      }
    }
  }, [form, storageKey, onSave])

  const loadSavedData = useCallback(() => {
    try {
      const savedData = localStorage.getItem(storageKey)
      if (savedData) {
        const { data, timestamp } = JSON.parse(savedData)
        const savedDate = new Date(timestamp)
        const now = new Date()
        const hoursDiff = (now.getTime() - savedDate.getTime()) / (1000 * 60 * 60)

        if (hoursDiff < maxAge) {
          // Restore form data
          Object.keys(data).forEach(key => {
            form.setValue(key as any, data[key])
          })
          
          setLastSaved(savedDate)
          onLoad?.(data)
          return true
        } else {
          // Clear expired data
          localStorage.removeItem(storageKey)
        }
      }
    } catch (error) {
      console.error('Failed to load saved data:', error)
    }
    return false
  }, [form, storageKey, maxAge, onLoad])

  const clearSavedData = useCallback(() => {
    localStorage.removeItem(storageKey)
    setLastSaved(null)
  }, [storageKey])

  useEffect(() => {
    // Load saved data on mount
    loadSavedData()

    // Set up auto-save interval
    autoSaveInterval.current = setInterval(saveFormData, interval)

    return () => {
      if (autoSaveInterval.current) {
        clearInterval(autoSaveInterval.current)
      }
    }
  }, [saveFormData, loadSavedData, interval])

  return {
    isAutoSaving,
    lastSaved,
    saveFormData,
    loadSavedData,
    clearSavedData
  }
}

// Form step management hook
export const useFormSteps = <T extends Record<string, any>>(
  totalSteps: number,
  form: UseFormReturn<T>,
  stepFields: Record<number, (keyof T)[]>
) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isTransitioning, setIsTransitioning] = useState(false)

  const goToStep = useCallback(async (step: number) => {
    if (step < 1 || step > totalSteps) return false

    setIsTransitioning(true)

    try {
      // Validate current step before moving
      if (step > currentStep) {
        const fieldsToValidate = stepFields[currentStep] || []
        const isValid = await form.trigger(fieldsToValidate as any)
        
        if (!isValid) {
          setIsTransitioning(false)
          return false
        }

        // Mark current step as completed
        setCompletedSteps(prev => [...prev, currentStep])
      }

      setCurrentStep(step)
      
      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
      
      return true
    } catch (error) {
      console.error('Step navigation failed:', error)
      return false
    } finally {
      setTimeout(() => setIsTransitioning(false), 300)
    }
  }, [currentStep, totalSteps, form, stepFields])

  const nextStep = useCallback(async () => {
    return goToStep(currentStep + 1)
  }, [goToStep, currentStep])

  const prevStep = useCallback(() => {
    return goToStep(currentStep - 1)
  }, [goToStep, currentStep])

  const isStepCompleted = useCallback((step: number) => {
    return completedSteps.includes(step)
  }, [completedSteps])

  const canProceedToStep = useCallback((step: number) => {
    // Can always go to previous steps
    if (step < currentStep) return true
    
    // Can go to next step only if current step is completed
    if (step === currentStep + 1) return isStepCompleted(currentStep)
    
    // Can go to any step that has been completed
    return isStepCompleted(step - 1)
  }, [currentStep, isStepCompleted])

  return {
    currentStep,
    totalSteps,
    completedSteps,
    isTransitioning,
    goToStep,
    nextStep,
    prevStep,
    isStepCompleted,
    canProceedToStep
  }
}

// File upload hook with validation
export const useFileUpload = (options?: {
  maxSize?: number
  allowedTypes?: string[]
  onUpload?: (file: File) => void
  onError?: (error: string) => void
}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'],
    onUpload,
    onError
  } = options || {}

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string>("")

  const validateFile = useCallback((file: File): boolean => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      const errorMsg = "Invalid file type"
      setError(errorMsg)
      onError?.(errorMsg)
      return false
    }

    // Check file size
    if (file.size > maxSize) {
      const errorMsg = `File size must be less than ${maxSize / (1024 * 1024)}MB`
      setError(errorMsg)
      onError?.(errorMsg)
      return false
    }

    return true
  }, [allowedTypes, maxSize, onError])

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setError("")
    setIsUploading(true)

    try {
      if (!validateFile(selectedFile)) {
        return
      }

      setFile(selectedFile)

      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreview(e.target?.result as string)
        }
        reader.readAsDataURL(selectedFile)
      }

      onUpload?.(selectedFile)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "File upload failed"
      setError(errorMsg)
      onError?.(errorMsg)
    } finally {
      setIsUploading(false)
    }
  }, [validateFile, onUpload, onError])

  const clearFile = useCallback(() => {
    setFile(null)
    setPreview("")
    setError("")
  }, [])

  return {
    file,
    preview,
    isUploading,
    error,
    handleFileSelect,
    clearFile
  }
}

// Real-time validation hook
export const useRealTimeValidation = <T extends Record<string, any>>(
  form: UseFormReturn<T>,
  fieldName: keyof T,
  validationFn: (value: any) => Promise<boolean> | boolean,
  debounceMs = 500
) => {
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState<string>("")

  const debouncedValidation = useCallback(
    debounceValidation(async (value: any) => {
      setIsValidating(true)
      setValidationError("")

      try {
        const isValid = await validationFn(value)
        
        if (!isValid) {
          const errorMessage = `This ${String(fieldName)} is not available`
          setValidationError(errorMessage)
          form.setError(fieldName as any, {
            type: "manual",
            message: errorMessage
          })
        } else {
          form.clearErrors(fieldName as any)
        }
      } catch (error) {
        console.error('Validation error:', error)
      } finally {
        setIsValidating(false)
      }
    }, debounceMs),
    [form, fieldName, validationFn, debounceMs]
  )

  const validateField = useCallback(async (value: any) => {
    await debouncedValidation(value)
  }, [debouncedValidation])

  return {
    isValidating,
    validationError,
    validateField
  }
}

// Form submission hook with error handling
export const useFormSubmission = <T extends Record<string, any>>(
  onSubmit: (data: T) => Promise<void>,
  options?: {
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
    successMessage?: string
    errorMessage?: string
  }
) => {
  const {
    onSuccess,
    onError,
    successMessage = "Form submitted successfully",
    errorMessage = "Form submission failed"
  } = options || {}

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string>("")
  const [submitSuccess, setSubmitSuccess] = useState<string>("")

  const handleSubmit = useCallback(async (data: T) => {
    setIsSubmitting(true)
    setSubmitError("")
    setSubmitSuccess("")

    try {
      await onSubmit(data)
      
      setSubmitSuccess(successMessage)
      onSuccess?.(data)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : errorMessage
      setSubmitError(errorMsg)
      onError?.(error as Error)
    } finally {
      setIsSubmitting(false)
    }
  }, [onSubmit, onSuccess, onError, successMessage, errorMessage])

  return {
    isSubmitting,
    submitError,
    submitSuccess,
    handleSubmit
  }
}

// Keyboard navigation hook
export const useKeyboardNavigation = () => {
  const [focusedElement, setFocusedElement] = useState<Element | null>(null)

  useEffect(() => {
    const handleFocus = (event: FocusEvent) => {
      setFocusedElement(event.target as Element)
    }

    const handleBlur = () => {
      setFocusedElement(null)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Enter key for form submission
      if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
        const form = event.target.closest('form')
        if (form) {
          const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement
          if (submitButton && !submitButton.disabled) {
            submitButton.click()
          }
        }
      }

      // Handle Escape key to clear focused element
      if (event.key === 'Escape') {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur()
        }
      }
    }

    document.addEventListener('focus', handleFocus, true)
    document.addEventListener('blur', handleBlur, true)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('focus', handleFocus, true)
      document.removeEventListener('blur', handleBlur, true)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return { focusedElement }
}

// Accessibility announcement hook
export const useAccessibilityAnnouncements = () => {
  const announcementRef = useRef<HTMLDivElement>(null)

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcementRef.current) return

    // Create or update aria-live region
    announcementRef.current.setAttribute('aria-live', priority)
    announcementRef.current.textContent = message

    // Clear announcement after delay
    setTimeout(() => {
      if (announcementRef.current) {
        announcementRef.current.textContent = ''
      }
    }, 1000)
  }, [])

  const announceError = useCallback((message: string) => {
    announce(`Error: ${message}`, 'assertive')
  }, [announce])

  const announceSuccess = useCallback((message: string) => {
    announce(`Success: ${message}`, 'polite')
  }, [announce])

  return {
    announcementRef,
    announce,
    announceError,
    announceSuccess
  }
}
