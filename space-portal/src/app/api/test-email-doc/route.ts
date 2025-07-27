import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('=== TEST EMAIL DOC API STARTED ===');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session ? 'Found' : 'Not found');
    console.log('User email:', session?.user?.email);
    
    if (!session?.user?.email) {
      console.log('❌ No user session or email found');
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    console.log('=== TEST EMAIL DOCUMENT CREATION ===');
    console.log('User email:', session.user.email);

    // Test Firebase import
    console.log('Testing Firebase import...');
    try {
      const { db } = await import('@/lib/firebase');
      console.log('✅ Firebase import successful');
      
      const { collection, addDoc } = await import('firebase/firestore');
      console.log('✅ Firestore imports successful');
      
      // Test Firebase connection
      console.log('Testing Firebase connection...');
      const testDoc = {
        name: 'Test Connection',
        type: 'email',
        userId: session.user.email,
        uploadedAt: new Date().toISOString()
      };
      
      const testRef = await addDoc(collection(db, "documents"), testDoc);
      console.log('✅ Firebase connection test successful, test doc ID:', testRef.id);
      
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
      
    } catch (importError) {
      console.error('❌ Firebase import failed:', importError);
      throw importError;
    }

  } catch (error) {
    console.error('❌ ERROR CREATING TEST EMAIL DOCUMENT:', error);
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown');
    console.error('Error stack:', error instanceof Error ? error.stack : 'Unknown');
    
    return NextResponse.json(
      { 
        error: 'Failed to create test email document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 