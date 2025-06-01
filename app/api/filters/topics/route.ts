import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const topics = await prisma.topic.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            problems: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ topics });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
