import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = getUserFromRequest(request);
    if (!payload || (payload.role !== 'OWNER' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();
    if (!status || (status !== 'ACCEPTED' && status !== 'REJECTED' && status !== 'PENDING')) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Check ownership
    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
      include: { property: true }
    });

    if (!enquiry) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    if (enquiry.property.ownerId !== payload.userId && payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.enquiry.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({
      message: `Enquiry status updated to ${status}`,
      enquiry: updated
    });
  } catch (error: any) {
    console.error('Update enquiry status error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
