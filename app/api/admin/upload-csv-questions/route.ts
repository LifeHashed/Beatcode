simport { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    // Get stats before upload
    const beforeUpload = await prisma.question.count();

    const csvText = await file.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json(
        { message: 'CSV must have at least a header row and one data row' },
        { status: 400 }
      );
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Parse CSV data
    const questions = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      // Validate required fields
      if (!row.Title || !row.Difficulty || !row.Link || !row.Company || !row.Timeline) {
        continue; // Skip invalid rows
      }
      
      questions.push({
        title: row.Title.trim(),
        difficulty: row.Difficulty.trim(),
        link: row.Link.trim(),
        topics: row.Topics ? row.Topics.trim() : null,
        company: row.Company.trim(),
        timeline: row.Timeline.trim(),
        description: row.Description ? row.Description.trim() : null,
        leetcodeLink: row.LeetcodeLink ? row.LeetcodeLink.trim() : null,
        frequency: row.Frequency ? parseFloat(row.Frequency) : null,
        acceptance: row.Acceptance ? parseFloat(row.Acceptance) : null,
        addedById: session.user.id,
      });
    }

    // Upload questions with duplicate checking
    let added = 0;
    let duplicates = 0;
    let errors = 0;

    for (const questionData of questions) {
      try {
        // Check for existing question by title
        const existingQuestion = await prisma.question.findUnique({
          where: { title: questionData.title }
        });

        if (existingQuestion) {
          duplicates++;
          continue;
        }

        // Create the question
        await prisma.question.create({
          data: questionData
        });

        added++;
      } catch (error) {
        console.error(`Error creating question "${questionData.title}":`, error);
        errors++;
      }
    }

    // Get stats after upload
    const afterUpload = await prisma.question.count();

    const stats = {
      totalInCSV: questions.length,
      beforeUpload,
      afterUpload,
      added,
      duplicates,
      errors
    };

    return NextResponse.json(stats);
    
  } catch (error) {
    console.error('Error uploading CSV:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
