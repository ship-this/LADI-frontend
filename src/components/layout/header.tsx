import * as React from "react"
import { cn } from "@/lib/utils"
import { BookOpen, Brain } from "lucide-react"

interface HeaderProps {
  className?: string
}

export const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(
          "sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60",
          className
        )}
        {...props}
      >
        <div className="container mx-auto flex h-16 items-center px-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="rounded-lg bg-primary p-2">
                <Brain className="h-6 w-6 text-primary-foreground" />
              </div>
              <BookOpen className="absolute -bottom-1 -right-1 h-4 w-4 text-secondary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                LADI Evaluator
              </h1>
              <p className="text-xs text-muted-foreground">
                AI-Powered Document Analysis
              </p>
            </div>
          </div>
          
          <div className="ml-auto flex items-center space-x-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-foreground">
                Professional Manuscript Analysis
              </p>
              <p className="text-xs text-muted-foreground">
                6 Comprehensive Evaluations
              </p>
            </div>
          </div>
        </div>
      </header>
    )
  }
)

Header.displayName = "Header"