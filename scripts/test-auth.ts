import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Verification function that matches the NextAuth logic
async function verifyCredentials(emailOrUsername: string, password: string) {
  try {
    const isEmail = emailOrUsername.includes('@');
    
    const user = await prisma.user.findFirst({
      where: isEmail 
        ? { email: emailOrUsername.toLowerCase() } 
        : { username: emailOrUsername.toLowerCase() }
    });
    
    if (!user || !user.password) {
      return null;
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    return passwordMatch ? user : null;
  } catch (error) {
    console.error('Verification error:', error);
    return null;
  }
}

async function testAuth() {
  console.log('🧪 Testing authentication system...\n');

  try {
    // Test 1: Check if test users exist
    console.log('📋 Test 1: Checking test users...');
    
    const testCredentials = [
      { email: 'superadmin@beatcode.com', password: 'Admin@123' },
      { email: 'admin@beatcode.com', password: 'Admin@123' },
      { email: 'superadmin', password: 'Admin@123' },
      { email: 'admin', password: 'Admin@123' }
    ];

    for (const cred of testCredentials) {
      console.log(`\n🔍 Testing: ${cred.email}`);
      
      // Direct database lookup
      const isEmail = cred.email.includes('@');
      const user = await prisma.user.findFirst({
        where: isEmail 
          ? { email: cred.email.toLowerCase() }
          : { username: cred.email.toLowerCase() }
      });

      if (user) {
        console.log(`  ✅ User found: ${user.email} (${user.role})`);
        
        if (user.password) {
          const isValidPassword = await bcrypt.compare(cred.password, user.password);
          console.log(`  🔑 Password valid: ${isValidPassword ? '✅' : '❌'}`);
          
          if (isValidPassword) {
            // Test the verifyCredentials function
            const authResult = await verifyCredentials(cred.email, cred.password);
            console.log(`  🔐 Auth function: ${authResult ? '✅' : '❌'}`);
          }
        } else {
          console.log(`  ❌ No password set for user`);
        }
      } else {
        console.log(`  ❌ User not found`);
      }
    }

    console.log('\n✅ Authentication test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAuth().catch(console.error);

export default testAuth;
