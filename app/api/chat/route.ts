import { google } from '@ai-sdk/google';
import { generateText } from 'ai'; 
export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await generateText({
    model: google('gemini-2.0-flash', 
      {useSearchGrounding: true}
    ),
    messages,
  });

  const response = {
    messageId: `msg-${Date.now()}`, 
    userPrompt: messages[messages.length - 1].content, 
    aiResponse: result.text, 
    createdAt: new Date().toISOString(), 
    metadata: {
      finishReason: result.finishReason || 'stop', 
      usage: {
        promptTokens: result.usage?.promptTokens || 0, 
        completionTokens: result.usage?.completionTokens || 0,
      },
    },
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}