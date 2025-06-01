import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const recentSubmissions = await prisma.userProgress.findMany({
      where: {
        userId: session.user.id,
        completed: true
      },
      include: {
        question: {
          select: {
            title: true,
            difficulty: true,
            company: true
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      },
      take: 10
    });

    const formattedSubmissions = recentSubmissions.map(submission => ({
      questionTitle: submission.question.title,
      difficulty: submission.question.difficulty,
      company: submission.question.company,
      submittedAt: submission.completedAt
    }));

    return NextResponse.json(formattedSubmissions);

  } catch (error) {
    console.error('Error fetching recent submissions:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
