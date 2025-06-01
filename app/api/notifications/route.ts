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

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        ...(unreadOnly ? { read: false } : {})
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationId, read } = await request.json();

    if (notificationId) {
      // Mark specific notification as read/unread
      await prisma.notification.update({
        where: {
          id: notificationId,
          userId: session.user.id
        },
        data: { read }
      });
    } else {
      // Mark all notifications as read
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          read: false
        },
        data: { read: true }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, body, userIds, type = 'GENERAL', link } = await request.json();

    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json({ error: 'Valid user IDs are required' }, { status: 400 });
    }

    const notifications = await Promise.all(
      userIds.map((userId: string) =>
        prisma.notification.create({
          data: {
            userId,
            title,
            body,
            type,
            link
          }
        })
      )
    );

    return NextResponse.json({ count: notifications.length });
  } catch (error) {
    console.error('Error creating notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
