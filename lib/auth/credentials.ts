import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const credentialsConfig = CredentialsProvider({
  name: 'credentials',
  credentials: {
    email: { label: 'Email', type: 'email' },
    password: { label: 'Password', type: 'password' },
  },
  async authorize(credentials) {
    // Fix: Accept both email and username, and handle null username/email gracefully
    if (!credentials?.email || !credentials?.password) {
      console.log('Missing credentials');
      return null;
    }

    try {
      // Accept login by email or username (case-insensitive)
      const input = credentials.email.trim().toLowerCase();
      const isEmail = input.includes('@');
      const user = await prisma.user.findFirst({
        where: isEmail
          ? { email: input }
          : {
              OR: [
                { username: input },
                { email: input },
              ],
            },
      });

      if (!user || !user.password) {
        console.log('User not found or no password set:', input);
        return null;
      }

      const isPasswordValid = await compare(credentials.password, user.password);
      if (!isPasswordValid) {
        console.log('Invalid password for user:', input);
        return null;
      }

      console.log('User authenticated successfully:', user.email, 'Role:', user.role);
      return {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        username: user.username,
        image: user.image,
      };
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  },
});

export async function verifyCredentials(email: string, password: string) {
  if (!email || !password) {
    console.log('Missing credentials');
    return null;
  }

  try {
    // Check if input is email or username
    const isEmail = email.includes('@');
    
    const user = await prisma.user.findUnique({
      where: isEmail 
        ? { email: email.toLowerCase() }
        : { username: email.toLowerCase() }
    });

    if (!user || !user.password) {
      console.log('User not found or no password set:', email);
      return null;
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return null;
    }

    console.log('User authenticated successfully:', user.email, 'Role:', user.role);
    return {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      username: user.username,
      image: user.image,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}
