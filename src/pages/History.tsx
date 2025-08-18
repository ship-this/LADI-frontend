import React from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, TrendingUp } from 'lucide-react';

const History = () => {
  const { evaluationHistory } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Evaluation History</h1>
              <p className="text-muted-foreground mt-2">
                View and manage your past manuscript evaluations
              </p>
            </div>
            <Button onClick={() => navigate('/')}>
              New Evaluation
            </Button>
          </div>

          {evaluationHistory.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No evaluations yet</h3>
                <p className="text-muted-foreground mb-6">
                  Upload your first manuscript to get started with AI-powered analysis
                </p>
                <Button onClick={() => navigate('/')}>
                  Start Your First Evaluation
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {evaluationHistory.map((evaluation) => (
                <Card key={evaluation.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold text-lg">{evaluation.fileName}</h3>
                          <Badge variant={getScoreBadge(evaluation.overallScore)}>
                            {evaluation.overallScore}/100
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

                      <Button 
                        onClick={() => navigate(`/evaluation/${evaluation.id}`)}
                        variant="outline"
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default History;