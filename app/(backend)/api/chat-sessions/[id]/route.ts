import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserFromRequest } from '@/app/(backend)/utils/authUtils';

// Get a specific chat session with its messages
export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Change this line to use await with params
    const params = await Promise.resolve(context.params);
    const id = params.id;
    
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

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error fetching chat session:', error);
    return NextResponse.json({ error: 'Failed to fetch chat session' }, { status: 500 });
  }
}

// Delete a chat session
export async function DELETE(
  req: Request,
  context: { params: { id: string } }  // Change parameter format
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = context.params.id;  // Direct access instead of destructuring
    
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

    return NextResponse.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat session:', error);
    return NextResponse.json({ error: 'Failed to delete chat session' }, { status: 500 });
  }
}

// Update session title
export async function PATCH(
  req: Request,
  context: { params: { id: string } }  // Change parameter format
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = context.params.id;  // Direct access instead of destructuring
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

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error updating chat session:', error);
    return NextResponse.json({ error: 'Failed to update chat session' }, { status: 500 });
  }
}