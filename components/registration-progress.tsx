"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface RegistrationProgressProps {
  currentStep: number
  totalSteps: number
  stepTitles: string[]
}

export function RegistrationProgress({ currentStep, totalSteps, stepTitles }: RegistrationProgressProps) {
  return (
    <div className="w-full bg-gradient-to-br from-muted via-background to-muted py-3 md:py-8 shadow-lg border-b">
      <div className="max-w-4xl mx-auto px-4">
        {/* Flex row for all steps */}
        <div className="flex items-center justify-between relative">
          {/* Background progress line */}
          <div
            className="absolute top-6 left-10 right-10 h-0.5 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 rounded-full"
            style={{
              width: `calc(100% - 80px)`,
              left: "40px",
              right: "40px",
            }}
          />

          {/* Progress fill */}
          <div
            className="absolute top-6 h-0.5 bg-gradient-to-r from-primary via-accent to-primary rounded-full transition-all duration-700 ease-out shadow-sm"
            style={{
              width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
              left: "40px",
              maxWidth: "calc(100% - 80px)",
            }}
          />

          {/* Steps */}
          {stepTitles.map((title, index) => {
            const stepNumber = index + 1
            const isCompleted = stepNumber < currentStep
            const isCurrent = stepNumber === currentStep

            return (
              <div key={stepNumber} className="flex flex-col items-center z-10">
                {/* Step circle */}
                <div
                  className={cn(
                    "relative w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-base md:text-lg font-semibold border-4 transition-all duration-500 shadow-lg",
                    "group cursor-pointer hover:scale-105 hover:shadow-xl",
                    isCompleted
                      ? "bg-gradient-to-br from-green-500 to-green-600 text-white border-green-500 shadow-green-200/50"
                      : isCurrent
                      ? "bg-gradient-to-br from-primary to-primary/90 text-white border-primary shadow-primary/30 scale-110 ring-4 ring-primary/20"
                      : "bg-card text-muted-foreground border-border shadow-border/50"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 md:w-6 md:h-6" />
                  ) : (
                    stepNumber
                  )}

                  {/* Pulse animation for current step */}
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping scale-125" />
                  )}

                  {/* Tooltip */}
                  <div className="absolute -bottom-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded-md whitespace-nowrap">
                      Step {stepNumber}: {title}
                    </div>
                  </div>
                </div>

                {/* Step title */}
                <span
                  className={cn(
                    "mt-3 md:mt-4 text-sm md:text-base font-medium text-center w-24 md:w-28 leading-tight transition-all duration-300",
                    isCurrent
                      ? "text-primary font-semibold scale-105"
                      : isCompleted
                      ? "text-green-600 font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  {title}
                </span>

                {/* Step status */}
                <span
                  className={cn(
                    "text-xs mt-1 font-medium transition-all duration-300",
                    isCurrent ? "text-primary opacity-100" : "opacity-0"
                  )}
                >
                  Current
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
