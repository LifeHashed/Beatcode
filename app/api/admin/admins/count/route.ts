import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized. Super admin access required.' },
        { status: 403 }
      );
    }

    const count = await prisma.user.count({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN']
        }
      }
    });

    return NextResponse.json({ count });

  } catch (error) {
    console.error('Error fetching admin count:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
