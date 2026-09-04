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

    const body = await request.json();
    const {
      name,
      address,
      city,
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
    } = body;

    // Check ownership
    const existing = await prisma.property.findUnique({
      where: { id }
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
    if (latitude !== undefined) data.latitude = parseFloat(latitude);
    if (longitude !== undefined) data.longitude = parseFloat(longitude);
    if (genderType !== undefined) data.genderType = genderType;
    if (acType !== undefined) data.acType = acType;
    if (description !== undefined) data.description = description;
    if (houseRules !== undefined) data.houseRules = JSON.stringify(houseRules);
    if (images !== undefined) data.images = JSON.stringify(images);
    if (amenities !== undefined) data.amenities = JSON.stringify(amenities);
    if (isActive !== undefined) data.isActive = isActive;

    // Only Admin can verify/unverify
    if (isVerified !== undefined && payload.role === 'ADMIN') {
      data.isVerified = isVerified;
    }

    const updated = await prisma.property.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      message: 'Property updated successfully',
      property: updated,
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
    console.error('Delete property error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
