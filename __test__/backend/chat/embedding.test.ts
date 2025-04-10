import { generateEmbedding, generateChunkEmbeddings, findRelevantContent } from '../../../lib/embedding';
import prisma from '../../../lib/prisma';
import { embed, embedMany } from 'ai';

// Mock the dependencies
jest.mock('../../../lib/prisma', () => ({
  __esModule: true,
  default: {
    $queryRaw: jest.fn(),
  }
}));

jest.mock('ai', () => ({
  embed: jest.fn(),
  embedMany: jest.fn(),
}));

describe('Embedding Functions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateEmbedding', () => {
    // Positive Case
    it('should generate an embedding for valid input', async () => {
      const mockEmbedding = Array(768).fill(0.1);
      (embed as jest.Mock).mockResolvedValue({ embedding: mockEmbedding });

      const result = await generateEmbedding('Test query');
      
      expect(embed).toHaveBeenCalledWith(expect.objectContaining({
        value: 'Test query'
      }));
      expect(result).toEqual(mockEmbedding);
      expect(result.length).toBe(768);
    });

    // Negative Case
    it('should throw an error when embedding generation fails', async () => {
      (embed as jest.Mock).mockRejectedValue(new Error('API error'));
      
      await expect(generateEmbedding('Test query')).rejects.toThrow('API error');
    });

    // Corner Case
    it('should handle empty input text', async () => {
      const mockEmbedding = Array(768).fill(0);
      (embed as jest.Mock).mockResolvedValue({ embedding: mockEmbedding });
      
      const result = await generateEmbedding('');
      
      expect(embed).toHaveBeenCalledWith(expect.objectContaining({
        value: ''
      }));
      expect(result).toEqual(mockEmbedding);
    });
  });

  describe('generateChunkEmbeddings', () => {
    // Positive Case
    it('should chunk content and generate embeddings', async () => {
      const mockEmbeddings = [Array(768).fill(0.1), Array(768).fill(0.2)];
      (embedMany as jest.Mock).mockResolvedValue({ embeddings: mockEmbeddings });
      
      const content = 'This is the first paragraph.\n\nThis is the second paragraph.';
      const result = await generateChunkEmbeddings(content);
      
      expect(embedMany).toHaveBeenCalled();
      expect(result.length).toBe(2);
      expect(result[0].content).toBe('This is the first paragraph.');
      expect(result[1].content).toBe('This is the second paragraph.');
      expect(result[0].embedding).toEqual(mockEmbeddings[0]);
    });

    // Negative Case
    it('should return mock embedding when API fails', async () => {
      (embedMany as jest.Mock).mockRejectedValue(new Error('API error'));
      
      const content = 'Test content';
      const result = await generateChunkEmbeddings(content);
      
      expect(result.length).toBe(0);
    });

    // Corner Cases
    it('should handle empty content', async () => {
      const result = await generateChunkEmbeddings('');
      
      expect(result.length).toBe(0);
      expect(embedMany).not.toHaveBeenCalled();
    });
    
    it('should handle content with only small chunks', async () => {
      const result = await generateChunkEmbeddings('Hi. OK.');
      
      expect(result.length).toBe(0);
      expect(embedMany).not.toHaveBeenCalled();
    });
    
    it('should split very long paragraphs', async () => {
      const mockEmbeddings = [Array(768).fill(0.1), Array(768).fill(0.2)];
      (embedMany as jest.Mock).mockResolvedValue({ embeddings: mockEmbeddings });
      
      const longParagraph = 'This is a very long paragraph. '.repeat(50);
      await generateChunkEmbeddings(longParagraph);
      
      // Check that it was split into multiple chunks
      const { values } = (embedMany as jest.Mock).mock.calls[0][0];
      expect(values.length).toBeGreaterThan(1);
    });

    it('should handle errors in content processing and return mock data', async () => {
      // Mock a function used in content processing to throw an error
      // This will trigger the outer catch block
      const originalSplit = String.prototype.split;
      String.prototype.split = jest.fn().mockImplementation(() => {
        throw new Error('Processing error');
      });
      
      const content = 'Test content';
      const result = await generateChunkEmbeddings(content);
      
      // Verify mock data is returned
      expect(result.length).toBe(1);
      expect(result[0].content).toBe('Test content');
      expect(result[0].embedding.length).toBe(768);
      
      // Restore original function
      String.prototype.split = originalSplit;
    });

    it('should throw API errors from the embedding service', async () => {
      // Setup content that will pass pre-processing
      const content = 'This is test content that is definitely longer than 20 characters';
      
      // Mock the API to throw an error
      (embedMany as jest.Mock).mockRejectedValue(new Error('API error'));
      
      // Expect the function to throw the API error
      await expect(generateChunkEmbeddings(content)).rejects.toThrow('API error');
    });
  });

  describe('findRelevantContent', () => {
    // Positive Case
    it('should find content without resource filter', async () => {
      const mockEmbedding = Array(768).fill(0.1);
      const mockResults = [
        { content: 'Relevant content 1', similarity: 0.92 },
        { content: 'Relevant content 2', similarity: 0.85 }
      ];
      
      (embed as jest.Mock).mockResolvedValue({ embedding: mockEmbedding });
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockResults);
      
      const results = await findRelevantContent('Test query');
      
      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(results).toEqual(mockResults);
    });
    
    // Test with resource filtering
    it('should find content with resource filter', async () => {
      const mockEmbedding = Array(768).fill(0.1);
      const mockResults = [{ content: 'Filtered content', similarity: 0.9 }];
      
      (embed as jest.Mock).mockResolvedValue({ embedding: mockEmbedding });
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockResults);
      
      const results = await findRelevantContent('Test query', [1, 2]);
      
      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(results).toEqual(mockResults);
    });

    // Negative Case
    it('should handle database query errors', async () => {
      const mockEmbedding = Array(768).fill(0.1);
      
      (embed as jest.Mock).mockResolvedValue({ embedding: mockEmbedding });
      (prisma.$queryRaw as jest.Mock).mockRejectedValue(new Error('DB error'));
      
      await expect(findRelevantContent('Test query')).rejects.toThrow('DB error');
    });

    // Corner Case
    it('should handle empty results', async () => {
      const mockEmbedding = Array(768).fill(0.1);
      
      (embed as jest.Mock).mockResolvedValue({ embedding: mockEmbedding });
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);
      
      const results = await findRelevantContent('Test query');
      
      expect(results).toEqual([]);
    });
  });
});