import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const difficulty = searchParams.get('difficulty');
    const company = searchParams.get('company');
    const timeline = searchParams.get('timeline');
    const sortBy = searchParams.get('sortBy');
    const sortDirection = searchParams.get('sortDirection') || 'asc';

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { 
          topics: { 
            not: null,
            contains: search, 
            mode: 'insensitive' 
          } 
        }
      ];
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (company) {
      where.company = { contains: company, mode: 'insensitive' };
    }

    if (timeline) {
      where.timeline = timeline;
    }

    // Build orderBy clause for sorting
    let orderBy: any = { createdAt: 'desc' }; // Default sorting

    if (sortBy && ['title', 'difficulty', 'company'].includes(sortBy)) {
      if (sortBy === 'title') {
        orderBy = [
          { title: sortDirection as 'asc' | 'desc' },
          { createdAt: 'desc' }
        ];
      } else if (sortBy === 'difficulty') {
        // Custom sorting for difficulty: EASY -> MEDIUM -> HARD
        const difficultyOrder = sortDirection === 'asc' 
          ? [{ difficulty: 'asc' }, { createdAt: 'desc' }]
          : [{ difficulty: 'desc' }, { createdAt: 'desc' }];
        orderBy = difficultyOrder;
      } else if (sortBy === 'company') {
        orderBy = [
          { company: sortDirection as 'asc' | 'desc' },
          { createdAt: 'desc' }
        ];
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.question.count({ where });

    // Fetch questions with relations
    const questions = await prisma.question.findMany({
      where,
      include: {
        _count: {
          select: {
            progress: true,
            favorites: true,
            remarks: true
          }
        },
        addedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy,
      skip,
      take: limit
    });

    // Transform questions to match expected format
    const transformedQuestions = questions.map(question => ({
      id: question.id.toString(),
      title: question.title,
      url: question.link,
      difficulty: question.difficulty,
      company: question.company,
      timeline: question.timeline,
      frequency: question.frequency,
      acceptance: question.acceptance,
      leetcodeLink: question.leetcodeLink,
      description: question.description,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      addedBy: question.addedBy,
      topics: question.topics ? question.topics.split(',').map((topic: string, index: number) => ({
        id: `${question.id}-${index}`,
        name: topic.trim()
      })).filter(topic => topic.name) : [],
      _count: question._count
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      questions: transformedQuestions,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching questions:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        searchParams: Object.fromEntries(new URL(request.url).searchParams)
      });
    }
    
    return NextResponse.json(
      { 
        message: 'Internal server error', 
        error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : 'Server error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { title, url, difficulty, company, timeline, topics } = await request.json();

    // Validate required fields
    if (!title || !url || !difficulty || !company || !timeline) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert topics array to comma-separated string
    const topicsString = Array.isArray(topics) ? topics.join(', ') : (topics || '');

    const question = await prisma.question.create({
      data: {
        title,
        link: url, // Use link field from schema
        difficulty,
        company,
        timeline,
        topics: topicsString,
        addedById: parseInt(session.user.id)
      }
    });

    // Transform response to match expected format
    const transformedQuestion = {
      ...question,
      url: question.link,
      topics: question.topics ? question.topics.split(',').map((topic: string, index: number) => ({
        id: `${question.id}-${index}`,
        name: topic.trim()
      })) : []
    };

    return NextResponse.json({
      message: 'Question created successfully',
      question: transformedQuestion
    });

  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
