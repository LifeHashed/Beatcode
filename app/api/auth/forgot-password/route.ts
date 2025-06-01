import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email },
    });

    // For security reasons, don't reveal whether the email exists
    if (!user) {
      // We return a success response even if the user doesn't exist
      // This prevents email enumeration attacks
      return NextResponse.json(
        { message: 'If your email exists in our system, you will receive a password reset link' },
        { status: 200 }
      );
    }

    // Generate a reset token
    const resetToken = randomUUID();
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1); // Token valid for 1 hour

    // Store the token in the database
    await db.passwordReset.upsert({
      where: { userId: user.id },
      update: {
        token: resetToken,
        expires: tokenExpiry,
      },
      create: {
        userId: user.id,
        token: resetToken,
        expires: tokenExpiry,
      },
    });

    // In a real application, you would send an email with a reset link
    // For now, we'll just log it (you should integrate with an email service)
    console.log(`Password reset link for ${email}: ${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`);

    return NextResponse.json(
      { message: 'If your email exists in our system, you will receive a password reset link' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
