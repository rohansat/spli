import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generatePDFBlob } from '@/lib/pdf-generator';

export async function POST(request: NextRequest) {
  try {
    // Get the user's session to access their access token
    const session = await getServerSession(authOptions);
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'User not authenticated or no access token available' },
        { status: 401 }
      );
    }

    const { recipient, subject, body, applicationData, applicationName, applicationId } = await request.json();

    // Validate required fields
    if (!recipient || !subject || !body || !applicationData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create application summary text
    const applicationSummary = Object.entries(applicationData as Record<string, string>)
      .filter(([_, value]) => value && value.trim() !== '')
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n\n');

    // Generate PDF attachment
    const pdfBlob = generatePDFBlob(applicationData as Record<string, string>, applicationName || 'Part 450 Application');
    const pdfBuffer = await pdfBlob.arrayBuffer();
    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

    // Create email content
    const emailContent = `
${body}

---
Application Summary:
${applicationSummary}

---
Sent from SPLI Application System
    `.trim();

    // Prepare email for Microsoft Graph API
    const emailData = {
      message: {
        subject: subject,
        body: {
          contentType: 'HTML',
          content: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #333; margin-top: 0;">FAA Application Submission</h2>
                <p style="color: #666; line-height: 1.6;">${body.replace(/\n/g, '<br>')}</p>
              </div>
              
              <div style="background: #e9ecef; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #495057; margin-top: 0;">Application Summary</h3>
                <div style="background: white; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 14px; line-height: 1.4;">
                  ${applicationSummary.replace(/\n/g, '<br>')}
                </div>
              </div>
              
              <div style="text-align: center; color: #6c757d; font-size: 12px; border-top: 1px solid #dee2e6; padding-top: 20px;">
                <p>Sent from SPLI Application System</p>
              </div>
            </div>
          `
        },
        toRecipients: [
          {
            emailAddress: {
              address: recipient
            }
          }
        ],
        attachments: [
          {
            '@odata.type': '#microsoft.graph.fileAttachment',
            name: `${applicationName || 'Part_450_Application'}.pdf`,
            contentType: 'application/pdf',
            contentBytes: pdfBase64
          }
        ]
      },
      saveToSentItems: true
    };

    // Send email using Microsoft Graph API
    const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Microsoft Graph API error:', errorData);
      throw new Error(`Failed to send email: ${response.status} ${response.statusText}`);
    }

    // Save email copy to document management system
    try {
      console.log('=== SAVING EMAIL DOCUMENT ===');
      console.log('Application ID:', applicationId);
      console.log('User email:', session.user?.email);
      
      // Import Firebase dynamically for server-side use
      const { db } = await import('@/lib/firebase');
      const { collection, addDoc } = await import('firebase/firestore');
      
      // Test Firebase connection first
      console.log('Testing Firebase connection...');
      const testDoc = {
        name: 'Test Connection',
        type: 'email',
        userId: session.user?.email || "",
        uploadedAt: new Date().toISOString()
      };
      
      try {
        const testRef = await addDoc(collection(db, "documents"), testDoc);
        console.log('✅ Firebase connection test successful, test doc ID:', testRef.id);
      } catch (testError) {
        console.error('❌ Firebase connection test failed:', testError);
        throw testError;
      }
      
      // Create a simple email document
      const emailDocument = {
        name: `Email: ${subject}`,
        type: 'email',
        applicationId: applicationId || null,
        applicationName: applicationName || 'Part 450 Application',
        fileSize: `${(emailContent.length / 1024).toFixed(2)} KB`,
        url: `data:text/plain;base64,${Buffer.from(emailContent).toString('base64')}`,
        uploadedAt: new Date().toISOString(),
        userId: session.user?.email || "",
        emailMetadata: {
          recipient: recipient,
          subject: subject,
          body: body,
          sentAt: new Date().toISOString(),
          applicationData: applicationData,
          applicationName: applicationName || 'Part 450 Application'
        }
      };

      console.log('Email document structure:', {
        name: emailDocument.name,
        type: emailDocument.type,
        applicationId: emailDocument.applicationId,
        userId: emailDocument.userId,
        uploadedAt: emailDocument.uploadedAt
      });
      
      // Save to Firebase
      const docRef = await addDoc(collection(db, "documents"), emailDocument);
      console.log('✅ Email document saved successfully with ID:', docRef.id);
      console.log('=== EMAIL DOCUMENT SAVED ===');
      
    } catch (error) {
      console.error('❌ ERROR SAVING EMAIL DOCUMENT:', error);
      console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown');
      console.error('Error stack:', error instanceof Error ? error.stack : 'Unknown');
      // Don't fail the email send if document save fails
    }

    return NextResponse.json(
      { success: true, message: 'Email sent successfully from your Outlook account and saved to document management' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 