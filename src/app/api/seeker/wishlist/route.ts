import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload || payload.role !== 'SEEKER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const wishlistItems = await prisma.wishlist.findMany({
      where: { seekerId: payload.userId },
      include: {
        property: {
          include: {
            rooms: true,
            reviews: { select: { rating: true } }
          }
        }
      }
    });

    const properties = wishlistItems.map((item) => {
      const prop = item.property;
      const totalRatings = prop.reviews.length;
      const avgRating = totalRatings > 0
        ? prop.reviews.reduce((acc, r) => acc + r.rating, 0) / totalRatings
        : 0;

      const prices = prop.rooms.map((r) => r.price);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

      let propAmenities: string[] = [];
      try { propAmenities = JSON.parse(prop.amenities); } catch (e) {}

      return {
        ...prop,
        amenities: propAmenities,
        avgRating,
        totalReviews: totalRatings,
        minPrice,
      };
    });

    return NextResponse.json({ properties });
  } catch (error: any) {
    console.error('Fetch wishlist error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload || payload.role !== 'SEEKER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { propertyId } = await request.json();
    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    // Check if already in wishlist
    const existing = await prisma.wishlist.findUnique({
      where: {
        seekerId_propertyId: {
          seekerId: payload.userId,
          propertyId,
        }
      }
    });

    if (existing) {
      // Remove it
      await prisma.wishlist.delete({
        where: { id: existing.id }
      });
      return NextResponse.json({ added: false, message: 'Removed from wishlist' });
    } else {
      // Add it
      await prisma.wishlist.create({
        data: {
          seekerId: payload.userId,
          propertyId,
        }
      });
      return NextResponse.json({ added: true, message: 'Added to wishlist' });
    }
  } catch (error: any) {
    console.error('Toggle wishlist error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
