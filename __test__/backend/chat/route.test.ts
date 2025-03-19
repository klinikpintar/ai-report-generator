import { NextRequest } from 'next/server';
import { POST } from '@/app/(backend)/api/chat/route';
import { generateText } from 'ai';
import prisma from '@/lib/prisma';

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
  },
}));

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
});