import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = getUserFromRequest(request);
    if (!payload || (payload.role !== 'OWNER' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        rooms: true,
        reviews: true,
      }
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (property.ownerId !== payload.userId && payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ property });
  } catch (error: any) {
    console.error('Fetch owner property by id error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = getUserFromRequest(request);
    if (!payload || (payload.role !== 'OWNER' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      address,
      city,
      state,
      latitude,
      longitude,
      genderType,
      acType,
      description,
      houseRules,
      images,
      amenities,
      isActive,
      isVerified,
      rooms,
    } = body;

    // Check ownership
    const existing = await prisma.property.findUnique({
      where: { id },
      include: { rooms: true }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (existing.ownerId !== payload.userId && payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (address !== undefined) data.address = address;
    if (city !== undefined) data.city = city;
    if (state !== undefined) data.state = state;
    if (latitude !== undefined) data.latitude = parseFloat(latitude);
    if (longitude !== undefined) data.longitude = parseFloat(longitude);
    if (genderType !== undefined) data.genderType = genderType;
    if (acType !== undefined) data.acType = acType;
    if (description !== undefined) data.description = description;
    if (houseRules !== undefined) data.houseRules = typeof houseRules === 'string' ? houseRules : JSON.stringify(houseRules);
    if (images !== undefined) data.images = typeof images === 'string' ? images : JSON.stringify(images);
    if (amenities !== undefined) data.amenities = typeof amenities === 'string' ? amenities : JSON.stringify(amenities);
    if (isActive !== undefined) data.isActive = isActive;

    // Only Admin can verify/unverify
    if (isVerified !== undefined && payload.role === 'ADMIN') {
      data.isVerified = isVerified;
    }

    // Update property
    const updated = await prisma.property.update({
      where: { id },
      data,
    });

    // Update rooms if provided
    if (Array.isArray(rooms)) {
      for (const r of rooms) {
        if (r.id) {
          await prisma.room.update({
            where: { id: r.id },
            data: {
              sharingType: r.sharingType,
              price: parseFloat(r.price),
              totalBeds: parseInt(r.totalBeds),
              availableBeds: Math.min(parseInt(r.availableBeds), parseInt(r.totalBeds)),
            }
          });
        } else {
          await prisma.room.create({
            data: {
              propertyId: id,
              sharingType: r.sharingType,
              price: parseFloat(r.price),
              totalBeds: parseInt(r.totalBeds),
              availableBeds: parseInt(r.availableBeds || 0),
            }
          });
        }
      }
    }

    const fullUpdated = await prisma.property.findUnique({
      where: { id },
      include: { rooms: true }
    });

    return NextResponse.json({
      message: 'Property and features updated successfully',
      property: fullUpdated,
    });
  } catch (error: any) {
    console.error('Update owner property error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = getUserFromRequest(request);
    if (!payload || (payload.role !== 'OWNER' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.property.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (existing.ownerId !== payload.userId && payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.property.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Property deleted successfully' });
  } catch (error: any) {
    console.error('Delete owner property error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
