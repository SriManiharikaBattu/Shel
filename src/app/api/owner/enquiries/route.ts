import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload || (payload.role !== 'OWNER' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const enquiries = await prisma.enquiry.findMany({
      where: payload.role === 'ADMIN' ? {} : {
        property: {
          ownerId: payload.userId
        }
      },
      include: {
        seeker: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            gender: true,
          }
        },
        property: {
          select: {
            id: true,
            name: true,
            address: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ enquiries });
  } catch (error: any) {
    console.error('Fetch owner enquiries error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
