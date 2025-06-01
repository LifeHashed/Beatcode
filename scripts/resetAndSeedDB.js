const { PrismaClient } = require('@prisma/client');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function resetAndSeedDB() {
  let prisma;
  
  try {
    console.log('🔄 Starting database reset and seed process...');
    
    console.log('📊 Resetting database...');
    try {
      // Force reset and push schema
      const { stdout: resetOut, stderr: resetErr } = await execAsync('npx prisma migrate reset --force');
      if (resetErr) console.log('Reset warnings:', resetErr);
      console.log(resetOut);
      
      // Generate Prisma client
      console.log('🔧 Generating Prisma client...');
      const { stdout: genOut, stderr: genErr } = await execAsync('npx prisma generate');
      if (genErr) console.log('Generate warnings:', genErr);
      console.log(genOut);
      
      // Push schema to ensure all columns exist
      console.log('📋 Pushing schema to database...');
      const { stdout: pushOut, stderr: pushErr } = await execAsync('npx prisma db push --force-reset');
      if (pushErr) console.log('Push warnings:', pushErr);
      console.log(pushOut);
      
    } catch (error) {
      console.error('❌ Error resetting database:', error.message);
      return;
    }
    
    console.log('⚙️ Initializing Prisma client...');
    try {
      // Test if Prisma client is working
      prisma = new PrismaClient();
      await prisma.$connect();
      console.log('✅ Prisma client is ready');
      
      // Test database connectivity
      const userCount = await prisma.user.count();
      console.log(`✅ Database connected. Current user count: ${userCount}`);
      
    } catch (error) {
      console.log('❌ Prisma client error:', error.message);
      console.log('Please run manually:');
      console.log('   npx prisma generate');
      console.log('   npx prisma db push');
      console.log('Then re-run this script.');
      return;
    }
    
    console.log('🌱 Running database seed...');
    try {
      const { stdout, stderr } = await execAsync('npx prisma db seed');
      if (stderr) console.log('Seed warnings:', stderr);
      console.log(stdout);
    } catch (error) {
      console.error('❌ Error running seed:', error.message);
      console.log('Trying alternative seed method...');
      try {
        const { stdout, stderr } = await execAsync('npx ts-node prisma/seed.ts');
        if (stderr) console.log('Alt seed warnings:', stderr);
        console.log(stdout);
      } catch (altError) {
        console.error('❌ Alternative seed also failed:', altError.message);
      }
    }
    
    console.log('📚 Importing additional questions...');
    try {
      const { stdout, stderr } = await execAsync('node ./scripts/importQuestions.js');
      if (stderr) console.log('Import warnings:', stderr);
      console.log(stdout);
    } catch (error) {
      console.log('⚠️ Questions import failed (this is optional):', error.message);
    }
    
    // Verify admin users
    console.log('🔍 Verifying admin users...');
    const adminUsers = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN']
        }
      },
      select: {
        email: true,
        username: true,
        role: true
      }
    });
    
    console.log('👑 Admin users created:');
    adminUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.username}) - ${user.role}`);
    });
    
    console.log('🎉 Database setup completed successfully!');
    console.log('🌐 Opening Prisma Studio...');
    
    // Open Prisma Studio in a non-blocking way
    exec('npx prisma studio', (error) => {
      if (error) {
        console.log('💡 You can manually open Prisma Studio with: npx prisma studio');
      }
    });
    
  } catch (error) {
    console.error('❌ Error in reset and seed process:', error);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// Run the reset and seed process
resetAndSeedDB();
