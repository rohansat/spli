// SPLI Compliance Engine
// Ensures all applications meet FAA Part 450 requirements and regulations

export interface ComplianceRule {
  id: string;
  category: 'safety' | 'technical' | 'operational' | 'documentation' | 'timeline';
  title: string;
  description: string;
  regulation: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  validation: (data: any) => ComplianceResult;
}

export interface ComplianceResult {
  passed: boolean;
  issues: ComplianceIssue[];
  warnings: string[];
  recommendations: string[];
}

export interface ComplianceIssue {
  field: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  regulation: string;
  fix: string;
}

// FAA Part 450 Compliance Rules
export const FAA_COMPLIANCE_RULES: ComplianceRule[] = [
  // Safety Compliance Rules
  {
    id: 'safety-001',
    category: 'safety',
    title: 'Public Safety Analysis Required',
    description: 'All applications must include comprehensive public safety analysis',
    regulation: '14 CFR § 450.101 - Safety Criteria',
    severity: 'critical',
    validation: (data) => {
      const issues: ComplianceIssue[] = [];
      const warnings: string[] = [];
      const recommendations: string[] = [];

      if (!data.earlyRiskAssessments || data.earlyRiskAssessments.trim().length < 50) {
        issues.push({
          field: 'earlyRiskAssessments',
          message: 'Comprehensive risk assessment required for public safety',
          severity: 'critical',
          regulation: '14 CFR § 450.101',
          fix: 'Provide detailed risk analysis including casualty expectation calculations'
        });
      }

      if (!data.publicSafetyChallenges || data.publicSafetyChallenges.trim().length < 30) {
        issues.push({
          field: 'publicSafetyChallenges',
          message: 'Public safety challenges must be identified and addressed',
          severity: 'high',
          regulation: '14 CFR § 450.101',
          fix: 'Describe specific public safety challenges and mitigation strategies'
        });
      }

      return {
        passed: issues.filter(i => i.severity === 'critical').length === 0,
        issues,
        warnings,
        recommendations
      };
    }
  },

  // Technical Compliance Rules
  {
    id: 'technical-001',
    category: 'technical',
    title: 'Vehicle Technical Specifications',
    description: 'Complete vehicle technical data must be provided',
    regulation: '14 CFR § 450.103 - Vehicle Requirements',
    severity: 'critical',
    validation: (data) => {
      const issues: ComplianceIssue[] = [];
      const warnings: string[] = [];
      const recommendations: string[] = [];

      if (!data.technicalSummary || data.technicalSummary.trim().length < 100) {
        issues.push({
          field: 'technicalSummary',
          message: 'Comprehensive technical summary required',
          severity: 'critical',
          regulation: '14 CFR § 450.103',
          fix: 'Provide detailed technical specifications including propulsion, structure, and systems'
        });
      }

      if (!data.dimensionsMassStages || data.dimensionsMassStages.trim().length < 50) {
        issues.push({
          field: 'dimensionsMassStages',
          message: 'Vehicle dimensions, mass, and stage configuration required',
          severity: 'high',
          regulation: '14 CFR § 450.103',
          fix: 'Specify vehicle dimensions, mass, and stage configuration'
        });
      }

      return {
        passed: issues.filter(i => i.severity === 'critical').length === 0,
        issues,
        warnings,
        recommendations
      };
    }
  },

  // Operational Compliance Rules
  {
    id: 'operational-001',
    category: 'operational',
    title: 'Launch Site and Operations',
    description: 'Launch site information and operational procedures required',
    regulation: '14 CFR § 450.105 - Launch Site Requirements',
    severity: 'critical',
    validation: (data) => {
      const issues: ComplianceIssue[] = [];
      const warnings: string[] = [];
      const recommendations: string[] = [];

      if (!data.launchSite || data.launchSite.trim().length < 10) {
        issues.push({
          field: 'launchSite',
          message: 'Specific launch site location required',
          severity: 'critical',
          regulation: '14 CFR § 450.105',
          fix: 'Provide exact launch site location and facility details'
        });
      }

      if (!data.siteNamesCoordinates || data.siteNamesCoordinates.trim().length < 20) {
        issues.push({
          field: 'siteNamesCoordinates',
          message: 'Launch site coordinates required',
          severity: 'high',
          regulation: '14 CFR § 450.105',
          fix: 'Provide precise latitude and longitude coordinates'
        });
      }

      return {
        passed: issues.filter(i => i.severity === 'critical').length === 0,
        issues,
        warnings,
        recommendations
      };
    }
  },

  // Documentation Compliance Rules
  {
    id: 'documentation-001',
    category: 'documentation',
    title: 'Mission Description Completeness',
    description: 'Complete mission description and concept of operations required',
    regulation: '14 CFR § 450.107 - Application Information',
    severity: 'critical',
    validation: (data) => {
      const issues: ComplianceIssue[] = [];
      const warnings: string[] = [];
      const recommendations: string[] = [];

      if (!data.missionObjective || data.missionObjective.trim().length < 50) {
        issues.push({
          field: 'missionObjective',
          message: 'Clear mission objective required',
          severity: 'critical',
          regulation: '14 CFR § 450.107',
          fix: 'Provide detailed mission objective and purpose'
        });
      }

      if (!data.vehicleDescription || data.vehicleDescription.trim().length < 100) {
        issues.push({
          field: 'vehicleDescription',
          message: 'Comprehensive vehicle description required',
          severity: 'critical',
          regulation: '14 CFR § 450.107',
          fix: 'Provide detailed vehicle description including type, capabilities, and characteristics'
        });
      }

      return {
        passed: issues.filter(i => i.severity === 'critical').length === 0,
        issues,
        warnings,
        recommendations
      };
    }
  },

  // Timeline Compliance Rules
  {
    id: 'timeline-001',
    category: 'timeline',
    title: 'Application Timeline Requirements',
    description: 'Realistic timeline and launch window information required',
    regulation: '14 CFR § 450.109 - Timeline Requirements',
    severity: 'high',
    validation: (data) => {
      const issues: ComplianceIssue[] = [];
      const warnings: string[] = [];
      const recommendations: string[] = [];

      if (!data.intendedWindow || data.intendedWindow.trim().length < 20) {
        issues.push({
          field: 'intendedWindow',
          message: 'Intended launch window required',
          severity: 'high',
          regulation: '14 CFR § 450.109',
          fix: 'Specify intended launch window with dates and timeframes'
        });
      }

      if (!data.fullApplicationTimeline || data.fullApplicationTimeline.trim().length < 30) {
        issues.push({
          field: 'fullApplicationTimeline',
          message: 'Application submission timeline required',
          severity: 'medium',
          regulation: '14 CFR § 450.109',
          fix: 'Provide timeline for full application submission'
        });
      }

      return {
        passed: issues.filter(i => i.severity === 'critical').length === 0,
        issues,
        warnings,
        recommendations
      };
    }
  }
];

