import { NextRequest } from 'next/server';
import { POST, GET } from '../../../app/(backend)/api/resources/route';
import prisma from '../../../lib/prisma';
import { generateChunkEmbeddings } from '../../../lib/embedding';

// Mock dependencies
jest.mock('../../../lib/prisma', () => ({
    resource: {
      create: jest.fn(),
      findMany: jest.fn()
    },
    $executeRaw: jest.fn(),
  }));
  
  jest.mock('../../../lib/embedding', () => ({
    generateChunkEmbeddings: jest.fn()
  }));
  
  // With:
  jest.mock('../../../lib/prisma', () => ({
    __esModule: true,
    default: {
      resource: {
        create: jest.fn(),
        findMany: jest.fn()
      },
      $executeRaw: jest.fn(),
    }
  }));
  
  jest.mock('../../../lib/embedding', () => ({
    generateChunkEmbeddings: jest.fn()
  }));

describe('Resources API Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/resources', () => {
    // Positive Case
    it('should create a resource and embeddings', async () => {
      const mockResource = { id: 1, title: 'Test', content: 'Test content' };
      const mockEmbeddings = [
        { content: 'Test content', embedding: [0.1, 0.2, 0.3] }
      ];
      
      (prisma.resource.create as jest.Mock).mockResolvedValue(mockResource);
      (generateChunkEmbeddings as jest.Mock).mockResolvedValue(mockEmbeddings);
      (prisma.$executeRaw as jest.Mock).mockResolvedValue(undefined);
      
      const request = new NextRequest(
        'http://localhost:3000/api/resources',
        {
          method: 'POST',
          body: JSON.stringify({ title: 'Test', content: 'Test content' }),
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.resourceId).toBe(1);
      expect(prisma.resource.create).toHaveBeenCalledWith({
        data: { title: 'Test', content: 'Test content' }
      });
      expect(generateChunkEmbeddings).toHaveBeenCalledWith('Test content');
      expect(prisma.$executeRaw).toHaveBeenCalled();
    });

    // Negative Cases
    it('should return 400 on validation failure', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/resources',
        {
          method: 'POST',
          body: JSON.stringify({ title: '', content: '' }),
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBeTruthy();
    });
    
    it('should return 500 when database operation fails', async () => {
      (prisma.resource.create as jest.Mock).mockRejectedValue(new Error('DB error'));
      
      const request = new NextRequest(
        'http://localhost:3000/api/resources',
        {
          method: 'POST',
          body: JSON.stringify({ title: 'Test', content: 'Test content' }),
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      const response = await POST(request);
      
      expect(response.status).toBe(500);
    });

    it('should handle non-Error objects in error handling', async () => {
      // Mock prisma to throw a string instead of an Error
      (prisma.resource.create as jest.Mock).mockRejectedValue('Database connection failed');
      
      const request = new NextRequest(
        'http://localhost:3000/api/resources',
        {
          method: 'POST',
          body: JSON.stringify({ title: 'Test', content: 'Test content' }),
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create resource: Database connection failed');
    });
  });

  describe('GET /api/resources', () => {
    // Positive Case
    it('should return all resources', async () => {
      const mockResources = [
        { id: 1, title: 'Resource 1', content: 'Content 1', createdAt: new Date() },
        { id: 2, title: 'Resource 2', content: 'Content 2', createdAt: new Date() }
      ];
      
      (prisma.resource.findMany as jest.Mock).mockResolvedValue(mockResources);
      
      const response = await GET();
      const data = await response.json();
      
      expect(data.resources.length).toBe(2);
      expect(data.resources[0].title).toBe('Resource 1');
    });

    // Negative Case
    it('should return 500 when database query fails', async () => {
      (prisma.resource.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));
      
      const response = await GET();
      
      expect(response.status).toBe(500);
    });

    // Corner Case
    it('should return empty array when no resources exist', async () => {
      (prisma.resource.findMany as jest.Mock).mockResolvedValue([]);
      
      const response = await GET();
      const data = await response.json();
      
      expect(data.resources).toEqual([]);
    });
  });
});