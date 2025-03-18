import { ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { CreateSchemaDto } from '../dtos/schema.dtos';

export const validateSchemaInput = (body: unknown) => {
  return CreateSchemaDto.parse(body);
}

export const handleError = (error: any, context: string) => {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: `${context}: Invalid input`, details: error.errors },
      { status: StatusCodes.BAD_REQUEST }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const errorMessages: Record<string, string> = {
      'P2002': 'Schema with this name already exists',
      'P2025': 'Schema not found',
    };

    return NextResponse.json(
      { error: errorMessages[error.code] || 'Database error' },
      { status: error.code === 'P2002' ? StatusCodes.CONFLICT : StatusCodes.NOT_FOUND }
    );
  }

  return NextResponse.json(
    { error: `${context}: Internal Server Error` },
    { status: StatusCodes.INTERNAL_SERVER_ERROR }
  );
};
