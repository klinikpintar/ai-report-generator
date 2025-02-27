import { NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import prisma from '@/lib/prisma';
import { CreateSchemaDto } from '../dtos/schema.dtos';
import { validateSchemaInput, handlePrismaError } from '../utils/schemaUtils';

export async function GET() {
  try {
    const schemas = await prisma.schema.findMany();
    return NextResponse.json(schemas, { status: StatusCodes.OK });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch schemas' }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = validateSchemaInput(body);
    
    const newSchema = await prisma.schema.create({
      data: validatedData,
    });

    return NextResponse.json(newSchema, { status: StatusCodes.CREATED });
  } catch (error) {
    return handlePrismaError(error);
  }
}