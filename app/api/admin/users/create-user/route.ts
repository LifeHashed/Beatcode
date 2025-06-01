import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { message: 'No session found. Please sign in.' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: `Unauthorized. Admin access required. Current role: ${session.user.role}` },
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

    const roleValue = role || 'USER'; // Default to USER if not specified
    
    if (!['USER', 'ADMIN', 'SUPER_ADMIN'].includes(roleValue)) {
      return NextResponse.json(
        { message: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Only super admins can create other super admins
    if (roleValue === 'SUPER_ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { message: 'Only super admins can create super admin accounts' },
        { status: 403 }
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

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        username,
        password: hashedPassword,
        role: roleValue,
      },
    });

    // Remove password from response
    const { password: _, ...userData } = newUser;

    return NextResponse.json({
      message: 'User created successfully',
      user: userData
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
