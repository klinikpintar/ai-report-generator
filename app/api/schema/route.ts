import { NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import prisma from '@/lib/prisma';
import { CreateSchemaDto } from '../dtos/schema.dtos';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

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
    const body = CreateSchemaDto.parse(await req.json());
    const { name, description, schemaText } = body;

    const newSchema = await prisma.schema.create({
      data: { name, description, schemaText },
    });

    return NextResponse.json(newSchema, { status: StatusCodes.CREATED });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: 'Schema with this name already exists' },
        { status: StatusCodes.CONFLICT }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}