import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = getUserFromRequest(request);

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        rooms: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        reviews: {
          include: {
            seeker: {
              select: {
                name: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc',
          }
        }
      }
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Check if wishlisted by current user
    let isWishlisted = false;
    if (payload) {
      const wish = await prisma.wishlist.findUnique({
        where: {
          seekerId_propertyId: {
            seekerId: payload.userId,
            propertyId: id,
          }
        }
      });
      isWishlisted = !!wish;
    }

    // Amenities parsing
    let propAmenities: string[] = [];
    try {
      propAmenities = JSON.parse(property.amenities);
    } catch (e) {
      propAmenities = [];
    }

    // House rules parsing
    let houseRules: string[] = [];
    try {
      houseRules = JSON.parse(property.houseRules);
    } catch (e) {
      houseRules = [];
    }

    // Images parsing
    let images: string[] = [];
    try {
      images = JSON.parse(property.images);
    } catch (e) {
      images = [];
    }

    // Calculate rating
    const totalReviews = property.reviews.length;
    const avgRating = totalReviews > 0
      ? property.reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
      : 0;

    const formattedProperty = {
      ...property,
      amenities: propAmenities,
      houseRules,
      images,
      avgRating,
      totalReviews,
      isWishlisted,
    };

    return NextResponse.json({ property: formattedProperty });
  } catch (error: any) {
    console.error('Fetch property details error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
