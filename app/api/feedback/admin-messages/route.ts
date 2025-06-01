import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const messageSchema = z.object({
  toUserId: z.number().optional(),
  toRole: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']).optional(),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
});

// POST - Send admin message to users
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
    const validatedData = messageSchema.parse(body);

    // Validate that either toUserId or toRole is provided
    if (!validatedData.toUserId && !validatedData.toRole) {
      return NextResponse.json({ 
        error: 'Either toUserId or toRole must be provided' 
      }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        fromUserId: parseInt(session.user.id),
        toUserId: validatedData.toUserId,
        toRole: validatedData.toRole,
        type: 'ADMIN_MESSAGE',
        title: validatedData.title,
        message: validatedData.message,
        status: 'PENDING'
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        toUser: validatedData.toUserId ? {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        } : undefined
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

    console.error('Error creating admin message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Retrieve messages from admins to the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch admin messages directed to this user or their role
    const messages = await prisma.feedback.findMany({
      where: {
        OR: [
          // Messages targeting this specific user
          { toUserId: parseInt(session.user.id) },
          // Messages targeting the user's role
          { toRole: session.user.role },
        ],
        // Only get messages from admins
        fromUser: {
          role: {
            in: ['ADMIN', 'SUPER_ADMIN']
          }
        }
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            role: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ messages });

  } catch (error) {
    console.error('Error fetching admin messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
