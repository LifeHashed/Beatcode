import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get comprehensive user progress data
    const [progress, favorites, recentActivity] = await Promise.all([
      prisma.userProgress.findMany({
        where: { userId: session.user.id },
        include: { 
          problem: {
            include: {
              companies: true,
              topics: true
            }
          }
        }
      }),
      prisma.favorite.findMany({
        where: { userId: session.user.id },
        include: { problem: true }
      }),
      prisma.userProgress.findMany({
        where: { userId: session.user.id },
        include: { problem: true },
        orderBy: { updatedAt: 'desc' },
        take: 20
      })
    ]);

    // Calculate statistics
    const totalSolved = progress.filter(p => p.status === 'SOLVED').length;
    const totalAttempted = progress.length;
    
    const difficultyBreakdown = {
      easy: { solved: 0, attempted: 0 },
      medium: { solved: 0, attempted: 0 },
      hard: { solved: 0, attempted: 0 }
    };

    progress.forEach(p => {
      const difficulty = p.problem.difficulty.toLowerCase() as keyof typeof difficultyBreakdown;
      if (difficultyBreakdown[difficulty]) {
        difficultyBreakdown[difficulty].attempted++;
        if (p.status === 'SOLVED') {
          difficultyBreakdown[difficulty].solved++;
        }
      }
    });

    // Calculate weekly progress
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyProgress = await prisma.userProgres.findMany({
      where: {
        userId: session.user.id,
        updatedAt: { gte: oneWeekAgo }
      }
    });

    return NextResponse.json({
      totalSolved,
      totalAttempted,
      difficultyBreakdown,
      favorites: favorites.length,
      weeklyProgress: weeklyProgress.length,
      recentActivity,
      progress
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { questionId, completed } = await request.json();

    if (!questionId) {
      return NextResponse.json(
        { message: 'Question ID is required' },
        { status: 400 }
      );
    }

    const progress = await prisma.userProgress.upsert({
      where: {
        userId_questionId: {
          userId: session.user.id,
          questionId
        }
      },
      update: {
        completed,
        completedAt: completed ? new Date() : null
      },
      create: {
        userId: session.user.id,
        questionId,
        completed,
        completedAt: completed ? new Date() : null
      }
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
