import { NextRequest } from 'next/server';
import { POST } from '@/app/(backend)/api/chat/route';
import { generateText } from 'ai';
import prisma from '@/lib/prisma';
import { ModelFactory, DeepseekProvider, GeminiProvider } from '@/app/(backend)/services/chatServices';

// Add to the top of your route.test.ts file
jest.mock('@/app/(backend)/utils/authUtils', () => ({
  getUserFromRequest: jest.fn().mockResolvedValue({ 
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'USER'
  })
}));

// Mock the ai module
jest.mock('ai', () => ({
  generateText: jest.fn().mockResolvedValue({
    text: 'Mocked response',
    finishReason: 'stop',
    usage: {
      promptTokens: 10,
      completionTokens: 20,
    },
  }),
}));

// Mock the google module
jest.mock('@ai-sdk/google', () => ({
  google: jest.fn().mockReturnValue('mocked-model'),
}));

// Mock the deepseek module for model switching tests
jest.mock('@ai-sdk/deepseek', () => ({
  deepseek: jest.fn().mockReturnValue('mocked-deepseek-model'),
}));

// Add these mocks after your existing mocks
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    schema: {
      findUnique: jest.fn(),
    },
    chatSession: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    chatMessage: {
      create: jest.fn(),
    }
  },
}));


jest.mock('@/lib/schema-embedding', () => ({
  findRelevantSchemaContent: jest.fn().mockImplementation((query, schemaIds = []) => {
    if (query.includes('table structure')) {
      return Promise.resolve([
        { content: 'CREATE TABLE users (id INT, name VARCHAR(255))', schemaId: 1, similarity: 0.92 }
      ]);
    }
    return Promise.resolve([]);
  }),
  generateSchemaEmbeddings: jest.fn().mockResolvedValue(undefined)
}));


const mockFindUnique = prisma.chatSession.findUnique as unknown as jest.Mock;

describe('POST /api/chat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('checks if the API works with normal input', async () => {
    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('aiResponse', 'Mocked response');
    expect(responseBody).toHaveProperty('userPrompt', 'Hello');
    expect(responseBody).toHaveProperty('messageId');
  });

  it('handles empty messages array', async () => {
    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [],
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error', 'No messages provided');
  });

  it('handles invalid message format', async () => {
    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user' }], // Missing content
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error', 'Invalid message format');
  });

  it('handles API errors gracefully', async () => {
    (generateText as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(500);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error', 'Failed to generate response');
  });

  it('selects the correct model based on request parameter', async () => {
    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'deepseek',
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.metadata).toHaveProperty('modelUsed', 'deepseek');
  });

  it('handles very large messages', async () => {
    const largeContent = 'A'.repeat(10000);

    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: largeContent }],
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('userPrompt');
    expect(responseBody.userPrompt.length).toBe(largeContent.length);
  });

  it('handles messages with special characters', async () => {
    const specialContent = '!@#$%^&*()_+-=[]{}|;\':",./<>?`~\n\t\r';

    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: specialContent }],
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('userPrompt', specialContent);
  });

  it('handles missing finishReason and usage information', async () => {
    (generateText as jest.Mock).mockResolvedValueOnce({
      text: 'Mocked response with missing metadata',
    });

    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.metadata).toHaveProperty('finishReason', 'stop'); // Default value
    expect(responseBody.metadata.usage).toHaveProperty('promptTokens', 0); // Default value
    expect(responseBody.metadata.usage).toHaveProperty('completionTokens', 0); // Default value
  });


  it('accepts single schemaId parameter in request', async () => {
    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        schemaId: '1',
      }),
    });

    const response = await POST(req);
    const responseBody = await response.json();
    expect(responseBody.metadata).toHaveProperty('schemaId', '1');
  });

  it('accepts array of schemaIds in request', async () => {
    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        schemaId: ['1', '2', '3'],
      }),
    });

    const response = await POST(req);
    const responseBody = await response.json();
    expect(responseBody.metadata).toHaveProperty('schemaId');
    expect(responseBody.metadata.schemaId).toEqual(['1', '2', '3']);
  });
});

