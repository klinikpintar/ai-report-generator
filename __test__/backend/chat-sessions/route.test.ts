import { GET as GET_COLLECTION, POST } from '@/app/(backend)/api/chat-sessions/route';
import { GET as GET_ITEM, PATCH, DELETE } from '@/app/(backend)/api/chat-sessions/[id]/route';
import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/app/(backend)/utils/authUtils';

// Mock dependencies
jest.mock('@/app/(backend)/utils/authUtils', () => ({
  getUserFromRequest: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    chatSession: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Import the mocked prisma instance after mocking
const prisma = require('@/lib/prisma').default;

describe('Chat Sessions API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/chat-sessions', () => {
    it('should return user chat sessions', async () => {
      // Mock authenticated user
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);
      
      // Mock sessions data
      const mockSessions = [
        {
          id: 'session-1',
          title: 'Chat 1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 'user-123',
          _count: { messages: 5 }
        },
        {
          id: 'session-2',
          title: 'Chat 2',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 'user-123',
          _count: { messages: 3 }
        },
      ];
      
      (prisma.chatSession.findMany as jest.Mock).mockResolvedValue(mockSessions);
      
      const response = await GET_COLLECTION();
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.sessions).toEqual(mockSessions);
      expect(prisma.chatSession.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: {
            select: { messages: true },
          },
        },
      });
    });
    
    it('should return 401 if user is not authenticated', async () => {
      // Mock unauthenticated user
      (getUserFromRequest as jest.Mock).mockResolvedValue(null);
      const response = await GET_COLLECTION();
      
      expect(response.status).toBe(401);
      expect(prisma.chatSession.findMany).not.toHaveBeenCalled();
    });
    
    it('should handle errors when fetching sessions', async () => {
      // Mock authenticated user
      (getUserFromRequest as jest.Mock).mockResolvedValue({ id: 'user-123' });
      
      // Mock database error
      (prisma.chatSession.findMany as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );
      
      const response = await GET_COLLECTION();
      
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });

  describe('GET /api/chat-sessions/[id]', () => {
    it('should return a specific chat session with messages', async () => {
      // Mock authenticated user
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);
      
      // Mock session with messages
      const mockSession = {
        id: 'session-123',
        title: 'Test Chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'user-123',
        messages: [
          {
            id: 'msg-1',
            content: 'Hello',
            role: 'user',
            createdAt: new Date().toISOString()
          },
          {
            id: 'msg-2',
            content: 'Hi there',
            role: 'assistant',
            createdAt: new Date().toISOString()
          }
        ]
      };
      
      (prisma.chatSession.findUnique as jest.Mock).mockResolvedValue(mockSession);
      
      const request = new NextRequest('http://localhost/api/chat-sessions/session-123');
      const response = await GET_ITEM(request, { params: Promise.resolve({ id: 'session-123' }) });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.session).toEqual(mockSession);
    });
    
    it('should return 404 when session is not found', async () => {
      // Mock authenticated user
      (getUserFromRequest as jest.Mock).mockResolvedValue({ id: 'user-123' });
      
      // Mock session not found
      (prisma.chatSession.findUnique as jest.Mock).mockResolvedValue(null);
      
      const request = new NextRequest('http://localhost/api/chat-sessions/not-found');
      const response = await GET_ITEM(request, { params: Promise.resolve({ id: 'not-found' }) });
      
      expect(response.status).toBe(404);
    });

    it('should fetch a specific session with its messages', async () => {
      // Mock authenticated user
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);
      
      // Mock session data with messages
      const mockSession = {
        id: 'session-123',
        title: 'Chat Title',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'user-123',
        messages: [
          { 
            id: 'msg-1', 
            content: 'Hello', 
            role: 'user',
            createdAt: new Date().toISOString(),
            sessionId: 'session-123'
          }
        ]
      };
      
      (prisma.chatSession.findUnique as jest.Mock).mockResolvedValue(mockSession);
      
      const request = new NextRequest('http://localhost/api/chat-sessions/session-123');
      const response = await GET_ITEM(request, { params: Promise.resolve({ id: 'session-123' }) });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.session).toEqual(mockSession);
    });
    
    it('should return 401 if user is not authenticated when fetching a specific session', async () => {
      // Mock unauthenticated user
      (getUserFromRequest as jest.Mock).mockResolvedValue(null);
      
      const request = new NextRequest('http://localhost/api/chat-sessions/session-123');
      const response = await GET_ITEM(request, { params: Promise.resolve({ id: 'session-123' }) });
      
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
      expect(prisma.chatSession.findUnique).not.toHaveBeenCalled();
    });

    it('should handle database errors when fetching a session', async () => {
      // Mock authenticated user
      (getUserFromRequest as jest.Mock).mockResolvedValue({ id: 'user-123' });
      
      // Mock database error
      (prisma.chatSession.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );
      
      const request = new NextRequest('http://localhost/api/chat-sessions/session-123');
      const response = await GET_ITEM(request, { params: Promise.resolve({ id: 'session-123' }) });
      
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });
  
  describe('POST /api/chat-sessions', () => {
    it('should create a new chat session', async () => {
      // Mock authenticated user
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      (getUserFromRequest as jest.Mock).mockResolvedValue(mockUser);
      
      // Mock created session
      const mockCreatedSession = {
        id: 'new-session-id',
        title: 'New Chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'user-123',
      };
      
      (prisma.chatSession.create as jest.Mock).mockResolvedValue(mockCreatedSession);
      
      const request = new Request('http://localhost/api/chat-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat' }),
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.session).toEqual(mockCreatedSession);
      expect(prisma.chatSession.create).toHaveBeenCalledWith({
        data: {
          title: 'New Chat',
          userId: 'user-123',
        },
      });
    });
    
    it('should create a session with default title when none provided', async () => {
      // Mock authenticated user
      (getUserFromRequest as jest.Mock).mockResolvedValue({ id: 'user-123' });
      
      // Mock created session
      const mockCreatedSession = {
        id: 'new-session-id',
        title: 'New Chat',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'user-123',
      };
      
      (prisma.chatSession.create as jest.Mock).mockResolvedValue(mockCreatedSession);
      
      const request = new Request('http://localhost/api/chat-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // No title provided
      });
      
      const response = await POST(request);
      expect(response.status).toBe(201);
      
      expect(prisma.chatSession.create).toHaveBeenCalledWith({
        data: {
          title: 'New Chat', // Default title
          userId: 'user-123',
        },
      });
    });
    
    it('should return 401 if user is not authenticated', async () => {
      // Mock unauthenticated user
      (getUserFromRequest as jest.Mock).mockResolvedValue(null);
      
      const request = new Request('http://localhost/api/chat-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat' }),
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(401);
      expect(prisma.chatSession.create).not.toHaveBeenCalled();
    });

    it('should handle database errors when creating a session', async () => {
      // Mock authenticated user
      (getUserFromRequest as jest.Mock).mockResolvedValue({ id: 'user-123' });
      
      // Mock database error
      const error = new Error('Database connection failed');
      (prisma.chatSession.create as jest.Mock).mockRejectedValue(error);
      
      const request = new Request('http://localhost/api/chat-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat' }),
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });
  
  describe('PATCH /api/chat-sessions/[id]', () => {
    it('should update a chat session title', async () => {
      // Mock authentication
      const user = { id: 'user-123', email: 'test@example.com' };
      (getUserFromRequest as jest.Mock).mockResolvedValue(user);
      
      // Mock Prisma response for finding session
      (prisma.chatSession.findUnique as jest.Mock).mockResolvedValue({
        id: 'session-123',
        title: 'Old Title',
        userId: 'user-123'
      });
      
      // Mock Prisma update
      (prisma.chatSession.update as jest.Mock).mockResolvedValue({
        id: 'session-123',
        title: 'New Title',
        userId: 'user-123'
      });
      
      const request = new NextRequest('http://localhost/api/chat-sessions/session-123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Title' })
      });
      
      const response = await PATCH(request, { params: Promise.resolve({ id: 'session-123' }) });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.session.title).toBe('New Title');
      expect(prisma.chatSession.update).toHaveBeenCalledWith({
        where: { id: 'session-123' },
        data: { title: 'New Title' }
      });
    });
    
    it('should return 404 when updating non-existent session', async () => {
      // Mock auth
      (getUserFromRequest as jest.Mock).mockResolvedValue({ id: 'user-123' });
      
      // Mock session not found
      (prisma.chatSession.findUnique as jest.Mock).mockResolvedValue(null);
      
      const response = await PATCH(
        new NextRequest('http://localhost/api/chat-sessions/bad-id', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'New Title' })
        }),
        { params: Promise.resolve({ id: 'bad-id' }) }
      );
      
      expect(response.status).toBe(404);
    });

    it('should return 401 if user is not authenticated', async () => {
      // Mock unauthenticated user
      (getUserFromRequest as jest.Mock).mockResolvedValue(null);
      
      const response = await PATCH(
        new NextRequest('http://localhost/api/chat-sessions/session-123', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'New Title' })
        }),
        { params: Promise.resolve({ id: 'session-123' }) }
      );
      
      expect(response.status).toBe(401);
      expect(prisma.chatSession.update).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not own the session', async () => {
      // Mock authentication
      (getUserFromRequest as jest.Mock).mockResolvedValue({ id: 'user-123' });
      
      // Mock session belonging to different user
      (prisma.chatSession.findUnique as jest.Mock).mockResolvedValue({
        id: 'session-123',
        title: 'Other User Session',
        userId: 'other-user-456'
      });
      
      const response = await PATCH(
        new NextRequest('http://localhost/api/chat-sessions/session-123', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'New Title' })
        }),
        { params: Promise.resolve({ id: 'session-123' }) }
      );
      
      expect(response.status).toBe(404);
      expect(prisma.chatSession.update).not.toHaveBeenCalled();
    });

    it('should handle database errors when updating a session', async () => {
      // Mock authenticated user
      (getUserFromRequest as jest.Mock).mockResolvedValue({ id: 'user-123' });
      
      // Mock session exists
      (prisma.chatSession.findUnique as jest.Mock).mockResolvedValue({
        id: 'session-123',
        userId: 'user-123'
      });
      
      // Mock database error on update
      (prisma.chatSession.update as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );
      
      const request = new NextRequest('http://localhost/api/chat-sessions/session-123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Title' })
      });
      
      const response = await PATCH(request, { params: Promise.resolve({ id: 'session-123' }) });
      
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });
  
  describe('DELETE /api/chat-sessions/[id]', () => {
    it('should delete a chat session', async () => {
      // Mock auth
      (getUserFromRequest as jest.Mock).mockResolvedValue({ id: 'user-123' });
      
      // Mock session found
      (prisma.chatSession.findUnique as jest.Mock).mockResolvedValue({
        id: 'session-123',
        userId: 'user-123'
      });
      
      // Mock successful delete
      (prisma.chatSession.delete as jest.Mock).mockResolvedValue({});
      
      const response = await DELETE(
        new NextRequest('http://localhost/api/chat-sessions/session-123'),
        { params: Promise.resolve({ id: 'session-123' }) }
      );
      
      expect(response.status).toBe(200);
      expect(prisma.chatSession.delete).toHaveBeenCalledWith({
        where: { id: 'session-123' }
      });
    });
    
    it('should return 404 when deleting non-existent session', async () => {
      // Mock auth
      (getUserFromRequest as jest.Mock).mockResolvedValue({ id: 'user-123' });
      
      // Mock session not found
      (prisma.chatSession.findUnique as jest.Mock).mockResolvedValue(null);
      
      const response = await DELETE(
        new NextRequest('http://localhost/api/chat-sessions/bad-id'),
        { params: Promise.resolve({ id: 'bad-id' }) }
      );
      
      expect(response.status).toBe(404);
    });

    it('should return 401 if user is not authenticated', async () => {
      // Mock unauthenticated user
      (getUserFromRequest as jest.Mock).mockResolvedValue(null);
      
      const response = await DELETE(
        new NextRequest('http://localhost/api/chat-sessions/session-123'),
        { params: Promise.resolve({ id: 'session-123' }) }
      );
      
      expect(response.status).toBe(401);
      expect(prisma.chatSession.delete).not.toHaveBeenCalled();
    });

    it('should handle database errors when deleting a session', async () => {
      // Mock authenticated user
      (getUserFromRequest as jest.Mock).mockResolvedValue({ id: 'user-123' });
      
      // Mock session exists and belongs to user
      (prisma.chatSession.findUnique as jest.Mock).mockResolvedValue({
        id: 'session-123',
        userId: 'user-123'
      });
      
      // Mock database error on delete
      (prisma.chatSession.delete as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );
      
      const request = new NextRequest('http://localhost/api/chat-sessions/session-123', {
        method: 'DELETE'
      });
      const response = await DELETE(request, { params: Promise.resolve({ id: 'session-123' }) });
      
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });
});