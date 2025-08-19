import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const replySchema = z.object({
  message: z.string().min(1, 'Message is required'),
});

// POST - Reply to feedback
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: feedbackId } = await params;
    const body = await request.json();
    const validatedData = replySchema.parse(body);

    // Check if feedback exists
    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId }
    });

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    // Create admin reply
    const adminReply = await prisma.adminReply.create({
      data: {
        message: validatedData.message,
        feedbackId: feedbackId,
        fromUserId: parseInt(session.user.id)
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    // Update feedback status to REVIEWED
    await prisma.feedback.update({
      where: { id: feedbackId },
      data: { status: 'REVIEWED' }
    });

    return NextResponse.json({ adminReply }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }

    console.error('Error creating admin reply:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
