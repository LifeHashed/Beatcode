const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Map difficulty strings to enum values (fixed to match schema)
const difficultyMap = {
  'EASY': 'EASY',
  'MEDIUM': 'MEDIUM', 
  'HARD': 'HARD',
  'Easy': 'EASY',
  'Medium': 'MEDIUM',
  'Hard': 'HARD'
};

// Map the time periods from the CSV to the Timeline enum in the schema
const timelineMap = {
  'Thirty Days': 'THIRTY_DAYS',
  'Three Months': 'THREE_MONTHS',
  'Six Months': 'SIX_MONTHS',
  'More Than Six Months': 'MORE_THAN_SIX_MONTHS',
  'All': 'OLD',
};

async function importQuestions() {
  console.log('Starting question import from cleaned CSV...');
  
  try {
    const csvFilePath = path.join(__dirname, '..', 'cleaned_combined_questions.csv');
    
    if (!fs.existsSync(csvFilePath)) {
      console.error(`Error: CSV file not found at ${csvFilePath}`);
      console.log('Make sure you have placed cleaned_combined_questions.csv in the project root directory.');
      return;
    }

    console.log(`Reading from: ${csvFilePath}`);
    
    const questions = [];
    const uniqueQuestions = new Map();
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row) => {
          // Skip empty or malformed entries
          if (!row.Difficulty || !row.Title || !row.Link || !row.Company) {
            console.warn(`Skipping malformed entry: ${row.Title || 'No title'}`);
            return;
          }
          
          // Parse topics - store as comma-separated string
          let topics = '';
          if (row.Topics) {
            const topicsString = row.Topics.replace(/^"/, '').replace(/"$/, '');
            const topicsArray = topicsString.split(',').map(topic => topic.trim()).filter(topic => topic);
            topics = topicsArray.join(', '); // Store as comma-separated string
          }
          
          // Map difficulty and timeline with validation
          const difficulty = difficultyMap[row.Difficulty];
          if (!difficulty) {
            console.warn(`Invalid difficulty "${row.Difficulty}" for question: ${row.Title}`);
            return;
          }
          
          const timeline = timelineMap[row['Time Period']] || 'OLD';
          
          // Parse frequency and acceptance rate with proper validation
          let frequency = null;
          if (row.Frequency) {
            const freq = parseFloat(row.Frequency);
            if (!isNaN(freq)) {
              frequency = freq > 1 ? freq / 100 : freq; // Convert percentage if needed
            }
          }
          
          let acceptance = null;
          if (row['Acceptance Rate']) {
            const acc = parseFloat(row['Acceptance Rate']);
            if (!isNaN(acc)) {
              acceptance = acc;
            }
          }
          
          // Validate and clean the link
          const link = row.Link.trim();
          if (!link.startsWith('http')) {
            console.warn(`Invalid link for question: ${row.Title}`);
            return;
          }
          
          // Create unique key to avoid duplicates
          const uniqueKey = `${row.Title.trim()}|${link}`;
          
          if (!uniqueQuestions.has(uniqueKey)) {
            const questionData = {
              title: row.Title.trim(),
              difficulty,
              frequency,
              acceptance,
              link,
              topics, // Now stored as comma-separated string
              company: row.Company.trim(),
              timeline,
              description: row.Description ? row.Description.trim() : null,
              leetcodeLink: row.LeetcodeLink ? row.LeetcodeLink.trim() : null
            };
            
            questions.push(questionData);
            uniqueQuestions.set(uniqueKey, questionData);
          }
        })
        .on('end', () => {
          console.log(`Parsed ${questions.length} unique questions from CSV`);
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    });
    
    // Batch create questions with better error handling
    let createdCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Process in smaller batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize);
      
      for (const questionData of batch) {
        try {
          // Check if question already exists by title (unique constraint)
          const existingQuestion = await prisma.question.findUnique({
            where: { title: questionData.title }
          });

          if (existingQuestion) {
            skippedCount++;
            continue;
          }

          // Create the question
          await prisma.question.create({
            data: {
              title: questionData.title,
              difficulty: questionData.difficulty,
              frequency: questionData.frequency,
              acceptance: questionData.acceptance,
              link: questionData.link,
              topics: questionData.topics,
              company: questionData.company,
              timeline: questionData.timeline,
              description: questionData.description,
              leetcodeLink: questionData.leetcodeLink
            }
          });

          createdCount++;
        } catch (error) {
          errorCount++;
          if (error.code === 'P2002') {
            // Unique constraint violation
            console.warn(`Duplicate question skipped: ${questionData.title}`);
            skippedCount++;
          } else {
            console.error(`Error creating question "${questionData.title}":`, error.message);
          }
        }
      }
      
      // Progress logging
      if ((i + batchSize) % 500 === 0 || i + batchSize >= questions.length) {
        console.log(`Processed ${Math.min(i + batchSize, questions.length)}/${questions.length} questions...`);
      }
    }
    
    console.log(`\nImport completed!`);
    console.log(`  Created: ${createdCount} new questions`);
    console.log(`  Skipped: ${skippedCount} existing/duplicate questions`);
    console.log(`  Errors: ${errorCount} questions failed to import`);
    console.log(`  Total processed: ${questions.length} questions`);
    
  } catch (error) {
    console.error('Error importing questions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import function
async function main() {
  try {
    await importQuestions();
    console.log('\nQuestion import completed successfully!');
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

main();
