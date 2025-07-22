import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { generatePDFBlob } from '@/lib/pdf-generator';

// Initialize SendGrid with API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export async function POST(request: NextRequest) {
  try {
    const { recipient, subject, body, applicationData, userEmail, applicationName } = await request.json();

    // Validate required fields
    if (!recipient || !subject || !body || !applicationData || !userEmail) {
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

    // Create email content
    const emailContent = `
${body}

---
Application Summary:
${applicationSummary}

---
Sent from SPLI Application System
User: ${userEmail}
    `.trim();

    // Generate PDF attachment
    const pdfBlob = generatePDFBlob(applicationData as Record<string, string>, applicationName || 'Part 450 Application');
    const pdfBuffer = await pdfBlob.arrayBuffer();
    const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

    // Prepare email
    const msg = {
      to: recipient,
      from: userEmail, // Send from user's email
      subject: subject,
      text: emailContent,
      html: `
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
            <p>User: ${userEmail}</p>
          </div>
        </div>
      `,
      attachments: [
        {
          content: pdfBase64,
          filename: `${applicationName || 'Part_450_Application'}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    };

    // Send email
    if (!SENDGRID_API_KEY) {
      // Fallback for development - simulate sending
      console.log('SendGrid API key not configured. Simulating email send:', {
        to: recipient,
        from: userEmail,
        subject: subject,
        body: emailContent
      });
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return NextResponse.json(
        { 
          success: true, 
          message: 'Email sent successfully (simulated)',
          note: 'SendGrid API key not configured - email was simulated'
        },
        { status: 200 }
      );
    }

    await sgMail.send(msg);

    return NextResponse.json(
      { success: true, message: 'Email sent successfully' },
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