import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, FileText, Users, Zap, Globe, Star, TrendingUp, Eye } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface EvaluationResult {
  id: string
  title: string
  description: string
  score?: number
  status: "pending" | "completed"
  summary?: string
  icon: React.ComponentType<{ className?: string }>
}

interface EvaluationCardProps {
  evaluation: EvaluationResult
  className?: string
  showViewDetail?: boolean
  evaluationId?: number
}

export const EvaluationCard = React.forwardRef<HTMLDivElement, EvaluationCardProps>(
  ({ evaluation, className, showViewDetail = false, evaluationId, ...props }, ref) => {
    const IconComponent = evaluation.icon
    const navigate = useNavigate()

    const getScoreColor = (score?: number) => {
      if (!score) return "text-muted-foreground"
      if (score >= 80) return "text-success"
      if (score >= 60) return "text-warning"
      return "text-destructive"
    }

    const getScoreBadge = (score?: number) => {
      if (!score) return { label: "Pending", variant: "secondary" as const }
      if (score >= 80) return { label: "Excellent", variant: "default" as const }
      if (score >= 60) return { label: "Good", variant: "secondary" as const }
      return { label: "Needs Improvement", variant: "destructive" as const }
    }

    return (
      <Card
        ref={ref}
        className={cn(
          "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
          evaluation.status === "completed" && "border-success/20 bg-success-light/10",
          evaluation.status === "pending" && "opacity-60",
          className
        )}
        {...props}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn(
                "rounded-lg p-2 transition-colors duration-300",
                evaluation.status === "completed" ? "bg-success/10" : "bg-muted"
              )}>
                <IconComponent className={cn(
                  "h-5 w-5",
                  evaluation.status === "completed" ? "text-success" : "text-muted-foreground"
                )} />
              </div>
              <CardTitle className="text-lg font-semibold">
                {evaluation.title}
              </CardTitle>
            </div>
            
            {evaluation.status === "completed" && (
              <CheckCircle className="h-5 w-5 text-success" />
            )}
          </div>
          
          <p className="text-sm text-muted-foreground">
            {evaluation.description}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {evaluation.status === "completed" && evaluation.score && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Score</span>
                <span className={cn("text-2xl font-bold", getScoreColor(evaluation.score))}>
                  {evaluation.score}/100
                </span>
              </div>
              
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out",
                    evaluation.score >= 80 ? "bg-success" : 
                    evaluation.score >= 60 ? "bg-warning" : "bg-destructive"
                  )}
                  style={{ width: `${evaluation.score}%` }}
                />
              </div>
              
              <Badge variant={getScoreBadge(evaluation.score).variant} className="text-xs">
                {getScoreBadge(evaluation.score).label}
              </Badge>
            </div>
          )}
          
          {evaluation.status === "completed" && evaluation.summary && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Summary</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {evaluation.summary}
              </p>
            </div>
          )}
          
          {evaluation.status === "pending" && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse" />
              <span>Awaiting analysis...</span>
            </div>
          )}
          
          {showViewDetail && evaluationId && evaluation.status === "completed" && (
            <div className="pt-4 border-t border-border">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => navigate(`/evaluation/${evaluationId}`)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
          )}
        </CardContent>
        
        {/* Subtle gradient overlay for completed cards */}
        {evaluation.status === "completed" && (
          <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent pointer-events-none" />
        )}
      </Card>
    )
  }
)

EvaluationCard.displayName = "EvaluationCard"

// Default evaluations
export const defaultEvaluations: EvaluationResult[] = [
  {
    id: "line-editing",
    title: "Line & Copy Editing",
    description: "Grammar, syntax, clarity, and prose fluidity analysis",
    icon: FileText,
    status: "pending"
  },
  {
    id: "plot",
    title: "Plot Evaluation",
    description: "Story structure, pacing, narrative tension, and resolution",
    icon: TrendingUp,
    status: "pending"
  },
  {
    id: "character",
    title: "Character Evaluation",
    description: "Character depth, motivation, consistency, and emotional impact",
    icon: Users,
    status: "pending"
  },
  {
    id: "flow",
    title: "Book Flow Evaluation",
    description: "Rhythm, transitions, escalation patterns, and narrative cohesion",
    icon: Zap,
    status: "pending"
  },
  {
    id: "worldbuilding",
    title: "Worldbuilding & Setting",
    description: "Setting depth, continuity, and originality assessment",
    icon: Globe,
    status: "pending"
  },
  {
    id: "readiness",
    title: "LADI Readiness Score",
    description: "Overall readiness assessment with proprietary scoring system",
    icon: Star,
    status: "pending"
  }
]