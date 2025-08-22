import React, { useEffect, useState, useRef } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, TrendingUp, Download, RefreshCw, Search, Filter, Trash2, Edit, MoreHorizontal, CheckSquare, Square } from 'lucide-react';
import { apiService } from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface EvaluationHistoryItem {
  id: number;
  fileName: string;
  uploadDate: string;
  overallScore: number;
  status: string;
  evaluations: Array<{
    id: string;
    title: string;
    score: number;
    summary: string;
    icon: string;
  }>;
}

const History = () => {
  const { user, evaluationHistory, loadEvaluationHistory, isLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEvaluations, setSelectedEvaluations] = useState<Set<number>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [evaluationToDelete, setEvaluationToDelete] = useState<number | null>(null);
  const [editingEvaluation, setEditingEvaluation] = useState<{ id: number; fileName: string } | null>(null);
  const [editFileName, setEditFileName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const loadingRef = useRef(false);

  useEffect(() => {
    console.log('History useEffect triggered:', { user: !!user, loadingRef: loadingRef.current, historyLength: evaluationHistory.length });
    if (user && !loadingRef.current && evaluationHistory.length === 0) {
      console.log('Starting to load evaluation history...');
      loadingRef.current = true;
      setHistoryLoading(true);
      
      const loadHistory = async () => {
        try {
          await loadEvaluationHistory();
        } finally {
          console.log('Finished loading evaluation history');
          setHistoryLoading(false);
          loadingRef.current = false;
        }
      };
      
      loadHistory();
    }
    
    // Cleanup function to prevent memory leaks
    return () => {
      loadingRef.current = false;
    };
  }, [user, loadEvaluationHistory]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-destructive";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 85) return "success";
    if (score >= 70) return "warning";
    return "destructive";
  };

  // Filter evaluations based on search and status
  const filteredEvaluations = evaluationHistory.filter((evaluation) => {
    const matchesSearch = evaluation.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || evaluation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEvaluations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEvaluations = filteredEvaluations.slice(startIndex, endIndex);

  // Export functionality
  const exportToCSV = () => {
    const headers = ['ID', 'File Name', 'Status', 'Overall Score', 'Upload Date', 'Line Editing', 'Plot', 'Character', 'Flow', 'Worldbuilding', 'Readiness'];
    const csvContent = [
      headers.join(','),
      ...filteredEvaluations.map(evaluation => [
        evaluation.id,
        `"${evaluation.fileName}"`,
        evaluation.status,
        evaluation.overallScore,
        new Date(evaluation.uploadDate).toISOString(),
        evaluation.evaluations.find(e => e.id === 'line-editing')?.score || '',
        evaluation.evaluations.find(e => e.id === 'plot')?.score || '',
        evaluation.evaluations.find(e => e.id === 'character')?.score || '',
        evaluation.evaluations.find(e => e.id === 'flow')?.score || '',
        evaluation.evaluations.find(e => e.id === 'worldbuilding')?.score || '',
        evaluation.evaluations.find(e => e.id === 'readiness')?.score || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `evaluation_history_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export completed",
      description: "Your evaluation history has been exported to CSV.",
    });
  };

  const handleDownload = async (evaluationId: number) => {
    setLoading(true);
    try {
      // Try the improved download method first
      await apiService.downloadEvaluationPdf(evaluationId);
      
      toast({
        title: "Download started",
        description: "Your evaluation report is downloading...",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : 'Failed to download report',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (evaluationId: number) => {
    try {
      const response = await apiService.deleteEvaluation(evaluationId);
      if (response.success) {
        toast({
          title: "Evaluation deleted",
          description: "The evaluation has been successfully deleted.",
        });
        // Reload history
        await loadEvaluationHistory();
      } else {
        toast({
          title: "Delete failed",
          description: response.error || 'Failed to delete evaluation',
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : 'Failed to delete evaluation',
        variant: "destructive"
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEvaluations.size === 0) return;

    try {
      const evaluationIds = Array.from(selectedEvaluations);
      const response = await apiService.bulkDeleteEvaluations(evaluationIds);
      
      if (response.success) {
        toast({
          title: "Bulk delete completed",
          description: `${response.data?.deleted_count || 0} evaluation(s) and ${response.data?.deleted_files_count || 0} files have been deleted.`,
        });
        
        setSelectedEvaluations(new Set());
        await loadEvaluationHistory();
      } else {
        throw new Error(response.error || 'Bulk delete failed');
      }
    } catch (error) {
      toast({
        title: "Bulk delete failed",
        description: error instanceof Error ? error.message : 'Failed to delete evaluations',
        variant: "destructive"
      });
    }
  };

  const handleUpdateFileName = async () => {
    if (!editingEvaluation || !editFileName.trim()) return;

    try {
      const response = await apiService.updateEvaluation(editingEvaluation.id, {
        original_filename: editFileName.trim()
      });
      
      if (response.success) {
        toast({
          title: "File name updated",
          description: "The file name has been successfully updated.",
        });
        setEditingEvaluation(null);
        setEditFileName('');
        await loadEvaluationHistory();
      } else {
        toast({
          title: "Update failed",
          description: response.error || 'Failed to update file name',
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : 'Failed to update file name',
        variant: "destructive"
      });
    }
  };

  const handleRefresh = async () => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setHistoryLoading(true);
    try {
      await loadEvaluationHistory();
      toast({
        title: "History refreshed",
        description: "Your evaluation history has been updated.",
      });
    } catch (error) {
      toast({
        title: "Failed to refresh",
        description: "Could not load evaluation history. Please try again.",
        variant: "destructive"
      });
    } finally {
      setHistoryLoading(false);
      loadingRef.current = false;
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
    setSelectedEvaluations(new Set());
  };

  const toggleSelection = (evaluationId: number) => {
    const newSelection = new Set(selectedEvaluations);
    if (newSelection.has(evaluationId)) {
      newSelection.delete(evaluationId);
    } else {
      newSelection.add(evaluationId);
    }
    setSelectedEvaluations(newSelection);
  };

  const toggleAllSelection = () => {
    if (selectedEvaluations.size === filteredEvaluations.length) {
      setSelectedEvaluations(new Set());
    } else {
      setSelectedEvaluations(new Set(filteredEvaluations.map(e => e.id)));
    }
  };

  if (isLoading || historyLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Evaluation History</h1>
              <p className="text-muted-foreground mt-2">
                View and manage your past manuscript evaluations
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={handleRefresh} 
                variant="outline"
                disabled={loading || historyLoading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button 
                onClick={exportToCSV}
                variant="outline"
                disabled={filteredEvaluations.length === 0}
              >
                Export CSV
              </Button>
              <Button onClick={() => navigate('/')}>
                New Evaluation
              </Button>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search by file name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  {(searchTerm || statusFilter !== 'all') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetFilters}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedEvaluations.size > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckSquare className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">
                      {selectedEvaluations.size} evaluation(s) selected
                    </span>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Evaluations</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {selectedEvaluations.size} evaluation(s)? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          )}

          {filteredEvaluations.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {evaluationHistory.length === 0 ? 'No evaluations yet' : 'No evaluations match your filters'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {evaluationHistory.length === 0 
                    ? 'Upload your first manuscript to get started with AI-powered analysis'
                    : 'Try adjusting your search terms or filters'
                  }
                </p>
                {evaluationHistory.length === 0 && (
                  <Button onClick={() => navigate('/')}>
                    Start Your First Evaluation
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Select All Header */}
              <div className="flex items-center space-x-2 p-2 bg-muted rounded-lg">
                <Checkbox
                  checked={selectedEvaluations.size === filteredEvaluations.length && filteredEvaluations.length > 0}
                  onCheckedChange={toggleAllSelection}
                />
                <span className="text-sm font-medium">Select All</span>
              </div>

              {paginatedEvaluations.map((evaluation) => (
                <Card key={evaluation.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <Checkbox
                          checked={selectedEvaluations.has(evaluation.id)}
                          onCheckedChange={() => toggleSelection(evaluation.id)}
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-lg">{evaluation.fileName}</h3>
                            <Badge variant={getScoreBadge(evaluation.overallScore)}>
                              {evaluation.overallScore}/100
                            </Badge>
                            <Badge variant={evaluation.status === 'completed' ? 'default' : 'secondary'}>
                              {evaluation.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(evaluation.uploadDate)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="h-4 w-4" />
                              <span className={getScoreColor(evaluation.overallScore)}>
                                Overall Score: {evaluation.overallScore}/100
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                            {evaluation.evaluations.slice(0, 6).map((evalItem) => (
                              <div key={evalItem.id} className="text-xs bg-muted rounded px-2 py-1">
                                <span className="font-medium">{evalItem.title}:</span>
                                <span className={`ml-1 ${getScoreColor(evalItem.score)}`}>
                                  {evalItem.score}/100
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        {evaluation.status === 'completed' && (
                          <Button 
                            onClick={() => handleDownload(evaluation.id)}
                            variant="outline"
                            size="sm"
                            disabled={loading}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        )}
                        <Button 
                          onClick={() => navigate(`/evaluation/${evaluation.id}`)}
                          variant="outline"
                          size="sm"
                        >
                          View Details
                        </Button>
                        
                        {/* More Actions Menu */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Evaluation Actions</DialogTitle>
                              <DialogDescription>
                                Choose an action for this evaluation
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-2">
                              <Button
                                variant="ghost"
                                className="w-full justify-start"
                                onClick={() => {
                                  setEditingEvaluation({ id: evaluation.id, fileName: evaluation.fileName });
                                  setEditFileName(evaluation.fileName);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Rename File
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" className="w-full justify-start text-destructive">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Evaluation
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Evaluation</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this evaluation? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDelete(evaluation.id)}
                                      className="bg-destructive text-destructive-foreground"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredEvaluations.length)} of {filteredEvaluations.length} evaluations
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Edit File Name Dialog */}
      <Dialog open={!!editingEvaluation} onOpenChange={() => setEditingEvaluation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename File</DialogTitle>
            <DialogDescription>
              Enter a new name for this evaluation file
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={editFileName}
              onChange={(e) => setEditFileName(e.target.value)}
              placeholder="Enter new file name..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEvaluation(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateFileName} disabled={!editFileName.trim()}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default History;