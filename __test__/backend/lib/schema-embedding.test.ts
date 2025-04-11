import { embed } from 'ai';
import { google } from '@ai-sdk/google';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { 
  generateEmbedding,
  generateSchemaEmbeddings,
  findRelevantSchemaContent
} from '@/lib/schema-embedding';

// Mock dependencies
jest.mock('ai', () => ({
  embed: jest.fn()
}));

jest.mock('@ai-sdk/google', () => ({
  google: {
    textEmbeddingModel: jest.fn().mockReturnValue('mocked-embedding-model')
  }
}));

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    schemaEmbedding: {
      deleteMany: jest.fn(),
    },
    $executeRaw: jest.fn(),
    $queryRaw: jest.fn(),
  },
}));

describe('Schema Embedding Utilities', () => {
  // Add this at the top of the test suite to suppress all console.error
  let originalConsoleError;
  
  beforeAll(() => {
    // Store original implementation
    originalConsoleError = console.error;
    // Replace with no-op function
    console.error = jest.fn();
  });
  
  afterAll(() => {
    // Restore original implementation after all tests finish
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateEmbedding', () => {
    it('should generate embedding for text', async () => {
      // Mock embedding response
      const mockEmbedding = [0.1, 0.2, 0.3];
      (embed as jest.Mock).mockResolvedValue({ embedding: mockEmbedding });
      
      // Call the function
      const result = await generateEmbedding('test text');
      
      // Verify behavior
      expect(embed).toHaveBeenCalledWith({
        model: 'mocked-embedding-model',
        value: 'test text',
      });
      expect(result).toEqual(mockEmbedding);
    });

    it('should handle errors during embedding generation', async () => {
      // Mock embedding error
      const mockError = new Error('Embedding API error');
      (embed as jest.Mock).mockRejectedValue(mockError);
      
      // Call and expect error
      await expect(generateEmbedding('test text')).rejects.toThrow('Embedding API error');
      
      // Keep verification that error was logged
      expect(console.error).toHaveBeenCalledWith(
        'Error generating embedding:', 
        expect.any(Error)
      );
    });
  });

  describe('generateSchemaEmbeddings', () => {
    it('should generate embeddings for a schema with multiple tables', async () => {
      // Mock successful embedding generation
      (embed as jest.Mock).mockResolvedValue({ embedding: [0.1, 0.2, 0.3] });
      
      const mockSchema = {
        id: 1,
        name: 'Test Schema',
        description: 'A test schema',
        schemaText: `
          CREATE TABLE users (id INT, name TEXT);
          CREATE TABLE orders (id INT, user_id INT);
        `
      };
      
      // Call the function
      await generateSchemaEmbeddings(mockSchema);
      
      // Verify existing embeddings were deleted
      expect(prisma.schemaEmbedding.deleteMany).toHaveBeenCalledWith({
        where: { schemaId: 1 }
      });
      
      // Verify raw SQL was executed 4 times
      expect(prisma.$executeRaw).toHaveBeenCalledTimes(4);
      
      // Check one call as an example - with CORRECT argument count
      expect(prisma.$executeRaw).toHaveBeenCalledWith(
        expect.any(Array),  // SQL template parts
        mockSchema.id,      // The schemaId value
        expect.any(String), // content
        expect.any(Array)   // embedding array
      );
    });

    it('should handle errors while generating embeddings', async () => {
      // Mock error during embedding
      (embed as jest.Mock).mockRejectedValue(new Error('API error'));
      
      const mockSchema = {
        id: 2,
        name: 'Error Schema',
        description: 'Schema that will error',
        schemaText: 'CREATE TABLE test (id INT);'
      };
      
      // Expect function to throw
      await expect(generateSchemaEmbeddings(mockSchema)).rejects.toThrow('API error');
      
      // Verify cleanup was attempted
      expect(prisma.schemaEmbedding.deleteMany).toHaveBeenCalledWith({
        where: { schemaId: 2 }
      });
    });
  });

  describe('findRelevantSchemaContent', () => {
    it('should search all schemas when no schemaIds provided', async () => {
      // Mock embedding and database response
      (embed as jest.Mock).mockResolvedValue({ embedding: [0.1, 0.2, 0.3] });
      
      const mockQueryResult = [
        { content: 'Table: users', schemaId: 1, similarity: 0.95 }
      ];
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockQueryResult);
      
      // Spy on console.log
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Call function
      const result = await findRelevantSchemaContent('find users table');
      
      // Verify behavior
      expect(result).toEqual(mockQueryResult);
      expect(consoleLogSpy).toHaveBeenCalledWith('🔍 Performing global RAG search (no schema ID filter)');
      
      // Cleanup
      consoleLogSpy.mockRestore();
    });

    it('should filter by schemaIds when provided', async () => {
      // Mock embedding and database response
      (embed as jest.Mock).mockResolvedValue({ embedding: [0.1, 0.2, 0.3] });
      
      const mockQueryResult = [
        { content: 'Table: products', schemaId: 2, similarity: 0.85 }
      ];
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockQueryResult);
      
      // Spy on console.log
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Call function with schema IDs
      const result = await findRelevantSchemaContent('find products table', [2, 3]);
      
      // Verify behavior
      expect(result).toEqual(mockQueryResult);
      expect(consoleLogSpy).toHaveBeenCalledWith('🔍 Limiting RAG search to schema IDs: [2, 3]');
      
      // Check that SQL included the WHERE clause
      expect(prisma.$queryRaw).toHaveBeenCalledWith(
        expect.any(Array),  // SQL template parts
        [0.1, 0.2, 0.3],   // The embedding array (first occurrence)
        [0.1, 0.2, 0.3],   // The embedding array (second occurrence) 
        expect.objectContaining({
          strings: expect.arrayContaining(["AND \"schemaId\" IN (2,3)"]) 
        })
      );
      
      // Cleanup
      consoleLogSpy.mockRestore();
    });

    it('should handle string schemaIds by converting to numbers', async () => {
      // Mock embedding and database response
      (embed as jest.Mock).mockResolvedValue({ embedding: [0.1, 0.2, 0.3] });
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);
      
      // Spy on console.log
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Call function with string schema IDs
      await findRelevantSchemaContent('test query', ['1', '2']);
      
      // Verify behavior
      expect(consoleLogSpy).toHaveBeenCalledWith('🔍 Limiting RAG search to schema IDs: [1, 2]');
      
      // Cleanup
      consoleLogSpy.mockRestore();
    });

    it('should handle errors and return empty array', async () => {
      // Mock embedding error
      (embed as jest.Mock).mockRejectedValue(new Error('API error'));
      
      // Call function
      const result = await findRelevantSchemaContent('test query');
      
      // Verify behavior
      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Error finding relevant schema content:',
        expect.any(Error)
      );
    });
  });
});