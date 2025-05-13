import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/app/(backend)/utils/authUtils';
import { apiResponseDuration } from '@backend/utils/metrics';

const route = '/api/chat-sessions/[id]';
// Get a specific chat session with its messages
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const method = 'GET';
  const endTimer = apiResponseDuration.startTimer({ route, method });
  try {
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    
    // Verify the session exists and belongs to the user
    const session = await prisma.chatSession.findUnique({
      where: { id, userId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    endTimer({ route, method });
    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error fetching chat session:', error);
    endTimer({ route, method });
    return NextResponse.json({ error: 'Failed to fetch chat session' }, { status: 500 });
  }
}

// Delete a chat session
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const method = 'DELETE';
  const endTimer = apiResponseDuration.startTimer({ route, method });
  try {
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    
    // Verify the session exists and belongs to the user
    const existingSession = await prisma.chatSession.findUnique({
      where: { id, userId: user.id },
    });

    if (!existingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Delete the session (will cascade delete messages)
    await prisma.chatSession.delete({
      where: { id },
    });

    endTimer({ route, method });
    return NextResponse.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat session:', error);
    endTimer({ route, method });
    return NextResponse.json({ error: 'Failed to delete chat session' }, { status: 500 });
  }
}

// Update session title
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const method = 'PATCH';
  const endTimer = apiResponseDuration.startTimer({ route, method });
  try {
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const { title } = await req.json();
    
    // First find by ID only
    const existingSession = await prisma.chatSession.findUnique({
      where: { id }
    });

    // Then check ownership
    if (!existingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check ownership separately
    if (existingSession.userId !== user.id) {
      // Choose either 403 or 404 based on your security preference
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      // Or return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update the session
    const session = await prisma.chatSession.update({
      where: { id },
      data: { title },
    });

    endTimer({ route, method });
    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error updating chat session:', error);
    endTimer({ route, method });
    return NextResponse.json({ error: 'Failed to update chat session' }, { status: 500 });
  }
}