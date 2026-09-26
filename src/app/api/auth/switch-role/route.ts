import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { role } = await request.json();
    const targetRole = role?.toUpperCase() || 'SEEKER';

    let user = await prisma.user.findFirst({
      where: { role: targetRole },
    });

    if (!user) {
      user = await prisma.user.findFirst();
    }

    if (!user) {
      return NextResponse.json({ error: 'No user found' }, { status: 404 });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      gender: user.gender,
      name: user.name,
    });

    const response = NextResponse.json({
      message: `Switched role to ${user.role}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        gender: user.gender,
      },
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Switch role error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