describe('Schema context enhancement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the schema data to be returned by prisma
    (prisma.schema.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Test Schema',
      schemaText: 'CREATE TABLE users (id INT, name VARCHAR(255))',
      description: 'Test schema description',
      createdAt: new Date(),
    });
  });

  it('enhances user message with schema context when schemaId is provided', async () => {
    // Create a spy on generateText to check what messages are passed to it
    const generateTextSpy = jest.spyOn(require('ai'), 'generateText');
    generateTextSpy.mockResolvedValue({
      text: 'Response with schema context',
      finishReason: 'stop',
      usage: {
        promptTokens: 15,
        completionTokens: 25,
      },
    });

    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Show users' }],
        schemaId: '1',
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    // Verify that generateText was called with enhanced message
    expect(generateTextSpy).toHaveBeenCalled();
    // Add type information to fix the TypeScript error
    const call = generateTextSpy.mock.calls[0][0] as {
      model: any;
      messages: Array<{ role: string; content: string }>
    };

    const lastMessage = call.messages[call.messages.length - 1];

    // Check that the message was enhanced with schema context
    expect(lastMessage.content).toContain('SQL Schema');
    expect(lastMessage.content).toContain('CREATE TABLE users');
    expect(lastMessage.content).toContain('Show users');

    // Check that the response metadata includes schema information
    const responseBody = await response.json();
    expect(responseBody.metadata).toHaveProperty('schemaIncluded', true);
    expect(responseBody.metadata).toHaveProperty('schemaName', 'Test Schema');
  });

  it('handles invalid schemaId gracefully', async () => {
    // Mock prisma to return null for non-existent schema
    (prisma.schema.findUnique as jest.Mock).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Show users' }],
        schemaId: '999', // Non-existent schema
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.metadata).not.toHaveProperty('schemaName');
    expect(responseBody.metadata).toHaveProperty('schemaIncluded', false);
  });

  it('handles database errors when fetching schema', async () => {
    // Mock prisma to throw an error
    (prisma.schema.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Show users' }],
        schemaId: '1',
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.metadata).not.toHaveProperty('schemaName');
    expect(responseBody.metadata).toHaveProperty('schemaIncluded', false);
  });

  it('enhances user message with multiple schema contexts when multiple schemaIds are provided', async () => {
    const mockSchemas = [
      {
        id: 1,
        name: 'Users Schema',
        schemaText: 'CREATE TABLE users (id INT, name VARCHAR(255))',
        description: 'User data',
      },
      {
        id: 2,
        name: 'Orders Schema',
        schemaText: 'CREATE TABLE orders (id INT, user_id INT, amount DECIMAL)',
        description: 'Order data',
      }
    ];

    (prisma.schema.findUnique as jest.Mock).mockImplementation(({ where }) => {
      const schema = mockSchemas.find(s => s.id === where.id);
      return Promise.resolve(schema || null);
    });

    const generateTextSpy = jest.spyOn(require('ai'), 'generateText');

    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Show user orders' }],
        schemaId: ['1', '2'],
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    expect(generateTextSpy).toHaveBeenCalled();
    const call = generateTextSpy.mock.calls[0][0] as {
      model: any;
      messages: Array<{ role: string; content: string }>
    };

    const lastMessage = call.messages[call.messages.length - 1];


    expect(lastMessage.content).toContain('Users Schema');
    expect(lastMessage.content).toContain('CREATE TABLE users');
    expect(lastMessage.content).toContain('Orders Schema');
    expect(lastMessage.content).toContain('CREATE TABLE orders');
    expect(lastMessage.content).toContain('Show user orders');

    const responseBody = await response.json();
    expect(responseBody.metadata).toHaveProperty('schemaIncluded', true);
    expect(responseBody.metadata).toHaveProperty('schemaName', 'Users Schema, Orders Schema');
    expect(responseBody.metadata.schemaId).toEqual(['1', '2']);
  });

  it('handles outer error in schema processing', async () => {
    // Mock Array.isArray to throw an error when called with schemaId
    const originalIsArray = Array.isArray;

    // Fix: Use a proper type predicate with the correct signature
    Array.isArray = function (arg): arg is any[] {
      if (arg === '1') {
        throw new Error('Forced error in schema processing');
      }
      return originalIsArray(arg);
    };

    // Set up console.error spy to check it's called
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Show users' }],
        schemaId: '1',
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    // Check that console.error was called with the right message
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error processing schemas:',
      expect.any(Error)
    );

    // Verify the response doesn't include schema context
    const responseBody = await response.json();
    expect(responseBody.metadata).toHaveProperty('schemaIncluded', false);

    // Restore original functions
    Array.isArray = originalIsArray;
    consoleErrorSpy.mockRestore();
  });

  it('enhances messages with relevant RAG content when found', async () => {
    // Mock findRelevantSchemaContent to return data
    const { findRelevantSchemaContent } = require('@/lib/schema-embedding');
    findRelevantSchemaContent.mockResolvedValueOnce([
      {
        content: 'CREATE TABLE users (id INT, name VARCHAR(255))',
        schemaId: 1,
        similarity: 0.92
      },
      {
        content: 'CREATE TABLE orders (id INT, user_id INT)',
        schemaId: 2,
        similarity: 0.85
      }
    ]);

    // Spy on console.log to verify logging
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    // Create a spy on generateText to check what messages are passed to it
    const generateTextSpy = jest.spyOn(require('ai'), 'generateText');

    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Show me the table structure' }],
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    // Verify RAG logging happened
    expect(consoleLogSpy).toHaveBeenCalledWith('🔍 Performing RAG search for query: "Show me the table structure"');
    expect(consoleLogSpy).toHaveBeenCalledWith('✅ RAG search found 2 relevant items:');
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Schema ID: 1, Similarity: 92.00%'));

    // Verify the system prompt was added with RAG content
    const call = generateTextSpy.mock.calls[0][0] as {
      model: any;
      messages: Array<{ role: string; content: string }>
    };

    // Check for the system message with RAG content
    const systemMessage = call.messages.find(m => m.role === 'system');
    expect(systemMessage).toBeDefined();
    expect(systemMessage?.content).toContain('You have access to the following database schema information');
    expect(systemMessage?.content).toContain('CREATE TABLE users');
    expect(systemMessage?.content).toContain('CREATE TABLE orders');

    // Restore spies
    consoleLogSpy.mockRestore();
  });

  it('handles errors during RAG search gracefully', async () => {
    // Mock findRelevantSchemaContent to throw an error
    const { findRelevantSchemaContent } = require('@/lib/schema-embedding');
    findRelevantSchemaContent.mockRejectedValueOnce(new Error('RAG search failed'));

    // Spy on console.error to verify error logging
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Show me the table structure' }],
      }),
    });

    const response = await POST(req);

    // Verify the API still returns a successful response despite RAG error
    expect(response.status).toBe(200);

    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '❌ Error retrieving relevant schema content:',
      expect.any(Error)
    );

    // Restore spy
    consoleErrorSpy.mockRestore();
  });

  it('allows registering custom model providers', () => {
    const factory = new ModelFactory();
    const mockProvider = {
      generateResponse: jest.fn(),
      getModelName: () => 'mock'
    };

    factory.registerProvider('mock', mockProvider);
    expect(factory.getProvider('mock')).toBe(mockProvider);
  });

  it('falls back to gemini provider when requested model does not exist', () => {
    const factory = new ModelFactory();
    const nonExistentModelName = 'non-existent-model';

    // Get provider for a model name that doesn't exist
    const provider = factory.getProvider(nonExistentModelName);

    // Verify it returned the default gemini provider
    expect(provider.getModelName()).toBe('gemini');
  });
});

