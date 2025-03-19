import { google } from '@ai-sdk/google';
import { deepseek } from '@ai-sdk/deepseek';
import { generateText } from 'ai';
import prisma from '@/lib/prisma';

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

    // Create a copy of messages for potential enhancement
    let enhancedMessages = [...messages];
    let schemaName = null;
    let schemaIncluded = false;
    
    // Try to process schemas, but don't let errors stop execution
    try {
      // Process schemaId - can be single ID or array
      let normalizedSchemaId = schemaId;
      if (schemaId !== undefined && !Array.isArray(schemaId)) {
        normalizedSchemaId = schemaId;
      }
      
      // If a schema ID is provided, fetch and enhance messages with schema context
      if (normalizedSchemaId !== undefined) {
        let fetchedSchemas = [];
        const schemaIds = Array.isArray(normalizedSchemaId) 
          ? normalizedSchemaId 
          : [normalizedSchemaId];
        
        // Fetch all selected schemas
        for (const id of schemaIds) {
          try {
            const schema = await prisma.schema.findUnique({
              where: { id: parseInt(id as string) },
              select: { name: true, schemaText: true }
            });
            
            if (schema && schema.schemaText) {
              fetchedSchemas.push(schema);
            }
          } catch (error) {
            console.error(`Error fetching schema with ID ${id}:`, error);
          }
        }
        
        // If any schemas were found, enhance the message
        if (fetchedSchemas.length > 0) {
          schemaIncluded = true;
          
          const lastUserMessageIndex = enhancedMessages.length - 1;
          if (enhancedMessages[lastUserMessageIndex].role === 'user') {
            let schemaContext = '';
            
            for (const schema of fetchedSchemas) {
              schemaName = schemaName ? `${schemaName}, ${schema.name}` : schema.name;
              schemaContext += `SQL Schema (${schema.name}):\n\`\`\`sql\n${schema.schemaText}\n\`\`\`\n\n`;
            }
            
            // Apply enhanced context
            enhancedMessages[lastUserMessageIndex].content = 
              `${schemaContext}User Query: ${enhancedMessages[lastUserMessageIndex].content}`;
          }
        }
      }
    } catch (error) {
      // Log but don't terminate processing
      console.error('Error processing schemas:', error);
      // Continue with original messages if there's an error
      enhancedMessages = [...messages]; 
      schemaName = null;
      schemaIncluded = false;
    }

    // Generate response with either enhanced or original messages
    let result;
    try {
      switch (model) {
        case 'deepseek':
          result = await generateText({
            model: deepseek('deepseek-chat'),
            messages: enhancedMessages,
          });
          break;
        case 'gemini':
        default:
          result = await generateText({
            model: google('gemini-2.0-flash', {
              useSearchGrounding: true,
            }),
            messages: enhancedMessages,
          });
          break;
      }
    } catch (aiError) {
      console.error('AI generation error:', aiError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate response' }), 
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const response = {
      messageId: `msg-${Date.now()}`, 
      userPrompt: messages[messages.length - 1].content, // Return original prompt
      aiResponse: result.text, 
      createdAt: new Date().toISOString(), 
      metadata: {
        finishReason: result.finishReason || 'stop', 
        usage: {
          promptTokens: result.usage?.promptTokens || 0, 
          completionTokens: result.usage?.completionTokens || 0,
        },
        modelUsed: model,
        ...(schemaId !== undefined && { schemaId }),
        schemaIncluded,
        ...(schemaName && { schemaName })
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