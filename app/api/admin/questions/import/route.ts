import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parse } from 'csv-parse/sync';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check user role
    if (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Parse the multipart form data
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    // Read file content
    const fileBuffer = await file.arrayBuffer();
    const fileContent = new TextDecoder().decode(fileBuffer);

    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    // Validate CSV structure
    const requiredColumns = ['title', 'url', 'difficulty', 'company', 'timeline', 'topics'];
    const firstRecord = records[0] || {};
    const missingColumns = requiredColumns.filter(col => !(col in firstRecord));

    if (missingColumns.length > 0) {
      return NextResponse.json({ 
        message: `Missing required columns: ${missingColumns.join(', ')}` 
      }, { status: 400 });
    }

    // Import questions
    let importedCount = 0;
    for (const record of records) {
      try {
        // Process topics (convert from comma-separated string to array of topic objects)
        const topics = record.topics.split(',').map(t => t.trim()).filter(Boolean);
        
        // Create or find topics first
        const topicObjects = [];
        for (const topicName of topics) {
          const topic = await prisma.topic.upsert({
            where: { name: topicName },
            update: {},
            create: { name: topicName }
          });
          topicObjects.push({ id: topic.id });
        }

        // Create the question
        await prisma.question.create({
          data: {
            title: record.title,
            url: record.url,
            difficulty: record.difficulty.toUpperCase(),
            company: record.company,
            timeline: record.timeline.toUpperCase(),
            topics: {
              connect: topicObjects
            },
            createdById: session.user.id,
          }
        });
        importedCount++;
      } catch (error) {
        console.error(`Error importing question: ${record.title}`, error);
        // Continue with next record instead of failing the entire import
      }
    }

    return NextResponse.json({ 
      message: 'CSV import completed', 
      imported: importedCount,
      total: records.length
    }, { status: 200 });

  } catch (error) {
    console.error("CSV import error:", error);
    return NextResponse.json({ 
      message: 'Error processing CSV file'  
    }, { status: 500 });
  }
}
