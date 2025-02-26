import { testApiHandler } from 'next-test-api-route-handler';
import { POST } from './route'; 

describe('POST /api/chat', () => {
  it('checks if the API works', async () => {
    await testApiHandler({
      handler: POST,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Hello' }],
          }),
        });
        expect(res.status).toBe(200); 
      },
    });
  });
});