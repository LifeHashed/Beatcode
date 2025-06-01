import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current date for time-based calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Fetch all statistics in parallel
    const [
      totalUsers,
      totalQuestions,
      totalAdmins,
      questionsAddedThisMonth,
      activeUsersThisWeek,
      recentActivity
    ] = await Promise.all([
      // Total users (excluding admins)
      prisma.user.count({
        where: {
          role: 'USER'
        }
      }),
      
      // Total questions
      prisma.question.count(),
      
      // Total admins (ADMIN + SUPER_ADMIN)
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
      
      // Active users this week (users with progress in the last 7 days)
      prisma.userProgress.groupBy({
        by: ['userId'],
        where: {
          updatedAt: {
            gte: oneWeekAgo
          }
        }
      }).then(result => result.length),
      
      // Recent activity (combine user registrations and question additions)
      Promise.all([
        // Recent user registrations
        prisma.user.findMany({
          take: 5,
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            name: true,
            role: true,
            createdAt: true
          }
        }),
        
        // Recent question additions
        prisma.question.findMany({
          take: 5,
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            title: true,
            createdAt: true,
            addedBy: {
              select: {
                name: true
              }
            }
          }
        })
      ])
    ]);

    // Process recent activity
    const [recentUsers, recentQuestions] = recentActivity;
    const activityList = [];

    // Add recent user registrations to activity
    recentUsers.forEach(user => {
      activityList.push({
        id: `user-${user.id}`,
        type: user.role === 'USER' ? 'user_registered' : 'admin_added',
        description: user.role === 'USER' 
          ? `New user registered: ${user.name}`
          : `New ${user.role.toLowerCase()} added: ${user.name}`,
        timestamp: user.createdAt.toISOString()
      });
    });

    // Add recent question additions to activity
    recentQuestions.forEach(question => {
      activityList.push({
        id: `question-${question.id}`,
        type: 'question_added',
        description: `New question added: ${question.title}${question.addedBy ? ` by ${question.addedBy.name}` : ''}`,
        timestamp: question.createdAt.toISOString()
      });
    });

    // Sort activity by timestamp (most recent first) and limit to 10
    activityList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const stats = {
      totalUsers,
      totalQuestions,
      questionsAddedThisMonth,
      totalAdmins,
      activeUsersThisWeek,
      recentActivity: activityList.slice(0, 10)
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching super admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
