import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // Get total questions count
    const totalQuestions = await prisma.question.count();

    // Get completed questions count
    const completedCount = await prisma.userProgress.count({
      where: {
        userId,
        completed: true
      }
    });

    // Get progress by difficulty
    const progressByDifficulty = await prisma.userProgress.groupBy({
      by: ['questionId'],
      where: {
        userId,
        completed: true
      },
      _count: {
        id: true
      }
    });

    // Get actual difficulty distribution
    const difficultyStats = await prisma.question.groupBy({
      by: ['difficulty'],
      where: {
        id: {
          in: progressByDifficulty.map(p => p.questionId)
        }
      },
      _count: {
        id: true
      }
    });

    // Get progress by topic (extract from topics string)
    const completedQuestions = await prisma.question.findMany({
      where: {
        progress: {
          some: {
            userId,
            completed: true
          }
        }
      },
      select: {
        topics: true
      }
    });

    // Process topics
    const topicCount: Record<string, number> = {};
    completedQuestions.forEach(q => {
      if (q.topics) {
        const topics = q.topics.split(',').map(t => t.trim());
        topics.forEach(topic => {
          topicCount[topic] = (topicCount[topic] || 0) + 1;
        });
      }
    });

    const progressByTopic = Object.entries(topicCount).map(([name, completed]) => ({
      name,
      completed
    }));

    // Get last solved question
    const lastProgress = await prisma.userProgress.findFirst({
      where: {
        userId,
        completed: true
      },
      orderBy: {
        completedAt: 'desc'
      },
      include: {
        question: true
      }
    });

    const lastSolvedQuestion = lastProgress ? {
      ...lastProgress.question,
      solvedAt: lastProgress.completedAt?.toISOString()
    } : null;

    // Calculate current streak (simplified)
    const progressPercentage = totalQuestions > 0 ? 
      Math.round((completedCount / totalQuestions) * 100) : 0;

    const stats = {
      completedCount,
      totalQuestions,
      progressPercentage,
      currentStreak: 0, // You can implement streak calculation logic here
      progressByDifficulty: difficultyStats,
      progressByTopic,
      lastSolvedQuestion
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
