import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { problemId, content, type } = await request.json();

    const remark = await prisma.remark.create({
      data: {
        problemId,
        userId: session.user.id,
        content,
        type: type || 'NOTE'
      }
    });

    return NextResponse.json({ remark });
  } catch (error) {
    console.error('Error creating remark:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const problemId = searchParams.get('problemId');

    if (!problemId) {
      return NextResponse.json({ error: 'Problem ID is required' }, { status: 400 });
    }

    const remarks = await prisma.remark.findMany({
      where: {
        problemId,
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ remarks });
  } catch (error) {
    console.error('Error fetching remarks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
