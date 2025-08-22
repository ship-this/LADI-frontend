import * as React from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Upload, Settings, BarChart3, History, Users, BookOpen } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import heroImage from "@/assets/hero-image.jpg"

const Dashboard = () => {
  const { user, isLoading, isInitializing } = useAuth()
  const navigate = useNavigate()

  // Redirect to auth if not logged in and not initializing
  React.useEffect(() => {
    if (!user && !isLoading && !isInitializing) {
      navigate('/auth')
    }
  }, [user, isLoading, isInitializing, navigate])

  // Show loading while initializing or loading
  if (isLoading || isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            {isInitializing ? 'Initializing...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
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
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>PDF & DOCX Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>3-5 Minutes Processing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Evaluation */}
          <Card className="card-shadow hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/evaluate')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span>Basic Evaluation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Quick evaluation using standard LADI criteria for manuscript analysis.
              </p>
              <Button className="w-full">
                Start Evaluation
              </Button>
            </CardContent>
          </Card>

          {/* Template Evaluation */}
          <Card className="card-shadow hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/template-evaluation')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-primary" />
                <span>Template Evaluation</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Advanced evaluation using custom templates and multiple analysis methods.
              </p>
              <Button className="w-full">
                Try Template Evaluation
              </Button>
            </CardContent>
          </Card>

          {/* Template Management */}
          <Card className="card-shadow hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/template-management')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span>Template Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Upload and manage your custom evaluation templates for personalized analysis.
              </p>
              <Button className="w-full">
                Manage Templates
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Evaluation History */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5 text-primary" />
                <span>Evaluation History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View and download your previous evaluation reports and track your progress.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/history')}
              >
                View History
              </Button>
            </CardContent>
          </Card>

          {/* User Profile */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>User Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage your account settings, preferences, and personal information.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/profile')}
              >
                Manage Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Overview */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Platform Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Multiple Formats</h3>
                <p className="text-sm text-muted-foreground">
                  Support for PDF and DOCX files with automatic text extraction
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">6-Dimension Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive evaluation across Line Editing, Plot, Character, Flow, Worldbuilding, and Readiness
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Custom Templates</h3>
                <p className="text-sm text-muted-foreground">
                  Create and use custom evaluation criteria tailored to your specific needs
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default Dashboard