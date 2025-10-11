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
    <div className="w-full bg-gradient-to-br from-muted via-background to-muted py-3 sm:py-6 md:py-8 shadow-lg border-b">
      <div className="max-w-5xl mx-auto px-3 sm:px-4">
        {/* Mobile Vertical Layout for small screens */}
        <div className="sm:hidden">
          <div className="flex flex-col items-center space-y-4">
            {/* Current step display */}
            <div className="text-center mb-2">
              <div className="text-sm text-muted-foreground">Step {currentStep} of {totalSteps}</div>
              <div className="text-lg font-semibold text-primary">
                {stepTitles[currentStep - 1]}
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full max-w-xs bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`
                }}
              />
            </div>
            {/* Steps indicator */}
            <div className="flex items-center justify-center space-x-2">
              {stepTitles.map((_, index) => {
                const stepNumber = index + 1
                const isCompleted = stepNumber < currentStep
                const isCurrent = stepNumber === currentStep
                return (
                  <div
                    key={stepNumber}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all duration-300",
                      isCompleted
                        ? "bg-green-500"
                        : isCurrent
                        ? "bg-primary ring-2 ring-primary ring-offset-2"
                        : "bg-muted-foreground/30"
                    )}
                  />
                )
              })}
            </div>
          </div>
        </div>
        {/* Desktop/Tablet Horizontal Layout with scrollable overflow */}
        <div className="hidden sm:block">
          <div className="relative overflow-x-auto scrollbar-thin scrollbar-thumb-primary/40 scrollbar-track-transparent">
            <div className="flex items-center justify-between min-w-full gap-4 px-2 relative">
              {/* Background progress line */}
              <div
                className="absolute top-6 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 rounded-full pointer-events-none"
                style={{
                  width: '100%',
                  left: 0,
                  right: 0,
                }}
              />
              {/* Progress fill */}
              <div
                className="absolute top-6 h-0.5 bg-gradient-to-r from-primary via-accent to-primary rounded-full transition-all duration-700 ease-out shadow-sm pointer-events-none"
                style={{
                  width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
                  left: 0,
                  maxWidth: '100%',
                }}
              />
              {/* Steps */}
              {stepTitles.map((title, index) => {
                const stepNumber = index + 1
                const isCompleted = stepNumber < currentStep
                const isCurrent = stepNumber === currentStep
                return (
                  <div
                    key={stepNumber}
                    className="flex flex-col items-center z-10 flex-shrink-0 min-w-[120px] md:min-w-[140px] max-w-[180px] px-1"
                  >
                    {/* Step circle */}
                    <div
                      className={cn(
                        "relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-sm sm:text-base md:text-lg font-semibold border-3 sm:border-4 transition-all duration-500 shadow-lg",
                        "group cursor-pointer hover:scale-105 hover:shadow-xl",
                        isCompleted
                          ? "bg-gradient-to-br from-green-500 to-green-600 text-white border-green-500 shadow-green-200/50"
                          : isCurrent
                          ? "bg-gradient-to-br from-primary to-primary/90 text-white border-primary shadow-primary/30 scale-110 ring-3 sm:ring-4 ring-primary/20"
                          : "bg-card text-muted-foreground border-border shadow-border/50"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                      ) : (
                        stepNumber
                      )}
                      {/* Pulse animation for current step */}
                      {isCurrent && (
                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping scale-125" />
                      )}
                      {/* Tooltip */}
                      <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded-md whitespace-nowrap shadow-lg border">
                          Step {stepNumber}: {title}
                        </div>
                      </div>
                    </div>
                    {/* Step title */}
                    <span
                      className={cn(
                        "mt-2 sm:mt-3 text-xs sm:text-sm font-medium text-center w-full leading-tight transition-all duration-300 px-1 truncate",
                        isCurrent
                          ? "text-primary font-semibold scale-105"
                          : isCompleted
                          ? "text-green-600 font-medium"
                          : "text-muted-foreground"
                      )}
                      title={title}
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
        {/* Mobile step titles below progress */}
        <div className="sm:hidden mt-4">
          <div className="flex justify-between px-2">
            {stepTitles.map((title, index) => {
              const stepNumber = index + 1
              const isCompleted = stepNumber < currentStep
              const isCurrent = stepNumber === currentStep
              return (
                <div
                  key={stepNumber}
                  className={cn(
                    "text-xs text-center transition-all duration-300 max-w-[60px]",
                    isCurrent
                      ? "text-primary font-semibold"
                      : isCompleted
                      ? "text-green-600"
                      : "text-muted-foreground opacity-70"
                  )}
                >
                  {title.split(' ').map((word, i) => (
                    <div key={i} className="leading-tight">
                      {word}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}