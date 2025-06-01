import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get all questions without authentication requirement
    const questions = await prisma.question.findMany({
      select: {
        id: true,
        title: true,
        difficulty: true,
        company: true,
        timeline: true,
        link: true,
        topics: true,
        frequency: true,
        acceptance: true,
        description: true,
        leetcodeLink: true,
        createdAt: true
      },
      orderBy: {
        id: 'desc'
      }
    });

    // Transform the data to match expected format
    const transformedQuestions = questions.map(question => ({
      ...question,
      // Parse topics string into array format expected by frontend
      topics: question.topics ? question.topics.split(',').map(topic => ({ name: topic.trim() })) : [],
      // Use leetcodeLink as the primary URL, fallback to link
      url: question.leetcodeLink || question.link || `https://leetcode.com/problems/${question.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}/`
    }));

    return NextResponse.json({ 
      questions: transformedQuestions,
      total: transformedQuestions.length 
    });
  } catch (error) {
    console.error('Error fetching public questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions', questions: [] },
      { status: 500 }
    );
  }
}