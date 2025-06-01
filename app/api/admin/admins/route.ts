import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication and authorization
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Get all admins
    const admins = await db.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN']
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check authentication and authorization
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Parse request body
    const body = await request.json();
    const { name, email, username, password } = body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }
    
    // Check if user already exists by email
    const existingUser = await db.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }
    
    // Check if username already exists (if provided)
    if (username) {
      const existingUsername = await db.user.findUnique({
        where: { username }
      });
      
      if (existingUsername) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
      }
    }
    
    // Hash password
    const hashedPassword = await hash(password, 12);
    
    // Create new admin
    const newAdmin = await db.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
        role: 'ADMIN'
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    
    return NextResponse.json(newAdmin);
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
