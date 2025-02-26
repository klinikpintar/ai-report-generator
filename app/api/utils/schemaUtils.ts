import { ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';
import { CreateSchemaDto } from '../dtos/schema.dtos';
import { Prisma } from '@prisma/client';

export const validateSchemaInput = (body: any) => {
  return CreateSchemaDto.parse(body);
}

export const handlePrismaError = (error: any) => {
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