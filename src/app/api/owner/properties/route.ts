import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload || (payload.role !== 'OWNER' && payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const properties = await prisma.property.findMany({
      where: payload.role === 'ADMIN' ? {} : { ownerId: payload.userId },
      include: {
        rooms: true,
        enquiries: true,
        reviews: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    // Add dashboard analytics calculations
    const formattedProperties = properties.map((prop) => {
      const totalBeds = prop.rooms.reduce((acc, r) => acc + r.totalBeds, 0);
      const availableBeds = prop.rooms.reduce((acc, r) => acc + r.availableBeds, 0);
      const occupiedBeds = totalBeds - availableBeds;
      const occupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;

      // Parse JSON lists safely
      let parsedAmenities = [];
      let parsedRules = [];
      let parsedImages = [];
      try { parsedAmenities = JSON.parse(prop.amenities); } catch (e) {}
      try { parsedRules = JSON.parse(prop.houseRules); } catch (e) {}
      try { parsedImages = JSON.parse(prop.images); } catch (e) {}

      // Simulated views count for analytics
      const mockViews = (prop.enquiries.length * 7) + (prop.reviews.length * 12) + 24;

      return {
        ...prop,
        amenities: parsedAmenities,
        houseRules: parsedRules,
        images: parsedImages,
        totalBeds,
        availableBeds,
        occupiedBeds,
        occupancyRate,
        views: mockViews,
        enquiryCount: prop.enquiries.length,
      };
    });

    return NextResponse.json({ properties: formattedProperties });
  } catch (error: any) {
    console.error('Fetch owner properties error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload || payload.role !== 'OWNER') {
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
      houseRules, // array of strings
      images,     // array of strings
      amenities,  // array of strings
      rooms,      // array of room items { sharingType, price, totalBeds }
    } = body;

    if (!name || !address || !city || !genderType || !acType || !rooms || rooms.length === 0) {
      return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 });
    }

    const newProperty = await prisma.$transaction(async (tx) => {
      // 1. Create property
      const prop = await tx.property.create({
        data: {
          name,
          address,
          city,
          state: state || 'Telangana',
          latitude: parseFloat(latitude) || 17.4065,
          longitude: parseFloat(longitude) || 78.4772,
          genderType,
          acType,
          description: description || '',
          houseRules: JSON.stringify(houseRules || []),
          images: JSON.stringify(images || []),
          amenities: JSON.stringify(amenities || []),
          ownerId: payload.userId,
        },
      });

      // 2. Create rooms
      for (const room of rooms) {
        await tx.room.create({
          data: {
            propertyId: prop.id,
            sharingType: room.sharingType,
            price: parseFloat(room.price),
            totalBeds: parseInt(room.totalBeds),
            availableBeds: parseInt(room.totalBeds), // Initially all beds are available
          },
        });
      }

      return prop;
    });

    return NextResponse.json({
      message: 'Property listed successfully',
      property: newProperty,
    });
  } catch (error: any) {
    console.error('Create property error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
