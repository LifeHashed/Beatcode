import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      session,
      hasSession: !!session,
      userRole: session?.user?.role,
      userId: session?.user?.id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Session debug error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get session',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
