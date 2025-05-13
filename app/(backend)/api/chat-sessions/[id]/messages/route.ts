import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/app/(backend)/utils/authUtils';
import { apiResponseDuration, apiMetrics } from '@/app/(backend)/utils/metrics';

const route = '/api/chat-sessions/[id]/messages';
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const method = 'GET';
  const endTimer = apiResponseDuration.startTimer({ route, method });
  apiMetrics(method, route);
  try {
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    
    // Verify user owns this session
    const session = await prisma.chatSession.findUnique({
      where: { id, userId: user.id },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId: id },
      orderBy: { createdAt: 'asc' },
    });

    endTimer({ route, method });
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    endTimer({ route, method });
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const method = 'POST';
  const endTimer = apiResponseDuration.startTimer({ route, method });
  apiMetrics(method, route);
  try {
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const { content, role, modelUsed } = await request.json();
    
    // Verify user owns this session
    const session = await prisma.chatSession.findUnique({
      where: { id, userId: user.id },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Create the message
    const message = await prisma.chatMessage.create({
      data: {
        content,
        role,
        modelUsed,
        sessionId: id,
      },
    });

    // Update session updateAt to keep it at the top of the list
    await prisma.chatSession.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    endTimer({ route, method });
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Error creating chat message:', error);
    endTimer({ route, method });
    return NextResponse.json({ error: 'Failed to create chat message' }, { status: 500 });
  }
}