import { 
  ModelFactory, 
  PrismaSchemaRepository,
  SchemaContextEnhancer, 
  ResponseFormatter, 
  RequestValidator, 
  ErrorHandler,
  Message 
} from '../../services/chatServices';
import { findRelevantSchemaContent } from '@/lib/schema-embedding';

// Define an interface for the relevant content items
export interface RelevantSchemaContentItem {
  content: string;
  schemaId: number;
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
    const { messages, model = 'gemini', schemaId } = await req.json();
    
    // Log received schema IDs
    console.log(`📋 Chat request received with schema IDs: ${JSON.stringify(schemaId)}`);
    
    // Validate request
    const validation = validator.validateMessages(messages);
    if (!validation.isValid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // First enhance messages with schema context if explicitly provided
    const { enhancedMessages, schemaIncluded, schemaName } = 
      await contextEnhancer.enhanceWithSchemaContext(messages, schemaId);

    // Then add RAG content using schema embeddings
    const lastUserMessage = messages.findLast((m: Message) => m.role === 'user');
    let relevantContentFound = false;

    if (lastUserMessage) {
      try {
        // Log RAG search query
        console.log(`🔍 Performing RAG search for query: "${lastUserMessage.content.substring(0, 50)}${lastUserMessage.content.length > 50 ? '...' : ''}"`);
        
        // Pass schemaId to the search function
        const relevantContent = await findRelevantSchemaContent(
          lastUserMessage.content,
          schemaId // Pass the schemaId to limit search scope
        ) as RelevantSchemaContentItem[];
        
        relevantContentFound = relevantContent && relevantContent.length > 0;

        // Log RAG search results
        if (relevantContentFound) {
          console.log(`✅ RAG search found ${relevantContent.length} relevant items:`);
          relevantContent.forEach((item, index) => {
            console.log(`  ${index + 1}. Schema ID: ${item.schemaId}, Similarity: ${(item.similarity * 100).toFixed(2)}%, Content: "${item.content.substring(0, 50)}..."`);
          });
          
          const contextPrompt = `You have access to the following database schema information that might be relevant:
${relevantContent.map((item: RelevantSchemaContentItem) => `${item.content}`).join('\n\n')}

Use this schema information if relevant to answer the user's question.`;
          
          // Add the RAG content to the enhanced messages
          enhancedMessages.unshift({ role: 'system', content: contextPrompt });
        } else {
          console.log(`❌ No relevant schema content found for the query.`);
        }
      } catch (error) {
        console.error('❌ Error retrieving relevant schema content:', error);
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
      schemaIncluded || relevantContentFound,
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