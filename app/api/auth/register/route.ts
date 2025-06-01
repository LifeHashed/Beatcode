import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { name, username, email, password } = await req.json();

    // Basic validation
    if (!name?.trim() || !username?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        {
          error:
            'Username can only contain letters, numbers, and underscores',
        },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists by email
    const existingUserByEmail = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUserByUsername = await db.user.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (existingUserByUsername) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await db.user.create({
      data: {
        name: name.trim(),
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'USER',
      },
    });

    // Don't include password in response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    // Handle Prisma unique constraint errors
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      if (error.message.includes('email')) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        );
      }
      if (error.message.includes('username')) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
