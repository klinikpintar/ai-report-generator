import { 
  ModelFactory, 
  PrismaSchemaRepository,
  SchemaContextEnhancer, 
  ResponseFormatter, 
  RequestValidator, 
  ErrorHandler,
  Message 
} from '../../services/chatServices';
import { findRelevantContent } from '@/lib/embedding';

// Define an interface for the relevant content items
export interface RelevantContentItem {
  content: string;
  similarity: number;
}

export async function POST(req: Request) {
  const errorHandler = new ErrorHandler();
  const validator = new RequestValidator();
  const factory = new ModelFactory();
  const formatter = new ResponseFormatter();
  const schemaRepository = new PrismaSchemaRepository();
  const contextEnhancer = new SchemaContextEnhancer(schemaRepository);

  try {
    const { messages, model = 'gemini', schemaId, resourceIds = [] } = await req.json();
    
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

    // Then add RAG content to the ENHANCED messages
    const lastUserMessage = messages.findLast((m: Message) => m.role === 'user');
    
    // Track if any relevant content was found
    let relevantContentFound = false;

    if (lastUserMessage) {
      try {
        // Add type annotation to the relevantContent variable
        const relevantContent = await findRelevantContent(lastUserMessage.content, resourceIds) as RelevantContentItem[];
        
        relevantContentFound = relevantContent && relevantContent.length > 0;

        if (relevantContentFound) {
          const contextPrompt = `You have access to the following information that might be relevant:
${relevantContent.map((item: RelevantContentItem) => `${item.content}`).join('\n\n')}

Use this information if relevant to answer the user's question.`;
          
          // Add the RAG content to the enhanced messages
          enhancedMessages.unshift({ role: 'system', content: contextPrompt });
        }
      } catch (error: unknown) {
        console.error('Error retrieving relevant content:', error);
        return errorHandler.handleError(error);
      }
    }
    
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
      schemaName,
      resourceIds,
      relevantContentFound
    );
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: 'Failed to generate response' }), 
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}