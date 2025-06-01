import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Debug logging to see what we're getting
    console.log('Session:', session);
    console.log('User role:', session?.user?.role);
    
    if (!session) {
      return NextResponse.json(
        { message: 'No session found. Please sign in.' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: `Unauthorized. Super admin access required. Current role: ${session.user.role}` },
        { status: 403 }
      );
    }

    const { email, name, password, role, username } = await request.json();

    // Validate input
    if (!email || !name || !password) {
      return NextResponse.json(
        { message: 'Email, name and password are required' },
        { status: 400 }
      );
    }

    const roleValue = role || 'ADMIN'; // Default to ADMIN if not specified
    
    if (!['ADMIN', 'SUPER_ADMIN'].includes(roleValue)) {
      return NextResponse.json(
        { message: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Check if user already exists by email
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Check if username already exists (if provided)
    if (username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username }
      });

      if (existingUsername) {
        return NextResponse.json(
          { message: 'Username already taken' },
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create admin user with optional username
    const newAdmin = await prisma.user.create({
      data: {
        email,
        name,
        username, // Include username if provided
        password: hashedPassword,
        role: roleValue,
        // Removed emailVerified field - let it be null by default
      },
    });

    // Remove password from response
    const { password: _, ...adminData } = newAdmin;

    return NextResponse.json({
      message: 'Admin created successfully',
      admin: adminData
    });

  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { message: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
