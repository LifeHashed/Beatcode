import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWED', 'RESOLVED']),
});

// GET - Get specific feedback
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const feedbackId = parseInt(params.id);
    
    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
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
      }
    });

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    return NextResponse.json({ feedback });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update feedback status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const feedbackId = params.id;
    const body = await request.json();
    const validatedData = updateSchema.parse(body);

    // Update feedback status
    const updatedFeedback = await prisma.feedback.update({
      where: { id: feedbackId },
      data: { status: validatedData.status },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        adminReply: {
          include: {
            fromUser: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ feedback: updatedFeedback });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }

    console.error('Error updating feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
