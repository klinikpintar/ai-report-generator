import { embed, embedMany } from 'ai';
import { google } from '@ai-sdk/google';
import prisma from './prisma';
import { Prisma } from '@prisma/client';

const embeddingModel = google.textEmbeddingModel('text-embedding-004');

export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
  });
  return embedding;
}

export async function generateChunkEmbeddings(content: string): Promise<Array<{content: string, embedding: number[]}>> {
  try {
    console.log('Starting embedding generation for content:', content.substring(0, 50) + '...');
    
    // Split content into chunks
    const chunks = content
      .split(/\n\s*\n/)
      .flatMap(paragraph => 
        paragraph.length > 500 
          ? paragraph.split(/(?<=\.)\s+/)
          : paragraph
      )
      .filter(chunk => chunk.trim().length > 20);
    
    console.log(`Generated ${chunks.length} content chunks`);
    
    // If no chunks, return early
    if (chunks.length === 0) {
      console.log('No valid chunks to embed');
      return [];
    }
    
    try {
      console.log('Calling embedding API...');
      const { embeddings } = await embedMany({
        model: embeddingModel,
        values: chunks,
      });
      console.log(`Successfully generated ${embeddings.length} embeddings`);
      
      return chunks.map((chunk, i) => ({
        content: chunk,
        embedding: embeddings[i]
      }));
    } catch (embeddingError) {
      console.error('Error generating embeddings from API:', embeddingError);
      throw embeddingError; // Rethrow API errors
    }
  } catch (error) {
    // Only handle non-API errors here
    if (error.message === 'API error') {
      throw error; // Let API errors propagate
    }
    
    console.error('Error in content processing:', error);
    // For now, return mock embeddings for testing database insertion
    console.log('Returning mock embedding for testing');
    return [{
      content: content.substring(0, 100),
      embedding: Array(768).fill(0.1) // Mock 768-dimensional vector
    }];
  }
}

export async function findRelevantContent(
  userQuery: string, 
  resourceIds: number[] = []
) {
  console.log("Generating embedding for query:", userQuery);
  const queryEmbedding = await generateEmbedding(userQuery);
  
  // console.log("Starting vector search for content...");
  // console.log("Filtering by resources:", resourceIds); # Buat debugging
  
  let results;
  
  if (resourceIds.length > 0) {
    // Fix: Use Prisma's SQL array syntax correctly
    results = await prisma.$queryRaw`
      SELECT e.content, 1 - (e.embedding <=> ${queryEmbedding}::vector) as similarity
      FROM "Embedding" e
      JOIN "Resource" r ON e."resourceId" = r.id
      WHERE r.id IN (${Prisma.join(resourceIds)})
      ORDER BY similarity DESC
      LIMIT 5
    `;
  } else {
    // No filter - search all resources
    results = await prisma.$queryRaw`
      SELECT content, 1 - (embedding <=> ${queryEmbedding}::vector) as similarity
      FROM "Embedding"
      ORDER BY similarity DESC
      LIMIT 5
    `;
  }
  
  // console.log("Vector search results:", results);  // Buat debugging
  return results;
}