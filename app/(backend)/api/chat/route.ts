import { google } from '@ai-sdk/google';
import { deepseek } from '@ai-sdk/deepseek';
import { generateText } from 'ai';

export async function POST(req: Request) {
  try {
    const { messages, model = 'gemini', schemaId } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'No messages provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const invalidMessage = messages.find(
      (msg) => !msg.role || !msg.content || typeof msg.content !== 'string'
    );
    if (invalidMessage) {
      return new Response(JSON.stringify({ error: 'Invalid message format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Process schemaId - can be single ID or array
    let normalizedSchemaId = schemaId;
    if (schemaId !== undefined && !Array.isArray(schemaId)) {
      // If it's a single value, keep it as is
      normalizedSchemaId = schemaId;
    }

    let result;
    
    switch (model) {
      case 'deepseek':
        result = await generateText({
          model: deepseek('deepseek-chat'),
          messages,
        });
        break;
      case 'gemini':
      default:
        result = await generateText({
          model: google('gemini-2.0-flash', {
            useSearchGrounding: true,
          }),
          messages,
        });
        break;
    }

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
        modelUsed: model,
        ...(normalizedSchemaId !== undefined && { schemaId: normalizedSchemaId })
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate response' }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}