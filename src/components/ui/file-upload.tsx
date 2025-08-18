import * as React from "react"
import { cn } from "@/lib/utils"
import { Upload, FileText, File } from "lucide-react"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept?: string
  className?: string
  disabled?: boolean
}

export const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  ({ onFileSelect, accept = ".pdf,.docx", className, disabled, ...props }, ref) => {
    const [isDragOver, setIsDragOver] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled) {
        setIsDragOver(true)
      }
    }

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      
      if (disabled) return

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        onFileSelect(files[0])
      }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (files.length > 0) {
        onFileSelect(files[0])
      }
    }

    const handleClick = () => {
      if (!disabled) {
        fileInputRef.current?.click()
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative cursor-pointer rounded-xl border-2 border-dashed border-border bg-card p-8 text-center transition-all duration-300 hover:border-primary/50 hover:bg-primary-light/20",
          isDragOver && "border-primary bg-primary-light/30 scale-[1.02]",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        {...props}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={cn(
            "rounded-full bg-primary/10 p-4 transition-all duration-300",
            isDragOver && "bg-primary/20 scale-110"
          )}>
            <Upload className="h-8 w-8 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-card-foreground">
              {isDragOver ? "Drop your document here" : "Upload your manuscript"}
            </h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop your document or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Supports PDF and DOCX files up to 10MB
            </p>
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>PDF</span>
            <File className="h-4 w-4" />
            <span>DOCX</span>
          </div>
        </div>
      </div>
    )
  }
)

FileUpload.displayName = "FileUpload"