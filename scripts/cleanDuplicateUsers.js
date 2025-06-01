const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanDuplicateUsers() {
  try {
    console.log('🔍 Checking for duplicate users...');

    // Find duplicate emails
    const duplicateEmails = await prisma.user.groupBy({
      by: ['email'],
      having: {
        email: {
          _count: {
            gt: 1
          }
        }
      },
      _count: {
        email: true
      }
    });

    // Find duplicate usernames
    const duplicateUsernames = await prisma.user.groupBy({
      by: ['username'],
      having: {
        username: {
          _count: {
            gt: 1
          }
        }
      },
      _count: {
        username: true
      }
    });

    console.log(`Found ${duplicateEmails.length} duplicate emails`);
    console.log(`Found ${duplicateUsernames.length} duplicate usernames`);

    // Remove duplicates (keep the first one, remove others)
    for (const duplicate of duplicateEmails) {
      const users = await prisma.user.findMany({
        where: { email: duplicate.email },
        orderBy: { createdAt: 'asc' }
      });

      const usersToDelete = users.slice(1); // Keep first, delete rest
      
      for (const user of usersToDelete) {
        await prisma.user.delete({ where: { id: user.id } });
        console.log(`Deleted duplicate user: ${user.email} (ID: ${user.id})`);
      }
    }

    for (const duplicate of duplicateUsernames) {
      const users = await prisma.user.findMany({
        where: { username: duplicate.username },
        orderBy: { createdAt: 'asc' }
      });

      const usersToDelete = users.slice(1); // Keep first, delete rest
      
      for (const user of usersToDelete) {
        await prisma.user.delete({ where: { id: user.id } });
        console.log(`Deleted duplicate username: ${user.username} (ID: ${user.id})`);
      }
    }

    console.log('✅ Duplicate cleanup completed');

  } catch (error) {
    console.error('❌ Error cleaning duplicates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  cleanDuplicateUsers()
    .then(() => {
      console.log('Cleanup completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = cleanDuplicateUsers;
