import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Get user progress stats
    const progress = await prisma.userProgress.findMany({
      where: { userId },
      include: { question: true }
    });

    const totalSolved = progress.filter(p => p.status === 'COMPLETED').length;
    const totalAttempted = progress.length;
    
    const difficultyStats = {
      easy: { solved: 0, total: 0 },
      medium: { solved: 0, total: 0 },
      hard: { solved: 0, total: 0 }
    };

    progress.forEach(p => {
      const difficulty = p.question.difficulty.toLowerCase() as keyof typeof difficultyStats;
      if (difficultyStats[difficulty]) {
        difficultyStats[difficulty].total++;
        if (p.status === 'COMPLETED') {
          difficultyStats[difficulty].solved++;
        }
      }
    });

    // Get recent activity
    const recentActivity = await prisma.userProgress.findMany({
      where: { userId },
      include: { question: true },
      orderBy: { updatedAt: 'desc' },
      take: 10
    });

    // Get streak information
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    while (true) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dailyProgress = await prisma.userProgress.findFirst({
        where: {
          userId,
          updatedAt: {
            gte: dayStart,
            lte: dayEnd
          }
        }
      });
      
      if (dailyProgress) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return NextResponse.json({
      totalSolved,
      totalAttempted,
      difficultyStats,
      recentActivity,
      streak
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
