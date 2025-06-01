const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env' });

const prisma = new PrismaClient();

async function initAdmins() {
  try {
    console.log('🔧 Initializing admin users...');

    // Super Admin credentials from environment or defaults
    const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'superadmin@beatcode.com';
    const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';
    const SUPER_ADMIN_NAME = process.env.SUPER_ADMIN_NAME || 'Super Admin';
    const SUPER_ADMIN_USERNAME = process.env.SUPER_ADMIN_USERNAME || 'superadmin';

    // Regular Admin credentials
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@beatcode.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
    const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin User';
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';

    // Create or update Super Admin
    const hashedSuperAdminPassword = await bcrypt.hash(SUPER_ADMIN_PASSWORD, 10);
    
    const superAdmin = await prisma.user.upsert({
      where: { email: SUPER_ADMIN_EMAIL },
      update: {
        password: hashedSuperAdminPassword,
        role: 'SUPER_ADMIN'
      },
      create: {
        name: SUPER_ADMIN_NAME,
        username: SUPER_ADMIN_USERNAME,
        email: SUPER_ADMIN_EMAIL,
        password: hashedSuperAdminPassword,
        role: 'SUPER_ADMIN'
      },
    });

    console.log('✅ Super Admin initialized:');
    console.log(`   Email: ${SUPER_ADMIN_EMAIL}`);
    console.log(`   Username: ${SUPER_ADMIN_USERNAME}`);
    console.log(`   Password: ${SUPER_ADMIN_PASSWORD}`);
    console.log(`   ID: ${superAdmin.id}`);

    // Create or update Regular Admin
    const hashedAdminPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    
    const admin = await prisma.user.upsert({
      where: { email: ADMIN_EMAIL },
      update: {
        password: hashedAdminPassword,
        role: 'ADMIN'
      },
      create: {
        name: ADMIN_NAME,
        username: ADMIN_USERNAME,
        email: ADMIN_EMAIL,
        password: hashedAdminPassword,
        role: 'ADMIN'
      },
    });

    console.log('✅ Admin initialized:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Username: ${ADMIN_USERNAME}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   ID: ${admin.id}`);

    console.log('\n🎉 Admin initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing admins:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  initAdmins()
    .then(() => {
      console.log('Admin initialization completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Admin initialization failed:', error);
      process.exit(1);
    });
}

module.exports = initAdmins;
