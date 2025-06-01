const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const execAsync = promisify(exec);

async function setupDatabase() {
  console.log('🚀 Starting complete database setup...');
  
  try {
    // 1. Clean any existing database connections
    console.log('🧹 Cleaning existing connections...');
    try {
      await execAsync('npx prisma db push --force-reset');
    } catch (error) {
      console.log('Note: Database may not exist yet, continuing...');
    }

    // 2. Check if .env file exists
    const envPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) {
      console.log('📝 Creating .env file...');
      const envContent = `DATABASE_URL="postgresql://postgres:123456@localhost:5432/beatcode?schema=public"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
SUPER_ADMIN_EMAIL="superadmin@beatcode.com"
SUPER_ADMIN_PASSWORD="Admin@123"
SUPER_ADMIN_NAME="Super Admin"
SUPER_ADMIN_USERNAME="superadmin"
ADMIN_EMAIL="admin@beatcode.com"
ADMIN_PASSWORD="Admin@123"
ADMIN_NAME="Admin User"
ADMIN_USERNAME="admin"`;
      fs.writeFileSync(envPath, envContent);
      console.log('✅ .env file created');
    }

    // 3. Generate Prisma client
    console.log('⚙️ Generating Prisma client...');
    await execAsync('npx prisma generate');
    console.log('✅ Prisma client generated');

    // 4. Push schema (creates database if not exists)
    console.log('📋 Pushing schema...');
    await execAsync('npx prisma db push --force-reset');
    console.log('✅ Schema pushed');

    // 5. Run seed
    console.log('🌱 Seeding database...');
    await execAsync('npm run prisma:seed');
    console.log('✅ Database seeded');

    // 6. Generate additional users
    console.log('👥 Generating sample users...');
    await execAsync('node scripts/generateUsers.js');
    console.log('✅ Sample users created');

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📊 You can now run:');
    console.log('   npm run dev              - Start development server');
    console.log('   npm run prisma:studio    - Open Prisma Studio');
    console.log('   npm run import-questions - Import questions from CSV');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.log('\n🔧 Manual setup commands:');
    console.log('   npx prisma generate');
    console.log('   npx prisma db push --force-reset');
    console.log('   npm run prisma:seed');
  }
}

setupDatabase();
