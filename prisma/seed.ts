import { PrismaClient, UserRole, QuestionDifficulty, Timeline } from '@prisma/client';
import * as bcryptjs from 'bcryptjs'; // Changed from bcrypt to bcryptjs

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.userProgress.deleteMany();
    await prisma.question.deleteMany();
    await prisma.user.deleteMany();

    // Create Super Admin
    console.log('👑 Creating Super Admin...');
    const superAdmin = await prisma.user.create({
      data: {
        email: process.env.SUPER_ADMIN_EMAIL || 'superadmin@beatcode.com',
        username: process.env.SUPER_ADMIN_USERNAME || 'superadmin',
        name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
        password: await bcryptjs.hash(process.env.SUPER_ADMIN_PASSWORD || 'Admin@123', 12), // Changed from bcrypt to bcryptjs
        role: UserRole.SUPER_ADMIN,
        emailVerified: new Date(),
      },
    });
    console.log(`✅ Super Admin created: ${superAdmin.email}`);

    // Create Admin
    console.log('🔧 Creating Admin...');
    const admin = await prisma.user.create({
      data: {
        email: process.env.ADMIN_EMAIL || 'admin@beatcode.com',
        username: process.env.ADMIN_USERNAME || 'admin',
        name: process.env.ADMIN_NAME || 'Admin User',
        password: await bcryptjs.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 12), // Changed from bcrypt to bcryptjs
        role: UserRole.ADMIN,
        emailVerified: new Date(),
      },
    });
    console.log(`✅ Admin created: ${admin.email}`);

    // Create sample questions (only fields that exist in schema)
    console.log('📚 Creating sample questions...');
    const questions = [
      {
        title: 'Two Sum',
        difficulty: QuestionDifficulty.EASY,
        link: 'https://leetcode.com/problems/two-sum/',
        topics: 'Array,Hash Table',
        company: 'Google,Amazon',
        timeline: Timeline.OLD,
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        leetcodeLink: 'https://leetcode.com/problems/two-sum/',
        addedById: superAdmin.id,
      },
      {
        title: 'Reverse Linked List',
        difficulty: QuestionDifficulty.EASY,
        link: 'https://leetcode.com/problems/reverse-linked-list/',
        topics: 'Linked List,Recursion',
        company: 'Facebook,Microsoft,Apple',
        timeline: Timeline.OLD,
        description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
        leetcodeLink: 'https://leetcode.com/problems/reverse-linked-list/',
        addedById: admin.id,
      },
      {
        title: 'Valid Parentheses',
        difficulty: QuestionDifficulty.EASY,
        link: 'https://leetcode.com/problems/valid-parentheses/',
        topics: 'String,Stack',
        company: 'Google,Amazon,Facebook',
        timeline: Timeline.OLD,
        description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
        leetcodeLink: 'https://leetcode.com/problems/valid-parentheses/',
        addedById: superAdmin.id,
      },
      {
        title: 'Add Two Numbers',
        difficulty: QuestionDifficulty.MEDIUM,
        link: 'https://leetcode.com/problems/add-two-numbers/',
        topics: 'Linked List,Math,Recursion',
        company: 'Amazon,Microsoft,Apple',
        timeline: Timeline.OLD,
        description: 'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each node contains a single digit.',
        leetcodeLink: 'https://leetcode.com/problems/add-two-numbers/',
        addedById: admin.id,
      }
    ];

    let questionsCreated = 0;
    for (const questionData of questions) {
      try {
        await prisma.question.create({
          data: questionData,
        });
        questionsCreated++;
        console.log(`✅ Question created: ${questionData.title}`);
      } catch (error) {
        console.error(`Failed to create question: ${questionData.title}`, error);
      }
    }

    console.log(`📝 Created ${questionsCreated} sample questions`);
    console.log('🎉 Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Super Admin:');
    console.log(`  Email: ${superAdmin.email}`);
    console.log(`  Username: ${superAdmin.username}`);
    console.log(`  Password: ${process.env.SUPER_ADMIN_PASSWORD || 'Admin@123'}`);
    console.log('\nAdmin:');
    console.log(`  Email: ${admin.email}`);
    console.log(`  Username: ${admin.username}`);
    console.log(`  Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
