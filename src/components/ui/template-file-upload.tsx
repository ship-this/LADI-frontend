import * as React from "react"
import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface TemplateFileUploadProps {
  onFilesSelected: (manuscriptFile: File, templateFile: File) => void
  className?: string
  disabled?: boolean
}

interface FileInfo {
  file: File
  type: 'manuscript' | 'template'
  status: 'uploading' | 'success' | 'error'
  error?: string
}

export function TemplateFileUpload({ 
  onFilesSelected, 
  className,
  disabled = false 
}: TemplateFileUploadProps) {
  const [files, setFiles] = useState<FileInfo[]>([])
  const [dragActive, setDragActive] = useState(false)

  const validateFile = (file: File, type: 'manuscript' | 'template'): string | null => {
    const manuscriptTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const templateTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
    
    if (type === 'manuscript') {
      if (!manuscriptTypes.includes(file.type)) {
        return 'Manuscript must be a PDF or DOCX file'
      }
    } else {
      if (!templateTypes.includes(file.type)) {
        return 'Template must be an Excel file (.xls or .xlsx)'
      }
    }
    
    if (file.size > 16 * 1024 * 1024) { // 16MB
      return 'File size must be less than 16MB'
    }
    
    return null
  }

  const addFile = useCallback((file: File, type: 'manuscript' | 'template') => {
    const error = validateFile(file, type)
    
    const fileInfo: FileInfo = {
      file,
      type,
      status: error ? 'error' : 'success',
      error
    }
    
    setFiles(prev => {
      // Remove existing file of same type
      const filtered = prev.filter(f => f.type !== type)
      return [...filtered, fileInfo]
    })
    
    // Check if we have both files
    const updatedFiles = [...files.filter(f => f.type !== type), fileInfo]
    if (updatedFiles.length === 2 && updatedFiles.every(f => f.status === 'success')) {
      const manuscriptFile = updatedFiles.find(f => f.type === 'manuscript')?.file
      const templateFile = updatedFiles.find(f => f.type === 'template')?.file
      
      if (manuscriptFile && templateFile) {
        onFilesSelected(manuscriptFile, templateFile)
      }
    }
  }, [files, onFilesSelected])

  const removeFile = useCallback((type: 'manuscript' | 'template') => {
    setFiles(prev => prev.filter(f => f.type !== type))
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setDragActive(false)
    
    acceptedFiles.forEach(file => {
      // Try to determine file type based on extension and MIME type
      const extension = file.name.toLowerCase().split('.').pop()
      const isManuscript = extension === 'pdf' || extension === 'docx'
      const isTemplate = extension === 'xls' || extension === 'xlsx'
      
      if (isManuscript) {
        addFile(file, 'manuscript')
      } else if (isTemplate) {
        addFile(file, 'template')
      } else {
        // Unknown file type, show error
        const fileInfo: FileInfo = {
          file,
          type: 'manuscript', // Default type
          status: 'error',
          error: 'Unsupported file type'
        }
        setFiles(prev => [...prev, fileInfo])
      }
    })
  }, [addFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    disabled,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: true
  })

  const manuscriptFile = files.find(f => f.type === 'manuscript')
  const templateFile = files.find(f => f.type === 'template')

  return (
    <div className={cn("w-full", className)}>
      <Card className={cn(
        "border-2 border-dashed transition-colors",
        isDragActive || dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
        disabled && "opacity-50 cursor-not-allowed"
      )}>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              "flex flex-col items-center justify-center space-y-4 cursor-pointer",
              disabled && "cursor-not-allowed"
            )}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center space-y-2">
              <Upload className={cn(
                "h-8 w-8",
                isDragActive || dragActive ? "text-primary" : "text-muted-foreground"
              )} />
              
              <div className="text-center">
                <p className="text-sm font-medium">
                  {isDragActive || dragActive 
                    ? "Drop files here..." 
                    : "Drag & drop files here, or click to select"
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a manuscript (PDF/DOCX) and template (Excel) file
                </p>
              </div>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-medium">Selected Files:</h4>
              
              {/* Manuscript File */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Manuscript</p>
                    <p className="text-xs text-muted-foreground">
                      {manuscriptFile?.file.name || 'No file selected'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {manuscriptFile?.status === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {manuscriptFile?.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  {manuscriptFile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile('manuscript')}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Template File */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Template</p>
                    <p className="text-xs text-muted-foreground">
                      {templateFile?.file.name || 'No file selected'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {templateFile?.status === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {templateFile?.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  {templateFile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile('template')}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Error Messages */}
              {files.some(f => f.status === 'error') && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h5 className="text-sm font-medium text-red-800 mb-2">Errors:</h5>
                  <ul className="text-xs text-red-700 space-y-1">
                    {files
                      .filter(f => f.status === 'error')
                      .map((file, index) => (
                        <li key={index}>
                          <strong>{file.file.name}:</strong> {file.error}
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Success Message */}
              {files.length === 2 && files.every(f => f.status === 'success') && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <p className="text-sm text-green-800 font-medium">
                      Both files selected successfully! Ready to evaluate.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
