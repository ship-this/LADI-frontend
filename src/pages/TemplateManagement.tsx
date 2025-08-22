import * as React from "react"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Upload, 
  Edit, 
  Trash2, 
  Download, 
  FileSpreadsheet,
  Plus,
  Eye
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { apiService } from "@/services/api"

interface Template {
  id: number
  name: string
  description: string
  original_filename: string
  file_size: number
  template_type: string
  is_default: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

const TemplateManagement = () => {
  const { user, isLoading, isInitializing } = useAuth()
  const navigate = useNavigate()
  const [templates, setTemplates] = React.useState<Template[]>([])
  const [loading, setLoading] = React.useState(true)
  const [uploading, setUploading] = React.useState(false)
  const [editingTemplate, setEditingTemplate] = React.useState<Template | null>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  
  // Upload form state
  const [uploadForm, setUploadForm] = React.useState({
    name: '',
    description: '',
    template_type: 'custom'
  })
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  
  // Edit form state
  const [editForm, setEditForm] = React.useState({
    name: '',
    description: '',
    is_active: true
  })

  // Redirect to auth if not logged in and not initializing
  React.useEffect(() => {
    if (!user && !isLoading && !isInitializing) {
      navigate('/auth')
    }
  }, [user, isLoading, isInitializing, navigate])

  // Load templates on component mount
  React.useEffect(() => {
    if (user) {
      loadTemplates()
    }
  }, [user])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const response = await apiService.getTemplates()
      if (response.success && response.data) {
        setTemplates(response.data.templates || [])
      }
    } catch (error) {
      console.error('Error loading templates:', error)
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
        toast({
          title: "Invalid file type",
          description: "Please select an Excel file (.xlsx or .xls)",
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
      // Auto-fill name if empty
      if (!uploadForm.name) {
        setUploadForm(prev => ({ ...prev, name: file.name }))
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a template file",
        variant: "destructive"
      })
      return
    }

    try {
      setUploading(true)
      const response = await apiService.uploadTemplate(selectedFile, uploadForm)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Template uploaded successfully",
        })
        setIsUploadDialogOpen(false)
        setUploadForm({ name: '', description: '', template_type: 'custom' })
        setSelectedFile(null)
        loadTemplates()
      } else {
        throw new Error(response.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : 'Failed to upload template',
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (template: Template) => {
    setEditingTemplate(template)
    setEditForm({
      name: template.name,
      description: template.description || '',
      is_active: template.is_active
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingTemplate) return

    try {
      const response = await apiService.updateTemplate(editingTemplate.id, editForm)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Template updated successfully",
        })
        setIsEditDialogOpen(false)
        setEditingTemplate(null)
        loadTemplates()
      } else {
        throw new Error(response.error || 'Update failed')
      }
    } catch (error) {
      console.error('Update error:', error)
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : 'Failed to update template',
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (template: Template) => {
    try {
      const response = await apiService.deleteTemplate(template.id)
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Template deleted successfully",
        })
        loadTemplates()
      } else {
        throw new Error(response.error || 'Delete failed')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : 'Failed to delete template',
        variant: "destructive"
      })
    }
  }

  const handleDownload = async (template: Template) => {
    try {
      await apiService.downloadTemplate(template.id)
      toast({
        title: "Download started",
        description: "Template download initiated",
      })
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : 'Failed to download template',
        variant: "destructive"
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
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
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Template Management</h1>
            <p className="text-muted-foreground mt-2">
              Upload and manage your evaluation templates
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
            >
              Go to Home
            </Button>
            
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Upload Template
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Upload Template</DialogTitle>
                  <DialogDescription>
                    Upload an Excel template file (.xlsx or .xls) for custom evaluations
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="template-file">Template File</Label>
                    <Input
                      id="template-file"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileSelect}
                    />
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                      id="template-name"
                      value={uploadForm.name}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter template name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="template-description">Description</Label>
                    <Textarea
                      id="template-description"
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter template description"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpload} disabled={uploading || !selectedFile}>
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Templates</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading templates...</p>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8">
                <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">No templates</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get started by uploading your first template.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          {template.description && (
                            <div className="text-sm text-muted-foreground">
                              {template.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={template.is_default ? "default" : "secondary"}>
                          {template.template_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {template.original_filename}
                      </TableCell>
                      <TableCell>{formatFileSize(template.file_size)}</TableCell>
                      <TableCell>{formatDate(template.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant={template.is_active ? "default" : "secondary"}>
                          {template.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(template)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {!template.is_default && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(template)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Template</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{template.name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(template)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Template</DialogTitle>
              <DialogDescription>
                Update template information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Template Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter template name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter template description"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-active"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="edit-active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate}>
                Update
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default TemplateManagement
