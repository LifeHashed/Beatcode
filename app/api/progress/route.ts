import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const problemId = searchParams.get('problemId');

    if (problemId) {
      // Get specific problem progress
      const progress = await prisma.progress.findUnique({
        where: {
          userId_problemId: {
            userId: session.user.id,
            problemId: problemId,
          },
        },
      });
      return NextResponse.json({ progress });
    } else {
      // Get all user progress
      const progress = await prisma.progress.findMany({
        where: { userId: session.user.id },
        include: { problem: true },
        orderBy: { updatedAt: 'desc' },
      });
      return NextResponse.json({ progress });
    }
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { questionId, completed } = await request.json();

    if (!questionId || typeof completed !== 'boolean') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const questionIdInt = parseInt(questionId);

    // Upsert user progress
    const progress = await prisma.userProgress.upsert({
      where: {
        userId_questionId: {
          userId,
          questionId: questionIdInt
        }
      },
      update: {
        completed,
        completedAt: completed ? new Date() : null,
        status: completed ? 'COMPLETED' : 'PENDING'
      },
      create: {
        userId,
        questionId: questionIdInt,
        completed,
        completedAt: completed ? new Date() : null,
        status: completed ? 'COMPLETED' : 'PENDING'
      }
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
