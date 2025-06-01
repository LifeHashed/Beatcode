import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const questions = await prisma.question.findMany({
      include: {
        progress: session.user?.id ? {
          where: {
            userId: parseInt(session.user.id)
          }
        } : false,
        favorites: session.user?.id ? {
          where: {
            userId: parseInt(session.user.id)
          }
        } : false,
        remarks: session.user?.id ? {
          where: {
            userId: parseInt(session.user.id)
          }
        } : false,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match frontend expectations
    const transformedQuestions = questions.map(question => ({
      ...question,
      url: question.link, // Map link to url
      topics: question.topics ? 
        question.topics.split(',').map(topic => ({ name: topic.trim() })) : 
        [], // Transform string to array of objects
    }));

    return NextResponse.json(transformedQuestions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      );
    }

    const { title, description, difficulty, company, timeline, topics, leetcodeLink } = await request.json();

    if (!title || !difficulty) {
      return NextResponse.json(
        { message: 'Title and difficulty are required' },
        { status: 400 }
      );
    }

    const question = await prisma.question.create({
      data: {
        title,
        description,
        difficulty,
        company: company || '',
        timeline: timeline || '',
        link: leetcodeLink || '',
        leetcodeLink,
        addedById: session.user.id,
        // Handle topics as a scalar field
        topics: topics?.join(',') || ''
      }
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
