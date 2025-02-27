import { POST } from '../../../api/chat/route';
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

jest.mock('@ai-sdk/google', () => ({
  google: jest.fn().mockReturnValue('mocked-model'),
}));

describe('POST /api/chat', () => {
  it('checks if the API works', async () => {
    // Now Request should be available globally from jest.setup.ts
    const req = new Request('http://localhost/api/chat', {
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
});