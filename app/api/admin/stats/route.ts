import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or super admin
    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get current date and start of month/week for stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Fetch real statistics from database
    const [
      totalUsers,
      totalQuestions,
      totalAdmins,
      questionsAddedThisMonth,
      activeUsersThisWeek,
      recentUsers,
      recentQuestions
    ] = await Promise.all([
      // Total users count
      prisma.user.count(),
      
      // Total questions count
      prisma.question.count(),
      
      // Total admins count
      prisma.user.count({
        where: {
          role: {
            in: ['ADMIN', 'SUPER_ADMIN']
          }
        }
      }),
      
      // Questions added this month
      prisma.question.count({
        where: {
          createdAt: {
            gte: startOfMonth
          }
        }
      }),

      // Active users this week (users who logged in or created account this week)
      prisma.user.count({
        where: {
          OR: [
            {
              createdAt: {
                gte: startOfWeek
              }
            },
            {
              updatedAt: {
                gte: startOfWeek
              }
            }
          ]
        }
      }),
      
      // Recent users for activity
      prisma.user.findMany({
        take: 3,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          role: true
        }
      }),
      
      // Recent questions for activity
      prisma.question.findMany({
        take: 2,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          title: true,
          createdAt: true
        }
      })
    ]);

    // Build recent activity from real data
    const recentActivity = [];
    
    // Add recent user registrations
    recentUsers.forEach(user => {
      recentActivity.push({
        id: `user-${user.id}`,
        type: user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? 'admin_added' : 'user_registered',
        description: user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' 
          ? `New admin added: ${user.name}`
          : `New user registered: ${user.name}`,
        timestamp: user.createdAt.toISOString()
      });
    });

    // Add recent question additions
    recentQuestions.forEach(question => {
      recentActivity.push({
        id: `question-${question.id}`,
        type: 'question_added',
        description: `New question added: ${question.title}`,
        timestamp: question.createdAt.toISOString()
      });
    });

    // Sort activity by timestamp (most recent first)
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const stats = {
      totalUsers,
      totalQuestions,
      totalAdmins,
      questionsAddedThisMonth,
      activeUsersThisWeek,
      recentActivity: recentActivity.slice(0, 5) // Limit to 5 most recent activities
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
