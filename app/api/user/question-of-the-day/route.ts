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

    // Get today's date as seed for consistent daily question
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const seed = dateString.split('-').join(''); // YYYYMMDD as number

    // Get total question count
    const totalQuestions = await prisma.question.count();
    
    if (totalQuestions === 0) {
      return NextResponse.json({ question: null });
    }

    // Use date as seed to get consistent random question for the day
    const questionIndex = parseInt(seed) % totalQuestions;

    const question = await prisma.question.findFirst({
      skip: questionIndex,
      include: {
        progress: {
          where: { userId: session.user.id },
          select: { completed: true },
        },
        favorites: {
          where: { userId: session.user.id },
          select: { id: true },
        },
      },
    });

    if (!question) {
      return NextResponse.json({ question: null });
    }

    const transformedQuestion = {
      id: question.id,
      title: question.title,
      difficulty: question.difficulty,
      company: question.company,
      topics: question.topics,
      timeline: question.timeline,
      url: question.url,
      leetcodeLink: question.leetcodeLink,
      description: question.description,
      isCompleted: question.progress.length > 0 ? question.progress[0].completed : false,
      isFavorite: question.favorites.length > 0,
    };

    return NextResponse.json({ question: transformedQuestion });
  } catch (error) {
    console.error('Error fetching question of the day:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
