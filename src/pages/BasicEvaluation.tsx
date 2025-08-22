import * as React from "react"
import { Header } from "@/components/layout/header"
import { FileUpload } from "@/components/ui/file-upload"
import { ProgressIndicator } from "@/components/ui/progress-indicator"
import { EvaluationCard, defaultEvaluations } from "@/components/ui/evaluation-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileText, RefreshCw, ArrowLeft, BarChart3 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { apiService, type UploadEvaluationResponse } from "@/services/api"

type AppState = "upload" | "processing" | "results"

interface EvaluationResults {
  [key: string]: {
    score: number
    summary: string
  }
}

const BasicEvaluation = () => {
  const { user, addEvaluation, isLoading, isInitializing } = useAuth()
  const navigate = useNavigate()
  const [appState, setAppState] = React.useState<AppState>("upload")
  const [currentStep, setCurrentStep] = React.useState(0)
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null)
  const [evaluations, setEvaluations] = React.useState(defaultEvaluations)
  const [results, setResults] = React.useState<EvaluationResults>({})
  const [currentEvaluation, setCurrentEvaluation] = React.useState<UploadEvaluationResponse | null>(null)
  const [processingError, setProcessingError] = React.useState<string | null>(null)
  const [isDownloading, setIsDownloading] = React.useState(false)

  // Redirect to auth if not logged in and not initializing
  React.useEffect(() => {
    if (!user && !isLoading && !isInitializing) {
      navigate('/auth')
    }
  }, [user, isLoading, isInitializing, navigate])

  const handleFileSelect = async (file: File) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload files",
        variant: "destructive"
      })
      return
    }

    setUploadedFile(file)
    setAppState("processing")
    setCurrentStep(1)
    setProcessingError(null)
    
    toast({
      title: "File uploaded successfully",
      description: `${file.name} is ready for analysis`,
    })

    // Process the file with the backend
    await processFile(file)
  }

  const processFile = async (file: File) => {
    try {
      // Upload and evaluate the file
      const response = await apiService.uploadAndEvaluate(file)
      
      if (response.success && response.data) {
        const evaluationData = response.data
        
        // Update evaluations with real results
        const categories = evaluationData.results?.categories || {}
        const updatedEvaluations = defaultEvaluations.map(evaluation => {
          const categoryData = categories[evaluation.id]
          return {
            ...evaluation,
            status: "completed" as const,
            score: categoryData?.score || 0,
            summary: categoryData?.summary || 'No summary available'
          }
        })
        
        setEvaluations(updatedEvaluations)
        setResults(categories)
        setCurrentEvaluation(evaluationData)
        setCurrentStep(2)
        setAppState("results")
        
        // Calculate overall score from categories data
        const categoryScores = Object.values(categories).map((cat: any) => cat.score || 0)
        const overallScore = categoryScores.length > 0 ? Math.round(categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length) : 0
        
        // Add to user's evaluation history
        addEvaluation({
          id: evaluationData.evaluation_id,
          fileName: file.name,
          uploadDate: new Date().toISOString(),
          overallScore: overallScore,
          status: 'completed',
          evaluations: updatedEvaluations.map(e => ({
            id: e.id,
            title: e.title,
            score: e.score || 0,
            summary: e.summary || '',
            icon: e.icon.name
          }))
        })
        
        toast({
          title: "Analysis complete!",
          description: "Your manuscript evaluation is ready for download",
        })
      } else {
        throw new Error(response.error || 'Evaluation failed')
      }
    } catch (error) {
      console.error('Processing error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Processing failed'
      
      // Handle specific error cases
      if (errorMessage.includes('Session expired') || errorMessage.includes('expired')) {
        setProcessingError('Your session has expired. Please log in again.')
        toast({
          title: "Session expired",
          description: "Please log in again to continue",
          variant: "destructive"
        })
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      } else {
        setProcessingError(errorMessage)
        setAppState("upload")
        setCurrentStep(0)
        
        toast({
          title: "Processing failed",
          description: errorMessage,
          variant: "destructive"
        })
      }
    }
  }

  const handleDownload = async () => {
    if (!currentEvaluation) {
      toast({
        title: "No evaluation available",
        description: "Please complete an evaluation first",
        variant: "destructive"
      })
      return
    }

    setIsDownloading(true)
    
    try {
      // Use the improved download method
      const evaluationId = currentEvaluation.evaluation_id
      await apiService.downloadEvaluationPdf(evaluationId)
      
      toast({
        title: "Download started",
        description: "Your evaluation report is downloading...",
      })
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : 'Failed to download report',
        variant: "destructive"
      })
    } finally {
      setIsDownloading(false)
    }
  }

  const handleReset = () => {
    setAppState("upload")
    setCurrentStep(0)
    setUploadedFile(null)
    setEvaluations(defaultEvaluations)
    setResults({})
    setCurrentEvaluation(null)
    setProcessingError(null)
  }

  const getOverallScore = () => {
    const scores = Object.values(results).map(r => r.score)
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Basic Evaluation
            </h1>
            <p className="text-xl text-muted-foreground">
              Quick manuscript analysis using standard LADI evaluation criteria
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Sidebar - Upload & Progress */}
          <div className="xl:col-span-1 space-y-6">
            {appState === "upload" && (
              <div className="space-y-6">
                {/* Upload Section */}
                <Card className="card-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Upload Manuscript
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FileUpload onFileSelect={handleFileSelect} />
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="card-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/template-evaluation')}
                    >
                      Try Template Evaluation
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/template-management')}
                    >
                      Manage Templates
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Progress Section */}
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

                  {processingError && (
                    <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive">{processingError}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Results Summary */}
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
                  
                  <Button 
                    onClick={handleDownload} 
                    className="w-full" 
                    size="lg"
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download Full Report
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content Area */}
          <div className="xl:col-span-3">
            {appState === "results" && (
              <div className="space-y-6">
                {/* Results Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground">Evaluation Results</h2>
                    <p className="text-muted-foreground mt-2">
                      Comprehensive analysis across all 6 evaluation dimensions
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">{getOverallScore()}/100</div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                  </div>
                </div>

                {/* Evaluation Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {evaluations.map((evaluation) => (
                    <EvaluationCard
                      key={evaluation.id}
                      evaluation={evaluation}
                    />
                  ))}
                </div>
              </div>
            )}

            {appState === "upload" && (
              <div className="space-y-6">
                {/* How It Works */}
                <Card className="card-shadow">
                  <CardHeader>
                    <CardTitle>How Basic Evaluation Works</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-sm font-semibold text-primary">1</span>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Upload Your Manuscript</h4>
                            <p className="text-sm text-muted-foreground">
                              Upload your manuscript in PDF or DOCX format for analysis.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-sm font-semibold text-primary">2</span>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">AI Analysis</h4>
                            <p className="text-sm text-muted-foreground">
                              Our AI analyzes your manuscript using standard LADI criteria.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-sm font-semibold text-primary">3</span>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Get Results</h4>
                            <p className="text-sm text-muted-foreground">
                              Receive detailed evaluation across all 6 categories.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-sm font-semibold text-primary">4</span>
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Download Report</h4>
                            <p className="text-sm text-muted-foreground">
                              Download a comprehensive PDF report with scores and feedback.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Features Overview */}
                <Card className="card-shadow">
                  <CardHeader>
                    <CardTitle>Basic Evaluation Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <BarChart3 className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-2">Standard Criteria</h3>
                        <p className="text-sm text-muted-foreground">
                          Uses proven LADI evaluation criteria for consistent analysis
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-2">Quick Analysis</h3>
                        <p className="text-sm text-muted-foreground">
                          Fast processing with results in 3-5 minutes
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <Download className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-2">PDF Reports</h3>
                        <p className="text-sm text-muted-foreground">
                          Download detailed PDF reports with scores and feedback
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default BasicEvaluation

