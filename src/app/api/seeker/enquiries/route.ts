import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload || payload.role !== 'SEEKER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const enquiries = await prisma.enquiry.findMany({
      where: { seekerId: payload.userId },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            state: true,
            images: true,
            isVerified: true,
            ownerId: true,
            owner: {
              select: {
                id: true,
                name: true,
                phone: true,
                email: true,
              }
            }
          }
        },
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ enquiries });
  } catch (error: any) {
    console.error('Fetch enquiries error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request);
    if (!payload || payload.role !== 'SEEKER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { propertyId, message } = await request.json();
    if (!propertyId || !message) {
      return NextResponse.json({ error: 'Property ID and message are required' }, { status: 400 });
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Check if an enquiry already exists between this seeker and property
    const existing = await prisma.enquiry.findFirst({
      where: {
        seekerId: payload.userId,
        propertyId,
      }
    });

    if (existing) {
      // Add a message to the existing enquiry
      const newMessage = await prisma.message.create({
        data: {
          enquiryId: existing.id,
          senderId: payload.userId,
          receiverId: property.ownerId,
          content: message,
        }
      });
      return NextResponse.json({
        message: 'Message added to existing enquiry',
        enquiry: existing,
        newMessage
      });
    }

    // Create new enquiry
    const enquiry = await prisma.enquiry.create({
      data: {
        seekerId: payload.userId,
        propertyId,
        message,
      }
    });

    // Create the initial chat message in the DB
    await prisma.message.create({
      data: {
        enquiryId: enquiry.id,
        senderId: payload.userId,
        receiverId: property.ownerId,
        content: message,
      }
    });

    return NextResponse.json({
      message: 'Enquiry submitted successfully',
      enquiry,
    });
  } catch (error: any) {
    console.error('Submit enquiry error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
