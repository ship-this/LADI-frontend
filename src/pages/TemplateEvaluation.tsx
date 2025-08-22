import * as React from "react"
import { Header } from "@/components/layout/header"
import EnhancedEvaluationUpload from "@/components/ui/enhanced-evaluation-upload"
import { ProgressIndicator } from "@/components/ui/progress-indicator"
import { EvaluationCard, defaultEvaluations } from "@/components/ui/evaluation-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileText, RefreshCw, ArrowLeft, Play, Settings, BarChart3, Sparkles, Clock, CheckCircle } from "lucide-react"
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

const TemplateEvaluation = () => {
  const { user, addEvaluation, isLoading, isInitializing } = useAuth()
  const navigate = useNavigate()
  const [appState, setAppState] = React.useState<AppState>("upload")
  const [currentStep, setCurrentStep] = React.useState(0)
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

  const handleEvaluationComplete = async (evaluationData: UploadEvaluationResponse) => {
    if (!user) return

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
      fileName: 'Manuscript Evaluation',
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
  }

  const handleEvaluationError = (error: string) => {
    setProcessingError(error)
    setAppState("upload")
    setCurrentStep(0)
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <Sparkles className="h-8 w-8 text-blue-600" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
                Advanced Evaluation
              </h1>
            </div>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Leverage custom templates and multiple evaluation methods for comprehensive manuscript analysis
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {appState === "upload" && (
              <div className="space-y-6">
                {/* Upload Card */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-slate-900">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      Upload Manuscript
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EnhancedEvaluationUpload
                      onEvaluationComplete={handleEvaluationComplete}
                      onError={handleEvaluationError}
                    />
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-slate-900">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Play className="h-5 w-5 text-green-600" />
                      </div>
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full border-slate-200 hover:border-slate-300"
                      onClick={() => navigate('/template-management')}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Templates
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-slate-200 hover:border-slate-300"
                      onClick={() => navigate('/evaluate')}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Basic Evaluation
                    </Button>
                  </CardContent>
                </Card>

                {/* Features */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-slate-900">Why Advanced Evaluation?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-1.5 bg-purple-100 rounded-full mt-0.5">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">Custom Templates</h4>
                        <p className="text-sm text-slate-600">Use your own evaluation criteria</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="p-1.5 bg-orange-100 rounded-full mt-0.5">
                        <BarChart3 className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">Multiple Methods</h4>
                        <p className="text-sm text-slate-600">Combine basic and template evaluation</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="p-1.5 bg-green-100 rounded-full mt-0.5">
                        <Clock className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">Comprehensive Analysis</h4>
                        <p className="text-sm text-slate-600">Get detailed insights across all dimensions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Progress Section */}
            {(appState === "processing" || appState === "results") && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between text-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      Analysis Progress
                    </div>
                    {appState === "results" && (
                      <Button variant="outline" size="sm" onClick={handleReset} className="border-slate-200">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        New Analysis
                      </Button>
                    )}
                  </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProgressIndicator currentStep={currentStep} />
                  
                  {appState === "results" && currentEvaluation && (
                    <div className="mt-6 space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-900">Evaluation Complete</p>
                            <p className="text-sm text-green-700">
                              Overall Score: {getOverallScore()}/100
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {isDownloading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Download Report
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Error Section */}
            {processingError && (
              <Card className="shadow-lg border-0 bg-red-50 border-red-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-red-900">Processing Error</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-red-700 mb-4">
                    {processingError}
                  </p>
                  <Button onClick={handleReset} variant="outline" className="w-full border-red-200 text-red-700 hover:bg-red-100">
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content Area */}
          <div className="xl:col-span-2">
            {appState === "results" && (
              <div className="space-y-6">
                {/* Results Header */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900">Evaluation Results</h2>
                      <p className="text-slate-600 mt-2">
                        Comprehensive analysis across all 6 evaluation dimensions
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-blue-600">{getOverallScore()}/100</div>
                      <div className="text-sm text-slate-500">Overall Score</div>
                    </div>
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
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-slate-900">How Advanced Evaluation Works</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-600">1</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 mb-2">Upload Your Manuscript</h4>
                            <p className="text-slate-600">
                              Upload your manuscript in PDF or DOCX format for analysis.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-green-600">2</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 mb-2">Select Evaluation Methods</h4>
                            <p className="text-slate-600">
                              Choose between basic evaluation or template-based analysis.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-purple-600">3</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 mb-2">Choose Templates</h4>
                            <p className="text-slate-600">
                              Select from your uploaded templates for custom analysis.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-orange-600">4</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 mb-2">Get Results</h4>
                            <p className="text-slate-600">
                              Receive detailed evaluation across all 6 categories.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Features Overview */}
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-slate-900">Advanced Evaluation Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Settings className="h-8 w-8 text-purple-600" />
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-2">Custom Templates</h3>
                        <p className="text-sm text-slate-600">
                          Use your own evaluation criteria for personalized analysis
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <BarChart3 className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-2">Multiple Methods</h3>
                        <p className="text-sm text-slate-600">
                          Combine basic and template evaluation for comprehensive results
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <FileText className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-2">Detailed Reports</h3>
                        <p className="text-sm text-slate-600">
                          Get comprehensive PDF reports with scores and feedback
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

export default TemplateEvaluation
