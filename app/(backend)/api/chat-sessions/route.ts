import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/app/(backend)/utils/authUtils';
import { apiResponseDuration } from '@backend/utils/metrics';

// Get all user's chat sessions
const route = '/api/chat-sessions';
export async function GET() {
  const method = 'GET';
  const endTimer = apiResponseDuration.startTimer({ route, method });
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

    endTimer({ route, method });
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    endTimer({ route, method });
    return NextResponse.json({ error: 'Failed to fetch chat sessions' }, { status: 500 });
  }
}

// Create a new chat session
export async function POST(req: Request) {
  const method = 'POST';
  const endTimer = apiResponseDuration.startTimer({ route, method });
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

    endTimer({ route, method });
    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error('Error creating chat session:', error);
    endTimer({ route, method });
    return NextResponse.json({ error: 'Failed to create chat session' }, { status: 500 });
  }
}