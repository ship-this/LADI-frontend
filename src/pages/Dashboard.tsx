import * as React from "react"
import { Header } from "@/components/layout/header"
import { FileUpload } from "@/components/ui/file-upload"
import { ProgressIndicator } from "@/components/ui/progress-indicator"
import { EvaluationCard, defaultEvaluations } from "@/components/ui/evaluation-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileText, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import heroImage from "@/assets/hero-image.jpg"

type AppState = "upload" | "processing" | "results"

interface EvaluationResults {
  [key: string]: {
    score: number
    summary: string
  }
}

const Dashboard = () => {
  const [appState, setAppState] = React.useState<AppState>("upload")
  const [currentStep, setCurrentStep] = React.useState(0)
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null)
  const [evaluations, setEvaluations] = React.useState(defaultEvaluations)
  const [results, setResults] = React.useState<EvaluationResults>({})

  const handleFileSelect = (file: File) => {
    setUploadedFile(file)
    setAppState("processing")
    setCurrentStep(1)
    
    toast({
      title: "File uploaded successfully",
      description: `${file.name} is ready for analysis`,
    })

    // Simulate processing
    simulateProcessing()
  }

  const simulateProcessing = async () => {
    // Simulate AI processing with realistic timing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock results
    const mockResults: EvaluationResults = {
      "line-editing": {
        score: 85,
        summary: "Strong prose with excellent clarity. Minor grammar inconsistencies noted in dialogue sections."
      },
      "plot": {
        score: 78,
        summary: "Well-structured narrative with good pacing. The middle section could benefit from increased tension."
      },
      "character": {
        score: 92,
        summary: "Exceptional character development with clear motivations and authentic dialogue throughout."
      },
      "flow": {
        score: 80,
        summary: "Smooth transitions between scenes. Some chapters end abruptly but overall flow is engaging."
      },
      "worldbuilding": {
        score: 88,
        summary: "Rich, immersive setting with consistent internal logic. Great attention to environmental details."
      },
      "readiness": {
        score: 84,
        summary: "High readiness for publication. Minor revisions recommended before final submission."
      }
    }

    setResults(mockResults)
    
    // Update evaluations with results
    const updatedEvaluations = defaultEvaluations.map(evaluation => ({
      ...evaluation,
      status: "completed" as const,
      score: mockResults[evaluation.id]?.score,
      summary: mockResults[evaluation.id]?.summary
    }))
    
    setEvaluations(updatedEvaluations)
    setCurrentStep(2)
    setAppState("results")
    
    toast({
      title: "Analysis complete!",
      description: "Your manuscript evaluation is ready for download",
    })
  }

  const handleDownload = () => {
    // In a real implementation, this would generate and download a PDF
    toast({
      title: "Download started",
      description: "Your evaluation report is being prepared...",
    })
  }

  const handleReset = () => {
    setAppState("upload")
    setCurrentStep(0)
    setUploadedFile(null)
    setEvaluations(defaultEvaluations)
    setResults({})
  }

  const getOverallScore = () => {
    const scores = Object.values(results).map(r => r.score)
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-background p-8 md:p-12">
          <div className="absolute inset-0 opacity-10">
            <img 
              src={heroImage} 
              alt="Document Analysis" 
              className="h-full w-full object-cover"
            />
          </div>
          <div className="relative z-10 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Professional Manuscript Analysis
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              Get comprehensive AI-powered evaluation across 6 key dimensions of your manuscript
            </p>
            {appState === "upload" && (
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>PDF & DOCX Support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4" />
                  <span>3-5 Minutes Processing</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload & Progress */}
          <div className="lg:col-span-1 space-y-6">
            {appState === "upload" && (
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle>Upload Your Manuscript</CardTitle>
                </CardHeader>
                <CardContent>
                  <FileUpload onFileSelect={handleFileSelect} />
                </CardContent>
              </Card>
            )}

            {(appState === "processing" || appState === "results") && (
              <Card className="card-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Analysis Progress
                    {appState === "results" && (
                      <Button variant="outline" size="sm" onClick={handleReset}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        New Analysis
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgressIndicator currentStep={currentStep} />
                  
                  {uploadedFile && (
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">{uploadedFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {appState === "results" && (
              <Card className="card-shadow border-success/20 bg-success-light/10">
                <CardHeader>
                  <CardTitle className="text-success">Analysis Complete</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-success mb-2">
                      {getOverallScore()}/100
                    </div>
                    <p className="text-sm text-muted-foreground">Overall Score</p>
                  </div>
                  
                  <Button onClick={handleDownload} className="w-full" size="lg">
                    <Download className="h-4 w-4 mr-2" />
                    Download Full Report
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Evaluations */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">
                  Evaluation Results
                </h2>
                <p className="text-sm text-muted-foreground">
                  6 comprehensive analysis dimensions
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {evaluations.map((evaluation) => (
                  <EvaluationCard 
                    key={evaluation.id} 
                    evaluation={evaluation}
                    className="animate-fade-in"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard