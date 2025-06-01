const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Sample user data
const usersData = [
  {
    email: 'user@1.com',
    name: 'User 1',
    username: 'user1',
    role: 'USER',
    password: '123456'
  },
  {
    email: 'user@2.com',
    name: 'User 2',
    username: 'user2',
    role: 'USER',
    password: '123456'
  },
  {
    email: 'user@3.com',
    name: 'User 3',
    username: 'user3',
    role: 'USER',
    password: '123456'
  },
  {
    email: 'user@4.com',
    name: 'User 4',
    username: 'user4',
    role: 'USER',
    password: '123456'
  },
  {
    email: 'user@5.com',
    name: 'User 5',
    username: 'user5',
    role: 'ADMIN',
    password: '123456'
  }
];

async function generateUsers() {
  console.log('Starting user generation...');
  
  try {
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const userData of usersData) {
      try {
        // Check if user already exists by email or username
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              { email: userData.email },
              { username: userData.username }
            ]
          }
        });

        if (existingUser) {
          console.log(`User ${userData.email} (${userData.username}) already exists, skipping...`);
          skippedCount++;
          continue;
        }

        // Hash the password before creating user
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create new user with username
        const newUser = await prisma.user.create({
          data: {
            email: userData.email,
            name: userData.name,
            username: userData.username,
            role: userData.role,
            password: hashedPassword
          }
        });

        console.log(`Created user: ${newUser.name} (${newUser.email}) @${newUser.username}`);
        createdCount++;
      } catch (error) {
        console.error(`Error creating user ${userData.email}:`, error.message);
      }
    }
    
    console.log(`\nUser generation completed!`);
    console.log(`  Created: ${createdCount} new users`);
    console.log(`  Skipped: ${skippedCount} existing users`);
    console.log(`  Total processed: ${usersData.length} users`);
    
  } catch (error) {
    console.error('Error generating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the generation function
async function main() {
  try {
    await generateUsers();
    console.log('\nUser generation completed successfully!');
  } catch (error) {
    console.error('Generation failed:', error);
    process.exit(1);
  }
}

main();