// Compliance Engine Class
export class ComplianceEngine {
  private rules: ComplianceRule[];

  constructor(rules: ComplianceRule[] = FAA_COMPLIANCE_RULES) {
    this.rules = rules;
  }

  // Validate application against all compliance rules
  validateApplication(formData: Record<string, string>): ComplianceResult {
    const allIssues: ComplianceIssue[] = [];
    const allWarnings: string[] = [];
    const allRecommendations: string[] = [];
    let criticalIssues = 0;

    // Run all compliance rules
    for (const rule of this.rules) {
      try {
        const result = rule.validation(formData);
        allIssues.push(...result.issues);
        allWarnings.push(...result.warnings);
        allRecommendations.push(...result.recommendations);
        
        criticalIssues += result.issues.filter(i => i.severity === 'critical').length;
      } catch (error) {
        console.error(`Error running compliance rule ${rule.id}:`, error);
        allWarnings.push(`Compliance check failed for ${rule.title}`);
      }
    }

    return {
      passed: criticalIssues === 0,
      issues: allIssues,
      warnings: allWarnings,
      recommendations: allRecommendations
    };
  }

  // Get compliance score (0-100)
  getComplianceScore(formData: Record<string, string>): number {
    const result = this.validateApplication(formData);
    const totalIssues = result.issues.length;
    const criticalIssues = result.issues.filter(i => i.severity === 'critical').length;
    const highIssues = result.issues.filter(i => i.severity === 'high').length;
    const mediumIssues = result.issues.filter(i => i.severity === 'medium').length;

    // Weight issues by severity
    const weightedScore = (criticalIssues * 25) + (highIssues * 10) + (mediumIssues * 5);
    const maxScore = 100;
    
    return Math.max(0, maxScore - weightedScore);
  }

  // Get compliance summary by category
  getComplianceSummary(formData: Record<string, string>) {
    const result = this.validateApplication(formData);
    const summary: Record<string, { passed: number; failed: number; issues: ComplianceIssue[] }> = {};

    for (const rule of this.rules) {
      if (!summary[rule.category]) {
        summary[rule.category] = { passed: 0, failed: 0, issues: [] };
      }

      const ruleResult = rule.validation(formData);
      if (ruleResult.passed) {
        summary[rule.category].passed++;
      } else {
        summary[rule.category].failed++;
        summary[rule.category].issues.push(...ruleResult.issues);
      }
    }

    return summary;
  }

  // Generate compliance report
  generateComplianceReport(formData: Record<string, string>) {
    const result = this.validateApplication(formData);
    const score = this.getComplianceScore(formData);
    const summary = this.getComplianceSummary(formData);

    return {
      score,
      passed: result.passed,
      summary,
      issues: result.issues,
      warnings: result.warnings,
      recommendations: result.recommendations,
      timestamp: new Date().toISOString()
    };
  }
}

// Export default compliance engine instance
export const complianceEngine = new ComplianceEngine(); 