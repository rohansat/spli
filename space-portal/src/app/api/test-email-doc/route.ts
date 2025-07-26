import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    console.log('=== TEST EMAIL DOCUMENT CREATION ===');
    console.log('User email:', session.user.email);

    // Create a test email document
    const testEmailDoc = {
      name: `Test Email: ${new Date().toLocaleString()}`,
      type: 'email',
      applicationId: 'test-application-id',
      applicationName: 'Test Application',
      fileSize: '1.2 KB',
      url: 'data:text/plain;base64,VGVzdCBlbWFpbCBjb250ZW50',
      uploadedAt: new Date().toISOString(),
      userId: session.user.email,
      emailMetadata: {
        recipient: 'test@example.com',
        subject: 'Test Email',
        body: 'This is a test email document',
        sentAt: new Date().toISOString(),
        applicationData: {},
        applicationName: 'Test Application'
      }
    };

    console.log('Test email document structure:', testEmailDoc);

    // Save to Firebase
    const docRef = await addDoc(collection(db, "documents"), testEmailDoc);
    console.log('✅ Test email document saved successfully with ID:', docRef.id);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Test email document created successfully',
        documentId: docRef.id 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ ERROR CREATING TEST EMAIL DOCUMENT:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create test email document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 