import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const feedbackSchema = z.object({
  toUserId: z.number().optional(),
  toRole: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']).optional(),
  type: z.enum(['FEEDBACK', 'FEATURE_RECOMMENDATION', 'NEW_QUESTION', 'BUG_REPORT', 'ADMIN_MESSAGE']),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
});

// GET - Get all feedback received (for admins/super admins)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (type) {
      where.type = type;
    }

    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        include: {
          fromUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            }
          },
          adminReply: {
            include: {
              fromUser: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.feedback.count({ where })
    ]);

    return NextResponse.json({
      feedbacks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Send feedback/message (for admins to users or roles)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = feedbackSchema.parse(body);

    // Validate that either toUserId or toRole is provided
    if (!validatedData.toUserId && !validatedData.toRole) {
      return NextResponse.json({ 
        error: 'Either toUserId or toRole must be provided' 
      }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        fromUserId: parseInt(session.user.id),
        ...validatedData,
        status: 'PENDING',
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        },
        toUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        }
      }
    });

    return NextResponse.json({ feedback }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }

    console.error('Error creating feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