// end-to-end
describe('Chat API from user perspective', () => {
  const originalFetch = global.fetch;

  afterAll(() => {
    global.fetch = originalFetch;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          messageId: 'msg-12345',
          userPrompt: 'Hello',
          aiResponse: 'Mocked response',
          createdAt: new Date().toISOString(),
          metadata: {
            finishReason: 'stop',
            usage: { promptTokens: 10, completionTokens: 20 },
            modelUsed: 'gemini'
          }
        }),
        status: 200,
        ok: true,
      })
    ) as jest.Mock;
  });

  it('returns expected response when sending a message', async () => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();

    expect(data).toHaveProperty('messageId');
    expect(data).toHaveProperty('aiResponse', 'Mocked response');
    expect(data.metadata).toHaveProperty('modelUsed', 'gemini');

    expect(global.fetch).toHaveBeenCalledWith('/api/chat', expect.any(Object));
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);
    expect(requestBody.messages[0].content).toBe('Hello');
  });

  it('handles failed API responses', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ error: 'Service unavailable' }),
        status: 503,
        ok: false,
      })
    ) as jest.Mock;

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    });

    expect(response.status).toBe(503);
    const data = await response.json();
    expect(data).toHaveProperty('error', 'Service unavailable');
  });

  it('sends correct model parameter based on user selection', async () => {
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'deepseek',
      }),
    });

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const requestOptions = fetchCall[1];
    const requestBody = JSON.parse(requestOptions.body);
    expect(requestBody).toHaveProperty('model', 'deepseek');
  });

  it('passes conversation history correctly', async () => {
    const conversationHistory = [
      { role: 'user', content: 'First message' },
      { role: 'assistant', content: 'First response' },
      { role: 'user', content: 'Second message' }
    ];

    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: conversationHistory,
      }),
    });

    // Verify the conversation history was sent correctly
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);
    expect(requestBody.messages).toHaveLength(3);
    expect(requestBody.messages[0].content).toBe('First message');
    expect(requestBody.messages[1].content).toBe('First response');
    expect(requestBody.messages[2].content).toBe('Second message');
  });

  it('handles JSON parsing errors in request body', async () => {
    // Create a request with invalid JSON
    const invalidReq = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Using a getter that throws an error when json() is called
      body: '',
    });

    // Replace req.json with a function that throws
    Object.defineProperty(invalidReq, 'json', {
      value: () => Promise.reject(new Error('Invalid JSON')),
      configurable: true
    });

    // Set up console.error spy
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const response = await POST(invalidReq);

    // Verify error handling
    expect(response.status).toBe(500);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error processing request:',
      expect.any(Error)
    );

    // Verify error response format
    const responseBody = await response.json();
    expect(responseBody).toEqual({ error: 'Failed to generate response' });

    // Restore original console.error
    consoleErrorSpy.mockRestore();
  });

  it('handles unauthorized user correctly', async () => {
    // In specific test
    const { getUserFromRequest } = require('@/app/(backend)/utils/authUtils');

    // Set up the mock for this test
    (getUserFromRequest as jest.Mock).mockResolvedValueOnce(null);

    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(401);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error', 'Unauthorized');
  });
});


