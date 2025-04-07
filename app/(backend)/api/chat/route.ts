import { 
  ModelFactory, 
  PrismaSchemaRepository,
  SchemaContextEnhancer, 
  ResponseFormatter, 
  RequestValidator, 
  ErrorHandler 
} from '../../services/chatServices';
import { findRelevantContent } from '@/lib/embedding';

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
    const lastUserMessage = messages.findLast(m => m.role === 'user');
    
    if (lastUserMessage) {
      const relevantContent = await findRelevantContent(lastUserMessage.content, resourceIds);
      
      if (relevantContent && relevantContent.length > 0) {
        const contextPrompt = `You have access to the following information that might be relevant:
${relevantContent.map((item: { content: string; similarity: number }) => `${item.content}`).join('\n\n')}

Use this information if relevant to answer the user's question.`;
        
        // Add the RAG content to the enhanced messages
        enhancedMessages.unshift({ role: 'system', content: contextPrompt });
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