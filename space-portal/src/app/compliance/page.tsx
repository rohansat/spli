'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, CheckCircle, FileText, Lock, Users, Server, AlertTriangle, Award, Eye, Globe, Zap, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PublicNav } from '@/components/layout/PublicNav';
import { Footer } from '@/components/layout/Footer';

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState('certifications');

  const complianceData = {
    certifications: [
      {
        name: 'FAA Part 450 Compliance',
        status: 'Compliant',
        description: 'Full compliance with FAA Part 450 regulations for commercial space launch and reentry operations.',
        icon: <Shield className="h-6 w-6" />,
        color: 'bg-green-500/20 text-green-400 border-green-500/30',
        details: 'Continuously monitored and validated against current FAA requirements'
      },
      {
        name: 'SOC 2 Type II',
        status: 'Compliant',
        description: 'Service Organization Control 2 Type II certification for security, availability, and confidentiality.',
        icon: <Lock className="h-6 w-6" />,
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        details: 'Annual audit with continuous monitoring'
      },
      {
        name: 'ISO 27001',
        status: 'Compliant',
        description: 'International standard for information security management systems.',
        icon: <Award className="h-6 w-6" />,
        color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        details: 'Certified information security management'
      },
      {
        name: 'GDPR Compliance',
        status: 'Compliant',
        description: 'General Data Protection Regulation compliance for EU data protection.',
        icon: <Globe className="h-6 w-6" />,
        color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        details: 'Full GDPR compliance for EU operations'
      }
    ],
    resources: [
      {
        name: 'FAA Compliance Policy',
        type: 'Policy Document',
        format: 'PDF',
        description: 'Comprehensive FAA Part 450 compliance procedures and guidelines.',
        icon: <FileText className="h-5 w-5" />
      },
      {
        name: 'Information Security Policy',
        type: 'Policy Document',
        format: 'PDF',
        description: 'Security controls and procedures for protecting application data.',
        icon: <Lock className="h-5 w-5" />
      },
      {
        name: 'Data Privacy Policy',
        type: 'Policy Document',
        format: 'PDF',
        description: 'How we handle and protect user data and privacy.',
        icon: <Eye className="h-5 w-5" />
      },
      {
        name: 'Access Control Policy',
        type: 'Policy Document',
        format: 'PDF',
        description: 'User access management and authentication procedures.',
        icon: <Users className="h-5 w-5" />
      },
      {
        name: 'Incident Response Plan',
        type: 'Policy Document',
        format: 'PDF',
        description: 'Procedures for handling security incidents and breaches.',
        icon: <AlertTriangle className="h-5 w-5" />
      },
      {
        name: 'Business Continuity Plan',
        type: 'Policy Document',
        format: 'PDF',
        description: 'Disaster recovery and business continuity procedures.',
        icon: <Zap className="h-5 w-5" />
      }
    ],
    controls: {
      'FAA Compliance & Governance': [
        { name: 'Part 450 Application Validation', status: 'LIVE', description: 'Real-time validation against FAA requirements' },
        { name: 'Compliance Engine Monitoring', status: 'LIVE', description: 'Continuous compliance rule validation' },
        { name: 'Regulatory Update Tracking', status: 'LIVE', description: 'Automatic updates for FAA regulation changes' },
        { name: 'Audit Trail Management', status: 'LIVE', description: 'Complete audit trail for all application changes' },
        { name: 'Compliance Reporting', status: 'LIVE', description: 'Automated compliance reports and dashboards' }
      ],
      'Data Protection & Privacy': [
        { name: 'Data Encryption at Rest', status: 'LIVE', description: 'AES-256 encryption for all stored data' },
        { name: 'Data Encryption in Transit', status: 'LIVE', description: 'TLS 1.3 encryption for all data transmission' },
        { name: 'Access Control & Authorization', status: 'LIVE', description: 'Role-based access control (RBAC)' },
        { name: 'Multi-Factor Authentication', status: 'LIVE', description: 'MFA required for all user accounts' },
        { name: 'Data Backup & Recovery', status: 'LIVE', description: 'Automated backups with 99.9% availability' }
      ],
      'Infrastructure Security': [
        { name: 'Cloud Security Controls', status: 'LIVE', description: 'AWS/Azure security best practices' },
        { name: 'Network Security Monitoring', status: 'LIVE', description: '24/7 network security monitoring' },
        { name: 'Vulnerability Management', status: 'LIVE', description: 'Regular security assessments and patching' },
        { name: 'Intrusion Detection', status: 'LIVE', description: 'Real-time threat detection and response' },
        { name: 'Security Incident Response', status: 'LIVE', description: 'Automated incident response procedures' }
      ],
      'Application Security': [
        { name: 'Secure Development Lifecycle', status: 'LIVE', description: 'Security-first development practices' },
        { name: 'Code Security Scanning', status: 'LIVE', description: 'Automated code security analysis' },
        { name: 'API Security Controls', status: 'LIVE', description: 'Secure API authentication and authorization' },
        { name: 'Input Validation & Sanitization', status: 'LIVE', description: 'Comprehensive input validation' },
        { name: 'Session Management', status: 'LIVE', description: 'Secure session handling and timeout' }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <PublicNav />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <Shield className="h-12 w-12 text-blue-400 mr-4" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              SPLI Compliance Report
            </h1>
          </div>
          <p className="text-xl text-white/70 max-w-3xl mx-auto mb-8">
            SPLI is in compliance with FAA Part 450 regulations, implements comprehensive security controls, 
            and maintains policies to ensure the highest standards of aerospace licensing compliance.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2">
              <CheckCircle className="h-4 w-4 mr-2" />
              FAA Compliant
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-4 py-2">
              <Shield className="h-4 w-4 mr-2" />
              SOC 2 Type II
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 px-4 py-2">
              <Award className="h-4 w-4 mr-2" />
              ISO 27001
            </Badge>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10">
              <TabsTrigger value="certifications" className="text-white data-[state=active]:bg-white/10">
                Certifications
              </TabsTrigger>
              <TabsTrigger value="resources" className="text-white data-[state=active]:bg-white/10">
                Resources
              </TabsTrigger>
              <TabsTrigger value="controls" className="text-white data-[state=active]:bg-white/10">
                Controls
              </TabsTrigger>
            </TabsList>

            {/* Certifications Tab */}
            <TabsContent value="certifications" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Compliance Certifications</h2>
                <p className="text-white/70">
                  We maintain the highest industry standards and regularly undergo rigorous third-party audits 
                  to ensure compliance with FAA regulations and security best practices.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {complianceData.certifications.map((cert, index) => (
                  <Card key={index} className="bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-white/10">
                            {cert.icon}
                          </div>
                          <div>
                            <CardTitle className="text-white">{cert.name}</CardTitle>
                            <Badge className={`mt-2 ${cert.color}`}>
                              {cert.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/70 mb-3">{cert.description}</p>
                      <p className="text-sm text-white/50">{cert.details}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Resource Library</h2>
                <p className="text-white/70">
                  Access our security documentation, policies, and compliance reports.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {complianceData.resources.map((resource, index) => (
                  <Card key={index} className="bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-white/10">
                          {resource.icon}
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">{resource.name}</CardTitle>
                          <Badge variant="outline" className="text-white/70 border-white/20">
                            {resource.format}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-white/70 mb-4">{resource.description}</p>
                      <Link href="/contact">
                        <Button 
                          variant="outline" 
                          className="w-full border-white/20 text-white hover:bg-white/10"
                        >
                          Request Access
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Controls Tab */}
            <TabsContent value="controls" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Security Controls</h2>
                <p className="text-white/70">
                  Our comprehensive security program includes controls across multiple domains to protect your data 
                  and ensure FAA compliance.
                </p>
              </div>
              
              <div className="space-y-8">
                {Object.entries(complianceData.controls).map(([category, controls]) => (
                  <Card key={category} className="bg-white/5 border border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white text-xl">{category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {controls.map((control, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                  {control.status}
                                </Badge>
                                <h4 className="font-medium text-white">{control.name}</h4>
                              </div>
                              <p className="text-white/70 mt-1">{control.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Security Commitment Section */}
      <section className="px-4 py-20 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <Shield className="h-12 w-12 text-blue-400 mr-4" />
            <h2 className="text-3xl font-bold">Our Security Commitment</h2>
          </div>
          <p className="text-lg text-white/70 mb-8 leading-relaxed">
            At SPLI, security isn't just a feature—it's foundational to everything we build. Our security-first mindset 
            drives our development processes, infrastructure decisions, and organizational policies.
          </p>
          <p className="text-white/70 mb-8 leading-relaxed">
            We treat the data entrusted to us—whether from our customers, their applications, or anyone who interacts 
            with our organization—with the utmost care and responsibility. Security is embedded in our DNA, enabling 
            us to deliver innovative aerospace licensing solutions without compromising on protection.
          </p>
          <Link href="/contact">
            <Button 
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3"
            >
              Contact Our Security Team
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
} 