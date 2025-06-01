import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection by fetching count of users
    const userCount = await prisma.user.count();
    
    return NextResponse.json({ 
      status: 'connected', 
      userCount,
      message: 'Successfully connected to PostgreSQL database' 
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to connect to database',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
