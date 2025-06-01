import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get total counts
    const [
      totalAdmins,
      totalUsers,
      totalQuestions,
      activeUsersToday,
      questionProgress,
      questionFavorites
    ] = await Promise.all([
      // Total admins (ADMIN + SUPER_ADMIN)
      prisma.user.count({
        where: {
          role: {
            in: ['ADMIN', 'SUPER_ADMIN']
          }
        }
      }),
      
      // Total regular users
      prisma.user.count({
        where: {
          role: 'USER'
        }
      }),
      
      // Total questions
      prisma.question.count(),
      
      // Active users today (users with progress today)
      prisma.progress.groupBy({
        by: ['userId'],
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }).then(result => result.length),
      
      // Most solved question
      prisma.progress.groupBy({
        by: ['questionId'],
        _count: {
          questionId: true
        },
        orderBy: {
          _count: {
            questionId: 'desc'
          }
        },
        take: 1
      }),
      
      // Most favorited question
      prisma.favorite.groupBy({
        by: ['questionId'],
        _count: {
          questionId: true
        },
        orderBy: {
          _count: {
            questionId: 'desc'
          }
        },
        take: 1
      })
    ]);

    // Get most solved question details
    let mostSolvedQuestion = 'No data';
    if (questionProgress.length > 0) {
      const question = await prisma.question.findUnique({
        where: { id: questionProgress[0].questionId },
        select: { title: true }
      });
      mostSolvedQuestion = question?.title || 'Unknown';
    }

    // Get most favorited question details
    let mostFavorited = 'No data';
    if (questionFavorites.length > 0) {
      const question = await prisma.question.findUnique({
        where: { id: questionFavorites[0].questionId },
        select: { title: true }
      });
      mostFavorited = question?.title || 'Unknown';
    }

    // Get top company (most questions)
    const topCompanyResult = await prisma.question.groupBy({
      by: ['company'],
      _count: {
        company: true
      },
      orderBy: {
        _count: {
          company: 'desc'
        }
      },
      take: 1
    });

    const topCompany = topCompanyResult.length > 0 ? topCompanyResult[0].company : 'No data';

    // Calculate growth (mock calculation - you can implement real logic)
    const usersLastMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30))
        }
      }
    });

    const monthlyGrowth = totalUsers > 0 ? Math.round((usersLastMonth / totalUsers) * 100) : 0;

    // Mock system metrics (replace with real monitoring data)
    const systemUsage = Math.floor(Math.random() * 30) + 50; // 50-80%
    const dbStorageUsed = Math.floor(Math.random() * 40) + 40; // 40-80%
    const apiCalls = Math.floor(Math.random() * 5000) + 10000; // 10K-15K
    const avgResponseTime = Math.floor(Math.random() * 50) + 30; // 30-80ms

    const stats = {
      totalAdmins,
      totalUsers,
      systemUsage,
      monthlyGrowth,
      activeUsersToday,
      mostSolvedQuestion,
      mostFavorited,
      topCompany,
      dbStorageUsed,
      apiCalls,
      avgResponseTime
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