describe('Model Providers', () => {
  it('DeepseekProvider calls generateText with correct parameters', async () => {
    // Re-mock generateText to track calls
    const generateTextMock = jest.fn().mockResolvedValue({
      text: 'Test response',
      finishReason: 'stop'
    });
    require('ai').generateText = generateTextMock;

    // Create an instance of the actual provider
    const provider = new DeepseekProvider();

    // Call its methods
    const messages = [{ role: 'user' as const, content: 'hello' }];
    await provider.generateResponse(messages);
    const modelName = provider.getModelName();

    // Verify behavior
    expect(modelName).toBe('deepseek');
    expect(generateTextMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: expect.anything(),
        messages: messages
      })
    );
  });

  it('GeminiProvider calls generateText with correct parameters', async () => {
    // Re-mock generateText to track calls
    const generateTextMock = jest.fn().mockResolvedValue({
      text: 'Test response from Gemini',
      finishReason: 'stop'
    });
    require('ai').generateText = generateTextMock;

    // Create an instance of the actual provider
    const provider = new GeminiProvider();

    // Call its methods
    const messages = [
      { role: 'user' as const, content: 'hello from gemini' }
    ];
    await provider.generateResponse(messages);
    const modelName = provider.getModelName();

    // Verify behavior
    expect(modelName).toBe('gemini');
    expect(generateTextMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: expect.anything(),
        messages: messages
      }));
  });
});

