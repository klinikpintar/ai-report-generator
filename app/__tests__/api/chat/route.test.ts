import { POST } from '../../../api/chat/route';

describe('POST /api/chat', () => {
  it('checks if the API works', async () => {
    // Create a mock Request object
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    });

    // Call the handler directly
    const response = await POST(req);
    
    // Check the response
    expect(response.status).toBe(200);
    
    // If you want to check the response body
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('aiResponse');
  });
});