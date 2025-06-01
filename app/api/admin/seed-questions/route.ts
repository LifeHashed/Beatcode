import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const sampleQuestions = [
  {
    title: "Two Sum",
    url: "https://leetcode.com/problems/two-sum/",
    difficulty: "EASY",
    company: "Google",
    timeline: "THIRTY_DAYS",
    frequency: 0.95,
    acceptance: 0.555,
    topics: ["Array", "Hash Table"]
  },
  {
    title: "Longest Substring Without Repeating Characters",
    url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    difficulty: "MEDIUM",
    company: "Amazon", 
    timeline: "THREE_MONTHS",
    frequency: 0.85,
    acceptance: 0.367,
    topics: ["String", "Hash Table", "Sliding Window"]
  },
  {
    title: "Median of Two Sorted Arrays",
    url: "https://leetcode.com/problems/median-of-two-sorted-arrays/",
    difficulty: "HARD",
    company: "Microsoft",
    timeline: "SIX_MONTHS",
    frequency: 0.75,
    acceptance: 0.435,
    topics: ["Array", "Binary Search", "Divide and Conquer"]
  },
  {
    title: "Valid Parentheses",
    url: "https://leetcode.com/problems/valid-parentheses/",
    difficulty: "EASY",
    company: "Meta",
    timeline: "THIRTY_DAYS",
    frequency: 0.90,
    acceptance: 0.421,
    topics: ["String", "Stack"]
  },
  {
    title: "Maximum Subarray",
    url: "https://leetcode.com/problems/maximum-subarray/",
    difficulty: "MEDIUM",
    company: "Netflix",
    timeline: "THREE_MONTHS",
    frequency: 0.80,
    acceptance: 0.520,
    topics: ["Array", "Dynamic Programming", "Divide and Conquer"]
  },
  {
    title: "Merge Two Sorted Lists",
    url: "https://leetcode.com/problems/merge-two-sorted-lists/",
    difficulty: "EASY",
    company: "Apple",
    timeline: "THIRTY_DAYS",
    frequency: 0.88,
    acceptance: 0.667,
    topics: ["Linked List", "Recursion"]
  },
  {
    title: "Binary Tree Inorder Traversal",
    url: "https://leetcode.com/problems/binary-tree-inorder-traversal/",
    difficulty: "EASY",
    company: "Adobe",
    timeline: "THREE_MONTHS",
    frequency: 0.70,
    acceptance: 0.784,
    topics: ["Tree", "Depth-First Search", "Binary Tree"]
  },
  {
    title: "Best Time to Buy and Sell Stock",
    url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    difficulty: "EASY",
    company: "Goldman Sachs",
    timeline: "THIRTY_DAYS",
    frequency: 0.92,
    acceptance: 0.551,
    topics: ["Array", "Dynamic Programming"]
  }
];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const createdQuestions = [];
    const skippedQuestions = [];

    for (const questionData of sampleQuestions) {
      // Check if question already exists
      const existingQuestion = await prisma.question.findFirst({
        where: { 
          OR: [
            { title: questionData.title },
            { url: questionData.url }
          ]
        }
      });

      if (existingQuestion) {
        skippedQuestions.push(questionData.title);
        continue;
      }

      // Create or find topics
      const topicConnections = [];
      for (const topicName of questionData.topics) {
        let topic = await prisma.topic.findUnique({
          where: { name: topicName }
        });

        if (!topic) {
          topic = await prisma.topic.create({
            data: { name: topicName }
          });
        }

        topicConnections.push({ id: topic.id });
      }

      // Create question with additional fields
      const question = await prisma.question.create({
        data: {
          title: questionData.title,
          url: questionData.url,
          difficulty: questionData.difficulty as any,
          company: questionData.company,
          timeline: questionData.timeline as any,
          frequency: questionData.frequency,
          acceptance: questionData.acceptance,
          topics: {
            connect: topicConnections
          }
        },
        include: {
          topics: true
        }
      });

      createdQuestions.push(question);
    }

    return NextResponse.json({
      message: `Successfully seeded ${createdQuestions.length} questions`,
      summary: {
        created: createdQuestions.length,
        skipped: skippedQuestions.length,
        total: sampleQuestions.length
      },
      createdQuestions: createdQuestions.map(q => ({ id: q.id, title: q.title })),
      skippedQuestions
    });

  } catch (error) {
    console.error('Error seeding questions:', error);
    return NextResponse.json(
      { message: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
