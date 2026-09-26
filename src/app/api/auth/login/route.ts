import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { createAndSendOtp, verifyOtp, isRateLimited } from '@/lib/otp';

export async function POST(request: Request) {
  try {
    const { action, loginMethod, identifier, password, otp } = await request.json();

    if (!identifier) {
      return NextResponse.json({ error: 'Email or Phone number is required' }, { status: 400 });
    }

    const trimmedIdentifier = identifier.trim();

    // 1. Send OTP Flow
    if (action === 'SEND_OTP') {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: trimmedIdentifier },
            { phone: trimmedIdentifier }
          ]
        }
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found with this email or phone number. Please register first.' }, { status: 404 });
      }

      // Rate limiting check (1 OTP request per 60 seconds per identifier)
      const rateLimited = await isRateLimited(trimmedIdentifier);
      if (rateLimited) {
        return NextResponse.json(
          { error: 'Please wait 60 seconds before requesting another verification code.' },
          { status: 429 }
        );
      }

      try {
        await createAndSendOtp(trimmedIdentifier);
        return NextResponse.json({
          message: 'Verification code sent to your registered contact. Please check your inbox or SMS.',
        });
      } catch (sendError: any) {
        console.error('OTP delivery error:', sendError);
        return NextResponse.json(
          { error: sendError.message || 'Failed to deliver verification code. Please try again later.' },
          { status: 500 }
        );
      }
    }

    // 2. Perform Login Flow
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: trimmedIdentifier },
          { phone: trimmedIdentifier }
        ]
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found. Please check your credentials or register.' }, { status: 404 });
    }

    if (loginMethod === 'OTP') {
      if (!otp) {
        return NextResponse.json({ error: 'Please enter the 6-digit OTP code.' }, { status: 400 });
      }

      const isValid = await verifyOtp(trimmedIdentifier, otp);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid or expired OTP. Please enter a valid code or request a new one.' },
          { status: 401 }
        );
      }
    } else {
      if (!password) {
        return NextResponse.json({ error: 'Password is required' }, { status: 400 });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'Invalid password. Please check your password.' }, { status: 401 });
      }
    }

    // Sign JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      gender: user.gender,
      name: user.name,
    });

    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        gender: user.gender,
      },
    });

    // Set HTTP-only Cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login route error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
