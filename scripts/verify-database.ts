import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

async function verifyDatabaseConnection() {
  console.log('Verifying database connection...');
  console.log(`DATABASE_URL environment variable: ${process.env.DATABASE_URL?.substring(0, 20)}...`);
  
  try {
    const prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
    
    // Test the connection by executing a simple query
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    console.log('Database connection successful!', result);
    
    // Check for admin users
    const adminCount = await prisma.user.count({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN']
        }
      }
    });
    
    console.log(`Found ${adminCount} admin user(s) in the database`);
    
    if (adminCount > 0) {
      const admins = await prisma.user.findMany({
        where: {
          role: {
            in: ['ADMIN', 'SUPER_ADMIN']
          }
        },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          name: true
        }
      });
      
      console.log('Admin users:');
      admins.forEach(admin => {
        console.log(`  - ${admin.role}: ${admin.email} (${admin.username})`);
      });
    }
    
    // Check if schema.prisma file exists and has correct format
    const schemaPath = './prisma/schema.prisma';
    if (fs.existsSync(schemaPath)) {
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      console.log('Schema file exists. Checking for database provider...');
      
      if (schemaContent.includes('provider = "postgresql"')) {
        console.log('Schema appears to have correct provider configuration.');
      } else {
        console.warn('Schema might not have the correct provider configuration. Please check schema.prisma file.');
      }
    } else {
      console.error('Schema file not found at expected location:', schemaPath);
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Database connection failed:', error);
    console.log('\nTroubleshooting tips:');
    console.log('1. Ensure PostgreSQL is running on localhost:5432');
    console.log('2. Check if the "beatcode" database exists');
    console.log('3. Verify your username/password: postgres/123456');
    console.log('4. Make sure your schema.prisma file has the provider set to "postgresql"');
    console.log('5. Try running: npx prisma db push');
    console.log('6. If still failing, try: npx prisma migrate dev --name init');
    console.log('7. Run: npm run seed to create admin users');
  }
}

verifyDatabaseConnection().catch(console.error);
