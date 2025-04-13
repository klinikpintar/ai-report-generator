import { embed } from 'ai';
import { google } from '@ai-sdk/google';
import prisma from './prisma';
import { Prisma } from '@prisma/client';

const embeddingModel = google.textEmbeddingModel('text-embedding-004');

// Generate an embedding for a specific text
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const { embedding } = await embed({
      model: embeddingModel,
      value: text,
    });
    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

// Generate helpful chunks from a schema
function generateSchemaChunks(schema: { id: number; name: string; description: string; schemaText: string }): Array<{ schemaId: number; content: string }> {
  const chunks: Array<{ schemaId: number; content: string }> = [];
  
  // Add schema overview
  chunks.push({
    schemaId: schema.id,
    content: `Schema: ${schema.name}\nDescription: ${schema.description}`,
  });
  
  // Add complete schema
  chunks.push({
    schemaId: schema.id,
    content: `Complete Schema Definition:\n${schema.schemaText}`,
  });
  
  // Extract and add individual table definitions
  const tableMatches = schema.schemaText.match(/CREATE TABLE\s+(\w+)\s*\([\s\S]+?\);/g);
  if (tableMatches) {
    tableMatches.forEach(tableDefinition => {
      const tableName = tableDefinition.match(/CREATE TABLE\s+(\w+)/)?.[1];
      chunks.push({
        schemaId: schema.id,
        content: `Table: ${tableName} in Schema ${schema.name}\n${tableDefinition}`,
      });
    });
  }
  
  return chunks;
}

// Generate embeddings for a schema and store them
export async function generateSchemaEmbeddings(schema: { id: number; name: string; description: string; schemaText: string }): Promise<void> {
  try {
    console.log(`Generating embeddings for schema ${schema.id}: ${schema.name}`);
    
    // First, delete any existing embeddings for this schema
    await prisma.schemaEmbedding.deleteMany({
      where: { schemaId: schema.id },
    });
    
    // Generate chunks from the schema
    const chunks = generateSchemaChunks(schema);
    console.log(`Generated ${chunks.length} chunks for schema ${schema.id}`);
    
    // Generate and store embeddings for each chunk
    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk.content);
      
      // Replace the problematic prisma.create with raw SQL:
      await prisma.$executeRaw`
        INSERT INTO "SchemaEmbedding" ("schemaId", "content", "embedding", "createdAt", "updatedAt")
        VALUES (${chunk.schemaId}, ${chunk.content}, ${embedding}::vector, NOW(), NOW())
      `;
    }
    
    console.log(`Successfully generated embeddings for schema ${schema.id}`);
  } catch (error) {
    console.error(`Error generating embeddings for schema ${schema.id}:`, error);
    throw error;
  }
}

// Search for relevant schema content based on a user query
export async function findRelevantSchemaContent(
  userQuery: string,
  schemaIds?: number[] | string[]
): Promise<Array<{ content: string; schemaId: number; similarity: number }>> {
  try {
    const queryEmbedding = await generateEmbedding(userQuery);
    
    // Build WHERE clause for schema filtering
    let whereClause = '';
    if (schemaIds && schemaIds.length > 0) {
      // Convert string IDs to numbers if needed
      const normalizedIds = schemaIds.map(id => typeof id === 'string' ? parseInt(id) : id);
      whereClause = `AND "schemaId" IN (${normalizedIds.join(',')})`;
      console.log(`🔍 Limiting RAG search to schema IDs: [${normalizedIds.join(', ')}]`);
    } else {
      console.log(`🔍 Performing global RAG search (no schema ID filter)`);
    }
    
    // Use vector similarity search with optional schema filter
    const relevantContent = await prisma.$queryRaw`
      SELECT "content", "schemaId", 1 - ("embedding" <=> ${queryEmbedding}::vector) as "similarity"
      FROM "SchemaEmbedding"
      WHERE 1 - ("embedding" <=> ${queryEmbedding}::vector) > 0.6
      ${Prisma.raw(whereClause)}
      ORDER BY "similarity" DESC
      LIMIT 5
    `;
    
    return relevantContent as Array<{ content: string; schemaId: number; similarity: number }>;
  } catch (error) {
    console.error('Error finding relevant schema content:', error);
    return [];
  }
}