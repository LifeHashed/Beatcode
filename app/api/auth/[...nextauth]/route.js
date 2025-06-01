import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { compare } from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email/Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Improved error handling
        try {
          console.log('🔐 Starting authentication for:', credentials?.email);
          
          if (!credentials?.email || !credentials?.password) {
            console.log('❌ Missing credentials');
            return null;
          }
          
          // Check if input is email or username
          const isEmail = credentials.email.includes('@');
          console.log('📧 Is email format:', isEmail);
          
          // Find user by email or username
          const user = await prisma.user.findFirst({
            where: isEmail 
              ? { email: credentials.email.toLowerCase() } 
              : { username: credentials.email.toLowerCase() }
          });
          
          if (!user) {
            console.log('❌ No user found for:', credentials.email);
            return null;
          }
          
          console.log('✅ User found:', user.email, 'Role:', user.role);
          
          // Check if user has a password set
          if (!user.password) {
            console.log('❌ No password set for user:', user.email);
            return null;
          }
          
          // Check if password matches - using 'password' field from schema
          const passwordMatch = await compare(credentials.password, user.password);
          
          if (!passwordMatch) {
            console.log('❌ Password does not match for user:', user.email);
            return null;
          }
          
          console.log('✅ Authentication successful for:', user.email);
          
          // Return user object without password
          return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role,
            image: user.image
          };
        } catch (error) {
          console.error('❌ Authentication error:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    signOut: '/auth/signout',
  },
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Pass additional user properties to the token
      if (user) {
        token.id = user.id;
        token.role = user.role || 'USER';
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      // Pass token properties to the session
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.username = token.username;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
});

export { handler as GET, handler as POST };
