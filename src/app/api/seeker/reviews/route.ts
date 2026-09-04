import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload || payload.role !== 'SEEKER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { propertyId, rating, comment } = await request.json();
    if (!propertyId || !rating || !comment) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const ratingVal = parseInt(rating);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Check if user has enquired to prevent fake reviews
    const enquiry = await prisma.enquiry.findFirst({
      where: {
        seekerId: payload.userId,
        propertyId,
      }
    });

    if (!enquiry) {
      return NextResponse.json({
        error: 'Only users who have sent an enquiry for this property can write reviews.'
      }, { status: 403 });
    }

    // Check if review already exists
    const existing = await prisma.review.findUnique({
      where: {
        seekerId_propertyId: {
          seekerId: payload.userId,
          propertyId,
        }
      }
    });

    if (existing) {
      const review = await prisma.review.update({
        where: { id: existing.id },
        data: {
          rating: ratingVal,
          comment,
        }
      });
      return NextResponse.json({ message: 'Review updated successfully', review });
    }

    const review = await prisma.review.create({
      data: {
        seekerId: payload.userId,
        propertyId,
        rating: ratingVal,
        comment,
      }
    });

    return NextResponse.json({ message: 'Review posted successfully', review });
  } catch (error: any) {
    console.error('Submit review error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
