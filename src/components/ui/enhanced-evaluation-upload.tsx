import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ProgressIndicator } from "@/components/ui/progress-indicator"
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Settings,
  FileSpreadsheet,
  Sparkles,
  BarChart3
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { apiService } from "@/services/api"

interface Template {
  id: number
  name: string
  description: string
  template_type: string
  is_default: boolean
  is_active: boolean
}

interface EnhancedEvaluationUploadProps {
  onEvaluationComplete: (evaluationData: any) => void
  onError: (error: string) => void
}

const EnhancedEvaluationUpload: React.FC<EnhancedEvaluationUploadProps> = ({
  onEvaluationComplete,
  onError
}) => {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [currentStep, setCurrentStep] = React.useState(0)
  const [templates, setTemplates] = React.useState<Template[]>([])
  const [loadingTemplates, setLoadingTemplates] = React.useState(true)
  
  // Evaluation configuration
  const [evaluationMethods, setEvaluationMethods] = React.useState<string[]>(['basic'])
  const [selectedTemplates, setSelectedTemplates] = React.useState<number[]>([])

  // Load templates on component mount
  React.useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true)
      const response = await apiService.getTemplates()
      if (response.success && response.data) {
        setTemplates(response.data.templates || [])
      }
    } catch (error) {
      console.error('Error loading templates:', error)
      toast({
        title: "Warning",
        description: "Failed to load templates. Basic evaluation will be used.",
        variant: "destructive"
      })
    } finally {
      setLoadingTemplates(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.pdf') && !file.name.toLowerCase().endsWith('.docx')) {
        toast({
          title: "Invalid file type",
          description: "Please select a PDF or DOCX file",
          variant: "destructive"
        })
        return
      }
      
      // Validate file size (16MB)
      if (file.size > 16 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "File size must be less than 16MB",
          variant: "destructive"
        })
        return
      }
      
      setSelectedFile(file)
      toast({
        title: "File selected",
        description: `${file.name} is ready for evaluation`,
      })
    }
  }

  const handleMethodToggle = (method: string) => {
    setEvaluationMethods(prev => {
      if (prev.includes(method)) {
        // Don't allow removing 'basic' if it's the only method
        if (method === 'basic' && prev.length === 1) {
          return prev
        }
        return prev.filter(m => m !== method)
      } else {
        return [...prev, method]
      }
    })
  }

  const handleTemplateToggle = (templateId: number) => {
    setSelectedTemplates(prev => {
      if (prev.includes(templateId)) {
        return prev.filter(id => id !== templateId)
      } else {
        return [...prev, templateId]
      }
    })
  }

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to evaluate",
        variant: "destructive"
      })
      return
    }

    if (evaluationMethods.length === 0) {
      toast({
        title: "No evaluation method selected",
        description: "Please select at least one evaluation method",
        variant: "destructive"
      })
      return
    }

    // Validate template selection
    if (evaluationMethods.includes('template') && selectedTemplates.length === 0) {
      toast({
        title: "No templates selected",
        description: "Please select at least one template for template evaluation",
        variant: "destructive"
      })
      return
    }

    try {
      setIsProcessing(true)
      setCurrentStep(1)
      
      // Show progress toast for long-running operations
      toast({
        title: "Starting evaluation...",
        description: "This may take several minutes. Please don't close this page.",
      })
      
      const response = await apiService.uploadAndEvaluateWithMethods(
        selectedFile,
        evaluationMethods,
        selectedTemplates
      )
      
      if (response.success && response.data) {
        setCurrentStep(2)
        onEvaluationComplete(response.data)
        
        toast({
          title: "Evaluation complete!",
          description: "Your manuscript evaluation is ready",
        })
      } else {
        throw new Error(response.error || 'Evaluation failed')
      }
    } catch (error) {
      console.error('Evaluation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Evaluation failed'
      
      // Check if it's an OpenAI configuration error
      if (errorMessage.includes('OpenAI API is not configured') || errorMessage.includes('OPENAI_API_KEY')) {
        toast({
          title: "OpenAI Configuration Required",
          description: "AI-powered evaluation requires OpenAI API configuration. Please contact your administrator to set up the OPENAI_API_KEY environment variable.",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Evaluation failed",
          description: errorMessage,
          variant: "destructive"
        })
      }
      
      onError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setCurrentStep(0)
    setEvaluationMethods(['basic'])
    setSelectedTemplates([])
  }

  const getSelectedTemplatesInfo = () => {
    return templates.filter(t => selectedTemplates.includes(t.id))
  }

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="file-upload" className="text-slate-700 font-medium">Select your manuscript file</Label>
          <Input
            id="file-upload"
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileSelect}
            disabled={isProcessing}
            className="mt-2 border-slate-200 focus:border-blue-500"
          />
          <p className="text-sm text-slate-500 mt-1">
            Supported formats: PDF, DOCX (max 16MB)
          </p>
        </div>
        
        {selectedFile && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <span className="text-sm font-medium text-green-900">{selectedFile.name}</span>
              <Badge variant="secondary" className="ml-2">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </Badge>
            </div>
          </div>
        )}
      </div>

      {/* Evaluation Configuration Section */}
      <div className="space-y-6">
        {/* Evaluation Methods */}
        <div>
          <Label className="text-slate-700 font-medium mb-3 block">Evaluation Methods</Label>
          <p className="text-sm text-slate-600 mb-4">
            Select one or more evaluation methods to use
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
              <Checkbox
                id="method-basic"
                checked={evaluationMethods.includes('basic')}
                onCheckedChange={() => handleMethodToggle('basic')}
                disabled={isProcessing}
                className="border-slate-300"
              />
              <Label htmlFor="method-basic" className="flex items-center gap-3 flex-1 cursor-pointer">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-blue-600">Basic</Badge>
                    <span className="font-medium text-slate-900">Standard LADI evaluation</span>
                  </div>
                  <p className="text-sm text-slate-600">Default criteria for manuscript analysis</p>
                </div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
              <Checkbox
                id="method-template"
                checked={evaluationMethods.includes('template')}
                onCheckedChange={() => handleMethodToggle('template')}
                disabled={isProcessing || loadingTemplates}
                className="border-slate-300"
              />
              <Label htmlFor="method-template" className="flex items-center gap-3 flex-1 cursor-pointer">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-purple-600">Template</Badge>
                    <span className="font-medium text-slate-900">Custom evaluation</span>
                  </div>
                  <p className="text-sm text-slate-600">Using your custom templates</p>
                </div>
              </Label>
            </div>
          </div>
        </div>

        {/* Template Selection */}
        {evaluationMethods.includes('template') && (
          <div>
            <Label className="text-slate-700 font-medium mb-3 block">Select Templates</Label>
            <p className="text-sm text-slate-600 mb-4">
              Choose which templates to use for evaluation
            </p>
            
            {loadingTemplates ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-slate-600 mt-2">Loading templates...</p>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8 border border-slate-200 rounded-lg bg-slate-50">
                <FileSpreadsheet className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-sm font-medium text-slate-900">No templates available</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Upload templates in the Template Management section
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                    <Checkbox
                      id={`template-${template.id}`}
                      checked={selectedTemplates.includes(template.id)}
                      onCheckedChange={() => handleTemplateToggle(template.id)}
                      disabled={isProcessing}
                      className="border-slate-300"
                    />
                    <Label htmlFor={`template-${template.id}`} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-slate-900">{template.name}</div>
                          {template.description && (
                            <div className="text-sm text-slate-600">
                              {template.description}
                            </div>
                          )}
                        </div>
                        <Badge variant={template.is_default ? "default" : "secondary"}>
                          {template.template_type}
                        </Badge>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            )}
            
            {selectedTemplates.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">Selected Templates:</p>
                <div className="flex flex-wrap gap-2">
                  {getSelectedTemplatesInfo().map((template) => (
                    <Badge key={template.id} variant="outline" className="bg-white border-blue-300 text-blue-700">
                      {template.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <div className="space-y-4">
          <div className="text-center">
            <ProgressIndicator currentStep={currentStep} />
          </div>
          <div className="space-y-3">
            <p className="text-sm text-slate-600 text-center">
              {currentStep === 1 ? "Analyzing your manuscript..." : "Generating evaluation report..."}
            </p>
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-xs text-slate-500 mb-3 text-center">Evaluation Progress:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-xs text-slate-600">Uploading file...</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${currentStep >= 1 ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                  <span className="text-xs text-slate-600">Processing with AI...</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${currentStep >= 2 ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                  <span className="text-xs text-slate-600">Generating report...</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center">
              This process may take 3-5 minutes. Please don't close this page.
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <Button
          onClick={handleSubmit}
          disabled={!selectedFile || isProcessing || evaluationMethods.length === 0}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Start Evaluation
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isProcessing}
          className="border-slate-200 hover:border-slate-300"
        >
          Reset
        </Button>
      </div>

      {/* Summary */}
      {selectedFile && evaluationMethods.length > 0 && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <h4 className="font-medium text-slate-900 mb-3">Evaluation Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">File:</span>
              <span className="font-medium text-slate-900">{selectedFile.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Methods:</span>
              <span className="font-medium text-slate-900">{evaluationMethods.join(', ')}</span>
            </div>
            {selectedTemplates.length > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-600">Templates:</span>
                <span className="font-medium text-slate-900">{getSelectedTemplatesInfo().map(t => t.name).join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedEvaluationUpload
