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

    const { price, totalBeds, availableBeds } = await request.json();

    const room = await prisma.room.findUnique({
      where: { id },
      include: { property: true }
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Verify ownership
    if (room.property.ownerId !== payload.userId && payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data: any = {};
    if (price !== undefined) data.price = parseFloat(price);
    if (totalBeds !== undefined) data.totalBeds = parseInt(totalBeds);
    if (availableBeds !== undefined) {
      const beds = parseInt(availableBeds);
      const finalTotalBeds = totalBeds !== undefined ? parseInt(totalBeds) : room.totalBeds;
      if (beds > finalTotalBeds) {
        return NextResponse.json({ error: 'Available beds cannot exceed total capacity' }, { status: 400 });
      }
      if (beds < 0) {
        return NextResponse.json({ error: 'Available beds cannot be negative' }, { status: 400 });
      }
      data.availableBeds = beds;
    }

    const updatedRoom = await prisma.room.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      message: 'Room updated successfully',
      room: updatedRoom,
    });
  } catch (error: any) {
    console.error('Update room error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
