import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/app/(backend)/utils/authUtils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fix the way id is accessed
    const id = params instanceof Promise 
      ? (await params).id 
      : params.id;
    
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

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fix the way id is accessed
    const id = params instanceof Promise 
      ? (await params).id 
      : params.id;
    
    const { content, role, modelUsed } = await request.json();
    
    // Rest of your function remains the same
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

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Error creating chat message:', error);
    return NextResponse.json({ error: 'Failed to create chat message' }, { status: 500 });
  }
}