import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, phone, name, role, gender } = await request.json();

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Email or Phone number is required to create a session' },
        { status: 400 }
      );
    }

    const cleanEmail = email ? email.trim().toLowerCase() : null;
    const cleanPhone = phone ? phone.trim().replace(/\s+/g, '') : null;

    // 1. Find existing user by email or phone
    const orConditions: any[] = [];
    if (cleanEmail) orConditions.push({ email: cleanEmail });
    if (cleanPhone) orConditions.push({ phone: cleanPhone });

    let user = await prisma.user.findFirst({
      where: {
        OR: orConditions,
      },
    });

    // 2. If user doesn't exist, register them automatically
    if (!user) {
      const generatedPassword = await bcrypt.hash(`firebase_${Date.now()}_${Math.random()}`, 10);
      const fallbackName = name || (cleanEmail ? cleanEmail.split('@')[0] : cleanPhone || 'Shel Guest');
      const assignedRole = role === 'OWNER' || role === 'ADMIN' ? role : 'SEEKER';
      const assignedGender = gender === 'MALE' || gender === 'FEMALE' ? gender : 'OTHER';

      user = await prisma.user.create({
        data: {
          name: fallbackName,
          email: cleanEmail || `${cleanPhone}@shel.firebase.internal`,
          phone: cleanPhone || 'Not provided',
          password: generatedPassword,
          role: assignedRole,
          gender: assignedGender,
        },
      });
    } else {
      // If user exists and new profile details are available, update them
      const updateData: any = {};
      if (name && user.name.startsWith('Shel Guest')) updateData.name = name;
      if (cleanPhone && (!user.phone || user.phone === 'Not provided')) updateData.phone = cleanPhone;
      if (cleanEmail && user.email.includes('@shel.firebase.internal')) updateData.email = cleanEmail;

      if (Object.keys(updateData).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }
    }

    // 3. Issue JWT session cookie
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      gender: user.gender,
      name: user.name,
    });

    const response = NextResponse.json({
      message: 'Authentication successful',
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
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Firebase session sync error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
