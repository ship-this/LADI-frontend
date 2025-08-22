import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Download, FileText, Calendar, TrendingUp, Users, Zap, Globe, Star } from 'lucide-react';
import { EvaluationCard } from '@/components/ui/evaluation-card';
import { apiService } from '@/services/api';
import { toast } from '@/hooks/use-toast';

const EvaluationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { evaluationHistory } = useAuth();
  const [loading, setLoading] = React.useState(false);

  const evaluation = evaluationHistory.find(evalItem => evalItem.id.toString() === id);

  if (!evaluation) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Evaluation Not Found</h1>
            <Button onClick={() => navigate('/history')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to History
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      'FileText': FileText,
      'TrendingUp': TrendingUp,
      'Users': Users,
      'Zap': Zap,
      'Globe': Globe,
      'Star': Star,
    };
    return iconMap[iconName] || FileText;
  };

  const handleDownload = async () => {
    if (!evaluation) return;
    
    setLoading(true);
    try {
      // Use the improved download method
      await apiService.downloadEvaluationPdf(evaluation.id);
      
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/history')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to History
            </Button>
            <Button onClick={handleDownload} disabled={loading}>
              <Download className="h-4 w-4 mr-2" />
              {loading ? 'Preparing...' : 'Download Report'}
            </Button>
          </div>

          {/* Evaluation Overview */}
          <Card className="card-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="text-2xl">{evaluation.fileName}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(evaluation.uploadDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                <Badge variant={getScoreBadge(evaluation.overallScore)} className="text-lg px-4 py-2">
                  {evaluation.overallScore}/100
                </Badge>
                  <p className="text-sm text-muted-foreground mt-1">Overall Score</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Overall Summary */}
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Overall Assessment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className={`text-2xl font-bold mb-1 ${getScoreColor(evaluation.overallScore)}`}>
                      {evaluation.overallScore}/100
                    </div>
                    <p className="text-sm text-muted-foreground">Overall Score</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold mb-1 text-foreground">
                      {evaluation.evaluations.length}
                    </div>
                    <p className="text-sm text-muted-foreground">Dimensions Analyzed</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold mb-1 text-foreground">
                      {evaluation.evaluations.filter(e => e.score >= 85).length}
                    </div>
                    <p className="text-sm text-muted-foreground">High Scores (85+)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Evaluations */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Detailed Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {evaluation.evaluations.map((evalItem) => (
                <EvaluationCard 
                  key={evalItem.id} 
                  evaluation={{
                    id: evalItem.id,
                    title: evalItem.title,
                    description: `Comprehensive analysis of ${evalItem.title.toLowerCase()}`,
                    score: evalItem.score,
                    status: 'completed' as const,
                    summary: evalItem.summary,
                    icon: getIconComponent(evalItem.icon)
                  }}
                  className="animate-fade-in"
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 pt-6">
            <Button onClick={() => navigate('/')} variant="outline">
              New Evaluation
            </Button>
            <Button onClick={() => navigate('/history')} variant="outline">
              View All Evaluations
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EvaluationDetail;