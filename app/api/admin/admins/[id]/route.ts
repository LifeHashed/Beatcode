import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const adminId = parseInt(context.params.id);

    // Check if admin exists
    const existingAdmin = await db.user.findUnique({
      where: { id: adminId }
    });

    if (!existingAdmin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Prevent deletion of super admin
    if (existingAdmin.role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Cannot delete super admin' }, { status: 400 });
    }

    // Delete the admin
    await db.user.delete({
      where: { id: adminId }
    });

    return NextResponse.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const adminId = parseInt(context.params.id);
    const body = await request.json();
    const { name, email, username, password } = body;

    // Check if admin exists
    const existingAdmin = await db.user.findUnique({
      where: { id: adminId }
    });

    if (!existingAdmin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      username,
    };

    // Only update password if provided
    if (password) {
      updateData.password = await hash(password, 12);
    }

    // Check for email uniqueness (if changed)
    if (email !== existingAdmin.email) {
      const emailExists = await db.user.findUnique({
        where: { email }
      });
      
      if (emailExists) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }
    }

    // Check for username uniqueness (if changed)
    if (username && username !== existingAdmin.username) {
      const usernameExists = await db.user.findUnique({
        where: { username }
      });
      
      if (usernameExists) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
      }
    }

    // Update the admin
    const updatedAdmin = await db.user.update({
      where: { id: adminId },
      data: updateData,
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

    return NextResponse.json(updatedAdmin);
  } catch (error) {
    console.error('Error updating admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
