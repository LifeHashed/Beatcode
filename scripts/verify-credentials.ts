import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyCredentials() {
  console.log('🔍 Verifying admin credentials...\n');

  try {
    // Test Super Admin
    const superAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'superadmin@beatcode.com' },
          { username: 'superadmin' }
        ]
      }
    });

    if (superAdmin) {
      const isValidPassword = await bcrypt.compare('Admin@123', superAdmin.password!);
      console.log('👑 Super Admin:');
      console.log(`   ID: ${superAdmin.id}`);
      console.log(`   Email: ${superAdmin.email}`);
      console.log(`   Username: ${superAdmin.username}`);
      console.log(`   Role: ${superAdmin.role}`);
      console.log(`   Password Valid: ${isValidPassword ? '✅' : '❌'}`);
    } else {
      console.log('❌ Super Admin not found');
    }

    console.log('');

    // Test Admin
    const admin = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'admin@beatcode.com' },
          { username: 'admin' }
        ]
      }
    });

    if (admin) {
      const isValidPassword = await bcrypt.compare('Admin@123', admin.password!);
      console.log('🔧 Admin:');
      console.log(`   ID: ${admin.id}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Password Valid: ${isValidPassword ? '✅' : '❌'}`);
    } else {
      console.log('❌ Admin not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  verifyCredentials()
    .then(() => {
      console.log('\n✅ Credential verification completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Verification failed:', error);
      process.exit(1);
    });
}

export default verifyCredentials;