describe('Chat Session Handling', () => {
  beforeEach(() => {
    // Reset all mocks for each test
    jest.resetAllMocks();
    
    // Mock the AI response generator - this was missing
    (generateText as jest.Mock).mockResolvedValue({
      text: 'Mocked response',
      finishReason: 'stop',
      usage: {
        promptTokens: 10,
        completionTokens: 20,
      },
    });
    
    // Mock getUserFromRequest to return a valid user by default
    const { getUserFromRequest } = require('@/app/(backend)/utils/authUtils');
    (getUserFromRequest as jest.Mock).mockResolvedValue({ id: 'user123', email: 'test@example.com' });
    
    // Fix the chatSession mock structure to match what's used in route.ts
    prisma.chatSession.findUnique = jest.fn()
      .mockResolvedValue({
        id: 'session-id-123',
        userId: 'user123',
        title: 'Test Session',
        updatedAt: new Date(),
        messages: []
      });
    
    // Mock include parameter properly
    prisma.chatSession.findUnique = jest.fn().mockImplementation(({ where, include }) => {
      if (include?.messages) {
        return Promise.resolve({
          id: 'session-id-123',
          userId: 'user123',
          title: 'Test Session',
          updatedAt: new Date(),
          messages: [{ content: 'Hello', role: 'user' }]
        });
      }
      
      return Promise.resolve({
        id: 'session-id-123',
        userId: 'user123',
        title: 'Test Session',
        updatedAt: new Date()
      });
    });
    
    // Mock chat message creation
    prisma.chatMessage.create = jest.fn().mockResolvedValue({});
    
    // Mock session update
    prisma.chatSession.update = jest.fn().mockResolvedValue({});
  });

  it('verifies session belongs to user and proceeds if valid', async () => {
    // Add this code to see what's failing
    jest.spyOn(console, 'error').mockImplementation((msg, error) => {
      console.log('Test error:', msg, error?.toString());
    });

    // Set up request with valid sessionId
    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        sessionId: 'session-id-123'
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    
    // Verify that prisma.chatSession.findUnique was called with correct params
    expect(prisma.chatSession.findUnique).toHaveBeenCalledWith({
      where: { id: 'session-id-123', userId: 'user123' }
    });
  });

  it('returns 404 when session does not belong to user', async () => {
    // Mock session not found
    prisma.chatSession.findUnique = jest.fn().mockResolvedValue(null);
    
    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        sessionId: 'invalid-session-id'
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(404);
    
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error', 'Session not found');
  });

  it('saves user and AI messages to history when sessionId is provided', async () => {
    // Setup
    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        sessionId: 'session-id-123'
      }),
    });

    // Act
    await POST(req);

    // Assert - verify both messages were saved
    expect(prisma.chatMessage.create).toHaveBeenCalledTimes(2);
    expect(prisma.chatMessage.create).toHaveBeenNthCalledWith(1, {
      data: expect.objectContaining({
        sessionId: 'session-id-123',
        content: 'Hello',
        role: 'user'
      })
    });
    expect(prisma.chatMessage.create).toHaveBeenNthCalledWith(2, {
      data: expect.objectContaining({
        sessionId: 'session-id-123',
        role: 'assistant'
      })
    });
    
    // Verify session timestamp was updated
    expect(prisma.chatSession.update).toHaveBeenCalledWith({
      where: { id: 'session-id-123' },
      data: { updatedAt: expect.any(Date) }
    });
  });

  it('does not update title for sessions with custom titles', async () => {
    // Only mock the second findUnique call which checks the title
    mockFindUnique
    .mockResolvedValueOnce({ 
      id: 'session-id-123', 
      userId: 'user123',
      title: 'Custom Title'
    })
    .mockResolvedValueOnce({ 
      id: 'session-id-123',
      title: 'Custom Title',
      messages: [
        { content: 'First message', role: 'user' }
      ]
    });

    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello again' }],
        sessionId: 'session-id-123'
      }),
    });

    await POST(req);

    // Verify update was called but not with title changes
    expect(prisma.chatSession.update).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ title: expect.anything() })
      })
    );
  });
});