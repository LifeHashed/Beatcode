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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const company = searchParams.get('company') || '';
    const difficulty = searchParams.get('difficulty') || '';
    const timeline = searchParams.get('timeline') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'title';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (company) {
      where.company = {
        contains: company,
        mode: 'insensitive',
      };
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (timeline) {
      where.timeline = timeline;
    }

    // Get questions with user progress and favorites
    const questions = await prisma.question.findMany({
      where,
      include: {
        progress: {
          where: { userId: session.user.id },
          select: { completed: true },
        },
        favorites: {
          where: { userId: session.user.id },
          select: { id: true },
        },
        remarks: {
          where: { userId: session.user.id },
          select: { title: true, remark: true },
        },
      },
      orderBy: {
        [sortBy]: 'asc',
      },
      skip,
      take: limit,
    });

    // Filter by status if specified
    let filteredQuestions = questions;
    if (status === 'completed') {
      filteredQuestions = questions.filter(q => q.progress.length > 0 && q.progress[0].completed);
    } else if (status === 'unsolved') {
      filteredQuestions = questions.filter(q => q.progress.length === 0 || !q.progress[0].completed);
    } else if (status === 'favorite') {
      filteredQuestions = questions.filter(q => q.favorites.length > 0);
    }

    // Transform data
    const transformedQuestions = filteredQuestions.map(question => ({
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
      remark: question.remarks.length > 0 ? `${question.remarks[0].title}[]${question.remarks[0].remark}` : null,
    }));

    // Get total count for pagination
    const totalCount = await prisma.question.count({ where });
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      questions: transformedQuestions,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching user problems:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
