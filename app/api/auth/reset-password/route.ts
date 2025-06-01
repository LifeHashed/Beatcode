import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Find the reset token
    const passwordReset = await db.passwordReset.findFirst({
      where: {
        token,
        expires: {
          gt: new Date(), // Token must not be expired
        },
      },
      include: {
        user: true,
      },
    });

    if (!passwordReset) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await hash(password, 12);

    // Update the user's password
    await db.user.update({
      where: { id: passwordReset.userId },
      data: { password: hashedPassword },
    });

    // Delete the used token
    await db.passwordReset.delete({
      where: { id: passwordReset.id },
    });

    return NextResponse.json(
      { message: 'Password reset successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { message: 'An error occurred while resetting your password' },
      { status: 500 }
    );
  }
}
