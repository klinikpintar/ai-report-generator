import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import prisma from '@/lib/prisma';
import { CreateSchemaDto } from '../dtos/schema.dtos';
import { validateSchemaInput, handlePrismaError } from '../../utils/schemaUtils';

export async function GET() {
  try {
    const schemas = await prisma.schema.findMany();
    return NextResponse.json(schemas, { status: StatusCodes.OK });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch schemas' }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
  }
}

export async function POST(req: NextRequest) {
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

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: 'Schema ID is required' }, { status: StatusCodes.BAD_REQUEST });
    }

    const existingSchema = await prisma.schema.findUnique({ where: { id: body.id } });
    if (!existingSchema) {
      return NextResponse.json({ error: 'Schema not found' }, { status: StatusCodes.NOT_FOUND });
    }

    const updatedSchema = await prisma.schema.update({
      where: { id: body.id },
      data: body,
    });

    return NextResponse.json(updatedSchema, { status: StatusCodes.OK });
  } catch (error) {
    return handlePrismaError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: 'Schema ID is required' }, { status: StatusCodes.BAD_REQUEST });
    }

    const existingSchema = await prisma.schema.findUnique({ where: { id: body.id } });
    if (!existingSchema) {
      return NextResponse.json({ error: 'Schema not found' }, { status: StatusCodes.NOT_FOUND });
    }

    await prisma.schema.delete({ where: { id: body.id } });

    return NextResponse.json({ message: 'Schema deleted successfully' }, { status: StatusCodes.OK });
  } catch (error) {
    return handlePrismaError(error);
  }
}
