import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            problems: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ companies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
