import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, remark } = await request.json();
    const { id: questionId } = await params;

    const remarkRecord = await prisma.remark.upsert({
      where: {
        userId_questionId: {
          userId: session.user.id,
          questionId,
        },
      },
      update: {
        title,
        remark,
      },
      create: {
        userId: session.user.id,
        questionId,
        title,
        remark,
      },
    });

    return NextResponse.json({ success: true, remark: remarkRecord });
  } catch (error) {
    console.error('Error saving remark:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
