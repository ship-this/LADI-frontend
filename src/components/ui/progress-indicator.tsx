import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle, Clock, FileText, Brain, Download } from "lucide-react"

interface ProgressStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  status: "pending" | "processing" | "completed"
}

interface ProgressIndicatorProps {
  currentStep: number
  className?: string
}

export const ProgressIndicator = React.forwardRef<HTMLDivElement, ProgressIndicatorProps>(
  ({ currentStep, className, ...props }, ref) => {
    const steps: ProgressStep[] = [
      {
        id: "upload",
        title: "Document Uploaded",
        description: "Your manuscript has been received",
        icon: FileText,
        status: currentStep > 0 ? "completed" : "pending"
      },
      {
        id: "processing",
        title: "AI Analysis",
        description: "Running 6 comprehensive evaluations",
        icon: Brain,
        status: currentStep === 1 ? "processing" : currentStep > 1 ? "completed" : "pending"
      },
      {
        id: "complete",
        title: "Results Ready",
        description: "Evaluation complete, ready for download",
        icon: Download,
        status: currentStep === 2 ? "completed" : "pending"
      }
    ]

    const getStepIcon = (step: ProgressStep, index: number) => {
      const IconComponent = step.icon
      
      if (step.status === "completed") {
        return <CheckCircle className="h-6 w-6 text-success" />
      } else if (step.status === "processing") {
        return (
          <div className="relative">
            <Clock className="h-6 w-6 text-warning animate-pulse" />
            <div className="absolute inset-0 rounded-full border-2 border-warning/30 animate-ping" />
          </div>
        )
      } else {
        return <IconComponent className="h-6 w-6 text-muted-foreground" />
      }
    }

    return (
      <div ref={ref} className={cn("w-full space-y-4", className)} {...props}>
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border" />
          <div 
            className="absolute left-6 top-12 w-0.5 bg-primary transition-all duration-1000 ease-out"
            style={{ height: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
          
          {/* Steps */}
          <div className="relative space-y-8">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "flex items-start space-x-4 transition-all duration-500",
                  step.status === "completed" && "animate-fade-in",
                  step.status === "processing" && "animate-pulse"
                )}
              >
                {/* Icon */}
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full border-2 bg-card transition-all duration-300",
                  step.status === "completed" && "border-success bg-success-light",
                  step.status === "processing" && "border-warning bg-warning-light",
                  step.status === "pending" && "border-border bg-muted"
                )}>
                  {getStepIcon(step, index)}
                </div>
                
                {/* Content */}
                <div className="flex-1 space-y-1">
                  <h4 className={cn(
                    "font-medium transition-colors duration-300",
                    step.status === "completed" && "text-success",
                    step.status === "processing" && "text-warning",
                    step.status === "pending" && "text-muted-foreground"
                  )}>
                    {step.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                  
                  {step.status === "processing" && (
                    <div className="mt-2 space-y-1">
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-warning rounded-full animate-progress" />
                      </div>
                      <p className="text-xs text-warning">Processing...</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
)

ProgressIndicator.displayName = "ProgressIndicator"