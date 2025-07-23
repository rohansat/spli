'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, Shield, FileText, Clock, Rocket, Settings } from 'lucide-react';
import { complianceEngine, ComplianceResult } from '@/lib/compliance-engine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ComplianceDashboardProps {
  formData: Record<string, string>;
  onIssueClick?: (field: string) => void;
}

export function ComplianceDashboard({ formData, onIssueClick }: ComplianceDashboardProps) {
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
  const [complianceScore, setComplianceScore] = useState<number>(0);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    if (formData) {
      const result = complianceEngine.validateApplication(formData);
      const score = complianceEngine.getComplianceScore(formData);
      const summaryData = complianceEngine.getComplianceSummary(formData);
      
      setComplianceResult(result);
      setComplianceScore(score);
      setSummary(summaryData);
    }
  }, [formData]);

  if (!complianceResult) {
    return (
      <Card className="bg-white/5 border border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="ml-2 text-white/70">Analyzing compliance...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-500/20';
    if (score >= 70) return 'bg-yellow-500/20';
    if (score >= 50) return 'bg-orange-500/20';
    return 'bg-red-500/20';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Info className="h-4 w-4" />;
      case 'low': return <Info className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const categoryIcons = {
    safety: <Shield className="h-5 w-5" />,
    technical: <Rocket className="h-5 w-5" />,
    operational: <Settings className="h-5 w-5" />,
    documentation: <FileText className="h-5 w-5" />,
    timeline: <Clock className="h-5 w-5" />
  };

  return (
    <div className="space-y-6">
      {/* Compliance Score Card */}
      <Card className="bg-white/5 border border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Shield className="h-5 w-5 mr-2" />
            FAA Compliance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getScoreBgColor(complianceScore)}`}>
                <span className={`text-2xl font-bold ${getScoreColor(complianceScore)}`}>
                  {complianceScore}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Compliance Score</h3>
                <p className="text-white/70">
                  {complianceResult.passed ? 'Ready for submission' : 'Issues need attention'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                {complianceResult.passed ? (
                  <CheckCircle className="h-6 w-6 text-green-400" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-400" />
                )}
                <span className={`font-semibold ${complianceResult.passed ? 'text-green-400' : 'text-red-400'}`}>
                  {complianceResult.passed ? 'COMPLIANT' : 'NON-COMPLIANT'}
                </span>
              </div>
            </div>
          </div>
          
          <Progress value={complianceScore} className="h-2" />
          
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {complianceResult.issues.filter(i => i.severity === 'critical').length}
              </div>
              <div className="text-sm text-white/70">Critical Issues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {complianceResult.issues.filter(i => i.severity === 'high').length}
              </div>
              <div className="text-sm text-white/70">High Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {complianceResult.issues.filter(i => i.severity === 'medium').length}
              </div>
              <div className="text-sm text-white/70">Medium Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {complianceResult.warnings.length}
              </div>
              <div className="text-sm text-white/70">Warnings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Issues */}
      {complianceResult.issues.length > 0 && (
        <Card className="bg-white/5 border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Compliance Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceResult.issues
                .sort((a, b) => {
                  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                  return severityOrder[a.severity] - severityOrder[b.severity];
                })
                .map((issue, index) => (
                  <Alert key={index} className="border-l-4 border-l-red-500 bg-red-500/10">
                    <div className="flex items-start space-x-3">
                      {getSeverityIcon(issue.severity)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={getSeverityColor(issue.severity)}>
                            {issue.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-white/70">
                            {issue.regulation}
                          </Badge>
                        </div>
                        <AlertDescription className="text-white/90 mb-2">
                          {issue.message}
                        </AlertDescription>
                        <div className="text-sm text-white/70 mb-2">
                          <strong>Field:</strong> {issue.field}
                        </div>
                        <div className="text-sm text-green-400">
                          <strong>Fix:</strong> {issue.fix}
                        </div>
                        {onIssueClick && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => onIssueClick(issue.field)}
                          >
                            Go to Field
                          </Button>
                        )}
                      </div>
                    </div>
                  </Alert>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compliance Summary by Category */}
      {summary && (
        <Card className="bg-white/5 border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Compliance by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(summary).map(([category, data]: [string, any]) => (
                <div key={category} className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center space-x-2 mb-3">
                    {categoryIcons[category as keyof typeof categoryIcons]}
                    <h4 className="font-semibold text-white capitalize">{category}</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Passed:</span>
                      <span className="text-green-400 font-semibold">{data.passed}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Failed:</span>
                      <span className="text-red-400 font-semibold">{data.failed}</span>
                    </div>
                    {data.issues.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs text-white/70 mb-2">Issues:</div>
                        {data.issues.slice(0, 2).map((issue: any, index: number) => (
                          <div key={index} className="text-xs text-red-400 mb-1">
                            • {issue.message.substring(0, 50)}...
                          </div>
                        ))}
                        {data.issues.length > 2 && (
                          <div className="text-xs text-white/50">
                            +{data.issues.length - 2} more issues
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {complianceResult.recommendations.length > 0 && (
        <Card className="bg-white/5 border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {complianceResult.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Info className="h-5 w-5 text-blue-400 mt-0.5" />
                  <span className="text-white/90">{recommendation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {complianceResult.warnings.length > 0 && (
        <Card className="bg-white/5 border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {complianceResult.warnings.map((warning, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <span className="text-white/90">{warning}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 