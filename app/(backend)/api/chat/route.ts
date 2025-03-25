import { google } from '@ai-sdk/google';
import { deepseek } from '@ai-sdk/deepseek';
import { generateText, CoreMessage } from 'ai'; 
import prisma from '@/lib/prisma';

// Types and interfaces
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface Schema {
  id: number;
  name: string;
  schemaText: string;
}

interface GenerationResult {
  text: string;
  finishReason?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
  };
}

interface ApiResponse {
  messageId: string;
  userPrompt: string;
  aiResponse: string;
  createdAt: string;
  metadata: {
    finishReason: string;
    usage: {
      promptTokens: number;
      completionTokens: number;
    };
    modelUsed: string;
    schemaId?: string | string[];
    schemaIncluded?: boolean;
    schemaName?: string;
  };
}

interface ModelProvider {
  generateResponse(messages: Message[]): Promise<GenerationResult>;
  getModelName(): string;
}

class DeepseekProvider implements ModelProvider {
  generateResponse(messages: Message[]): Promise<GenerationResult> {
    const sdkMessages = messages as CoreMessage[];
    
    return generateText({
      model: deepseek('deepseek-chat'),
      messages: sdkMessages,
    });
  }

  getModelName(): string {
    return 'deepseek';
  }
}

class GeminiProvider implements ModelProvider {
  generateResponse(messages: Message[]): Promise<GenerationResult> {
    const sdkMessages = messages as CoreMessage[];
    
    return generateText({
      model: google('gemini-2.0-flash', {
        useSearchGrounding: true,
      }),
      messages: sdkMessages,
    });
  }

  getModelName(): string {
    return 'gemini';
  }
}

class ModelFactory {
  private providers: Record<string, ModelProvider> = {
    'deepseek': new DeepseekProvider(),
    'gemini': new GeminiProvider(),
  };

  getProvider(modelName: string): ModelProvider {
    return this.providers[modelName] || this.providers['gemini'];
  }

  registerProvider(name: string, provider: ModelProvider): void {
    this.providers[name] = provider;
  }
}

class RequestValidator {
  private isValidMessage(obj: unknown): obj is { role: string; content: string } {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'role' in obj &&
      'content' in obj &&
      typeof (obj as Record<string, unknown>).content === 'string'
    );
  }

  validateMessages(messages: unknown[]): { isValid: boolean; error?: string } {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return { 
        isValid: false, 
        error: 'No messages provided' 
      };
    }

    const invalidMessage = messages.find(
      (msg) => !this.isValidMessage(msg) || !msg.role
    );

    if (invalidMessage) {
      return { 
        isValid: false, 
        error: 'Invalid message format' 
      };
    }

    return { isValid: true };
  }
}

interface SchemaRepository {
  getSchemaById(id: number): Promise<Schema | null>;
}

class PrismaSchemaRepository implements SchemaRepository {
  async getSchemaById(id: number): Promise<Schema | null> {
    try {
      return await prisma.schema.findUnique({
        where: { id },
        select: { id: true, name: true, schemaText: true }
      });
    } catch (error) {
      console.error(`Error fetching schema with ID ${id}:`, error);
      return null;
    }
  }
}

class SchemaContextEnhancer {
  private repository: SchemaRepository;
  
  constructor(repository: SchemaRepository) {
    this.repository = repository;
  }
  
  async enhanceWithSchemaContext(
    messages: Message[], 
    schemaId: string | string[] | undefined
  ): Promise<{
    enhancedMessages: Message[],
    schemaIncluded: boolean,
    schemaName: string | null
  }> {
    // Default values for no enhancement
    const enhancedMessages = [...messages]; 
    let schemaIncluded = false;
    let schemaName: string | null = null;
    
    if (!schemaId) {
      return { enhancedMessages, schemaIncluded, schemaName };
    }
    
    try {
      const fetchedSchemas: Schema[] = [];
      const schemaIds = Array.isArray(schemaId) ? schemaId : [schemaId];
      
      // Fetch all schemas
      for (const id of schemaIds) {
        const schema = await this.repository.getSchemaById(parseInt(id));
        if (schema && schema.schemaText) {
          fetchedSchemas.push(schema);
        }
      }
      
      // If we found schemas, enhance the last user message
      if (fetchedSchemas.length > 0) {
        schemaIncluded = true;
        const lastUserMessageIndex = enhancedMessages.length - 1;
        
        if (enhancedMessages[lastUserMessageIndex].role === 'user') {
          let schemaContext = '';
          
          for (const schema of fetchedSchemas) {
            schemaName = schemaName ? `${schemaName}, ${schema.name}` : schema.name;
            schemaContext += `SQL Schema (${schema.name}):\n\`\`\`sql\n${schema.schemaText}\n\`\`\`\n\n`;
          }
          
          enhancedMessages[lastUserMessageIndex] = {
            ...enhancedMessages[lastUserMessageIndex],
            content: `${schemaContext}User Query: ${enhancedMessages[lastUserMessageIndex].content}`
          };
        }
      }
      
      return { enhancedMessages, schemaIncluded, schemaName };
    } catch (error) {
      console.error('Error processing schemas:', error);
      return {
        enhancedMessages: [...messages],
        schemaIncluded: false,
        schemaName: null
      };
    }
  }
}

class ResponseFormatter {
  formatResponse(
    result: GenerationResult, 
    messages: Message[], 
    modelName: string,
    schemaId?: string | string[],
    schemaIncluded?: boolean,
    schemaName?: string | null
  ): ApiResponse {
    return {
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
        modelUsed: modelName,
        ...(schemaId !== undefined && { schemaId }),
        ...(schemaIncluded !== undefined && { schemaIncluded }),
        ...(schemaName && { schemaName })
      },
    };
  }
}

class ErrorHandler {
  handleError(error: unknown): Response { // Changed from any to unknown
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

// Main handler (uses all the components)
export async function POST(req: Request) {
  const errorHandler = new ErrorHandler();
  const validator = new RequestValidator();
  const factory = new ModelFactory();
  const formatter = new ResponseFormatter();
  const schemaRepository = new PrismaSchemaRepository();
  const contextEnhancer = new SchemaContextEnhancer(schemaRepository);

  try {
    const { messages, model = 'gemini', schemaId } = await req.json();
    
    // Validate request
    const validation = validator.validateMessages(messages);
    if (!validation.isValid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Enhance messages with schema context if applicable
    const { enhancedMessages, schemaIncluded, schemaName } = 
      await contextEnhancer.enhanceWithSchemaContext(messages, schemaId);
    
    // Get the appropriate model provider
    const provider = factory.getProvider(model);
    
    // Generate response with enhanced messages
    const result = await provider.generateResponse(enhancedMessages);
    
    // Format response with schema metadata
    const response = formatter.formatResponse(
      result, 
      messages, // Original messages for userPrompt
      provider.getModelName(),
      schemaId,
      schemaIncluded,
      schemaName
    );
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return errorHandler.handleError(error);
  }
}

export { ModelFactory, SchemaContextEnhancer, ResponseFormatter, RequestValidator };