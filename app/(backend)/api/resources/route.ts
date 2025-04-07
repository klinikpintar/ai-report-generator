// app/(backend)/api/resources/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateChunkEmbeddings } from '@/lib/embedding';
import { z } from 'zod';

// Schema for resource validation
const resourceSchema = z.object({
  content: z.string().min(10, "Content must be at least 10 characters long"),
  title: z.string().min(3, "Title must be at least 3 characters long")
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = resourceSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const { content, title } = validation.data;
    
    // Create the resource
    const resource = await prisma.resource.create({
      data: { 
        title,
        content
      }
    });
    
    // Generate embeddings for the content chunks
    const embeddings = await generateChunkEmbeddings(content);
    
    // Store embeddings using raw SQL instead of createMany
    if (embeddings.length > 0) {
      for (const item of embeddings) {
        await prisma.$executeRaw`
          INSERT INTO "Embedding" ("resourceId", "content", "embedding", "createdAt", "updatedAt")
          VALUES (${resource.id}, ${item.content}, ${item.embedding}::vector, NOW(), NOW())
        `;
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      resourceId: resource.id 
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating resource:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json(
      { error: 'Failed to create resource: ' + errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ resources });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}