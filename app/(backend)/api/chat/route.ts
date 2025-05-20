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
import { getUserFromRequest } from '@/app/(backend)/utils/authUtils';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { ServiceFactory } from '@backend/factories/serviceFactory';
import { QueryReportProcessor } from '@backend/services/query/QueryReportProcessor';
import { apiResponseDuration, apiMetrics } from '@/app/(backend)/utils/metrics';

// Define an interface for the relevant content items
export interface RelevantSchemaContentItem {
  content: string;
  schemaId: number;
  similarity: number;
}

const route = '/api/chat';
export async function POST(req: Request) {
  const method = 'POST';
  const endTimer = apiResponseDuration.startTimer({ route, method });
  apiMetrics(method, route);
  const errorHandler = new ErrorHandler();
  const validator = new RequestValidator();
  const factory = new ModelFactory();
  const formatter = new ResponseFormatter();
  const schemaRepository = new PrismaSchemaRepository();
  const contextEnhancer = new SchemaContextEnhancer(schemaRepository);

  try {
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const providerService = ServiceFactory.getProviderService();
    const activeProvider = await providerService.getActiveOrDefaultProvider();

    // Tambahkan log debugging
    console.log('Debug - Active Provider:', activeProvider ? {
      id: activeProvider.id,
      name: activeProvider.name,
      isActive: activeProvider.isActive,
      activeModel: activeProvider.activeModel ? {
        id: activeProvider.activeModel.id,
        name: activeProvider.activeModel.name
      } : 'No active model'
    } : 'No active provider found');

    // Extract sessionId from request (keep other params as they are)
    const { messages, model = activeProvider?.activeModel?.name || 'gemini', schemaId, sessionId, serviceIds } = await req.json();

    // Log what model will be used
    console.log('Debug - Using model:', model);

    // Verify this session belongs to the user if sessionId is provided
    if (sessionId) {
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId, userId: user.id },
      });
      
      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
    }
    
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
    // Get the appropriate model provider
    const provider = factory.getProvider(model);
    
    // Debug provider info
    console.log('Debug - Selected Provider:', {
      model: model,
      providerName: provider.constructor.name,
      modelName: provider.getModelName()
    });
    
    // Generate response with enhanced messages
    const result = await provider.generateResponse(enhancedMessages);
    const validationResults = QueryReportProcessor.getInstance().processReport(result.text);
    console.log('Query Validation Results:', validationResults);
    const response = formatter.formatResponse(
      result, 
      messages,
      provider.getModelName(),
      schemaId,
      schemaIncluded || relevantContentFound,
      schemaName,
      validationResults
    );

    const aiResponse = response.aiResponse;
    const metadata = { modelUsed: provider.getModelName() };
    
    // Debug print for metadata
    console.log('Debug - Response metadata:', {
      modelUsed: metadata.modelUsed,
      schemaId,
      schemaIncluded: schemaIncluded || relevantContentFound,
      schemaName
    });

    // Save the conversation to history if sessionId is provided
    if (sessionId) {
      // Save the user message - the last message in the array
      await prisma.chatMessage.create({
        data: {
          sessionId,
          content: messages[messages.length - 1].content,
          role: 'user',
        }
      });
      
      // Save the AI response
      await prisma.chatMessage.create({
        data: {
          sessionId,
          content: aiResponse,
          role: 'assistant',
          modelUsed: metadata.modelUsed
        }
      });
      
      // Update session timestamp to show as most recent
      if (serviceIds && serviceIds.length > 0) {
        // Update session with service selection
        await prisma.chatSession.update({
          where: { id: sessionId, userId: user.id },
          data: {
            lastSelectedServices: serviceIds,
            updatedAt: new Date()
          }
        });
      } else {
        // Just update timestamp if no services provided
        await prisma.chatSession.update({
          where: { id: sessionId },
          data: { updatedAt: new Date() }
        });
      }
      
      // If it's a new session, update title based on first message
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: { 
          messages: { 
            where: { role: 'user' },
            orderBy: { createdAt: 'asc' },
            take: 1 
          }
        }
      });
      
      if (session?.title === 'New Chat' && session.messages.length > 0) {
        const generateTitle = await provider.generateResponse(
          [
            { role: 'user', content: `Buatkan judul singkat maksimal 5 kata dari 
              pertanyaan berikut, cocok untuk dijadikan nama sesi 
              chat:\n\n"${messages[0].content}"\n\nJawaban hanya judulnya saja 
              tanpa tanda kutip atau penjelasan.` }
          ]
        );
        const title = generateTitle.text.replace(/\\/g, "").trim();
        
        await prisma.chatSession.update({
          where: { id: sessionId },
          data: { title }
        });
      }
    }
    
    endTimer({ route, method });
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    endTimer({ route, method });
    return errorHandler.handleError(error);
  }
}