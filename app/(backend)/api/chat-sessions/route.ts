import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/app/(backend)/utils/authUtils';

// Get all user's chat sessions
export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await prisma.chatSession.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch chat sessions' }, { status: 500 });
  }
}

// Create a new chat session
export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title = 'New Chat' } = await req.json();

    const session = await prisma.chatSession.create({
      data: {
        title,
        userId: user.id,
      },
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error('Error creating chat session:', error);
    return NextResponse.json({ error: 'Failed to create chat session' }, { status: 500 });
  }
}