import { NextResponse, NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { getUserFromRequest, signToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        gender: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Fetch profile error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, gender, currentPassword, newPassword } = body;

    // Check if email already exists if changed
    if (email && email !== payload.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });
      if (emailExists) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }
    }

    // Get user details
    const dbUser = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let hashedPassword = dbUser.password;

    // If updating password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 });
      }
      const isPasswordValid = await bcrypt.compare(currentPassword, dbUser.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: 'Invalid current password' }, { status: 401 });
      }
      hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        name: name ?? dbUser.name,
        email: email ?? dbUser.email,
        phone: phone ?? dbUser.phone,
        gender: gender ?? dbUser.gender,
        password: hashedPassword,
      },
    });

    // Sign new JWT token if email/name/gender/role changed
    const newToken = signToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      gender: updatedUser.gender,
      name: updatedUser.name,
    });

    const response = NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        gender: updatedUser.gender,
      },
    });

    // Refresh auth token cookie
    response.cookies.set('auth_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
