import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { action, loginMethod, identifier, password, otp } = await request.json();

    if (!identifier) {
      return NextResponse.json({ error: 'Email or Phone number is required' }, { status: 400 });
    }

    // 1. Send OTP Flow
    if (action === 'SEND_OTP') {
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: identifier },
            { phone: identifier }
          ]
        }
      });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({
        message: 'OTP sent (Simulated)',
        otp: '123456'
      });
    }

    // 2. Perform Login Flow
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phone: identifier }
        ]
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (loginMethod === 'OTP') {
      if (otp !== '123456') {
        return NextResponse.json({ error: 'Invalid OTP. Use 123456 for testing.' }, { status: 401 });
      }
    } else {
      if (!password) {
        return NextResponse.json({ error: 'Password is required' }, { status: 400 });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
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
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
