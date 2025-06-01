import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const feedbackSchema = z.object({
  type: z.enum(['FEEDBACK', 'FEATURE_RECOMMENDATION', 'NEW_QUESTION', 'BUG_REPORT']),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
});

// GET - Get user's own feedback
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where: {
          fromUserId: parseInt(session.user.id),
        },
        include: {
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
      prisma.feedback.count({
        where: {
          fromUserId: parseInt(session.user.id),
        }
      })
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

// POST - Create new feedback
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = feedbackSchema.parse(body);

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
