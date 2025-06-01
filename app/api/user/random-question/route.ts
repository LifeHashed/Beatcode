import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total question count
    const totalQuestions = await prisma.question.count();
    
    if (totalQuestions === 0) {
      return NextResponse.json({ question: null });
    }

    // Get random question
    const randomIndex = Math.floor(Math.random() * totalQuestions);

    const question = await prisma.question.findFirst({
      skip: randomIndex,
    });

    if (!question) {
      return NextResponse.json({ question: null });
    }

    return NextResponse.json({ question });
  } catch (error) {
    console.error('Error fetching random question:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
