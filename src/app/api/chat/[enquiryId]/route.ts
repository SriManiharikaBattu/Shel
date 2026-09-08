import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: Promise<{ enquiryId: string }> }) {
  try {
    const { enquiryId } = await params;
    const payload = getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const enquiry = await prisma.enquiry.findUnique({
      where: { id: enquiryId },
      include: {
        property: {
          include: {
            owner: {
              select: { id: true, name: true, phone: true, email: true }
            }
          }
        },
        seeker: {
          select: { id: true, name: true, phone: true, email: true, gender: true }
        }
      }
    });

    if (!enquiry) {
      return NextResponse.json({ error: 'Chat thread not found' }, { status: 404 });
    }

    if (
      enquiry.seekerId !== payload.userId &&
      enquiry.property.ownerId !== payload.userId &&
      payload.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { enquiryId },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ messages, enquiry });
  } catch (error: any) {
    console.error('Fetch chat messages error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ enquiryId: string }> }) {
  try {
    const { enquiryId } = await params;
    const payload = getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await request.json();
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    const enquiry = await prisma.enquiry.findUnique({
      where: { id: enquiryId },
      include: { property: true }
    });

    if (!enquiry) {
      return NextResponse.json({ error: 'Chat thread not found' }, { status: 404 });
    }

    if (
      enquiry.seekerId !== payload.userId &&
      enquiry.property.ownerId !== payload.userId &&
      payload.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Determine receiver
    const receiverId = payload.userId === enquiry.seekerId
      ? enquiry.property.ownerId
      : enquiry.seekerId;

    const message = await prisma.message.create({
      data: {
        enquiryId,
        senderId: payload.userId,
        receiverId,
        content: content.trim(),
      }
    });

    return NextResponse.json({ message });
  } catch (error: any) {
    console.error('Send chat message error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
