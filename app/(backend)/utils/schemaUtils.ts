import { ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';
import { CreateSchemaDto } from '../dtos/schema.dtos';
import { Prisma } from '@prisma/client';

export const validateSchemaInput = (body: unknown) => {
  return CreateSchemaDto.parse(body);
}

export const handlePrismaError = (error: unknown) => {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Invalid input', details: error.errors },
      { status: StatusCodes.BAD_REQUEST }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Schema with this name already exists' },
        { status: StatusCodes.CONFLICT }
      );
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Schema not found' },
        { status: StatusCodes.NOT_FOUND }
      );
    }
  }

  return NextResponse.json(
    { error: 'Internal Server Error' },
    { status: StatusCodes.INTERNAL_SERVER_ERROR }
  );
}

export const handleInternalServerError = () => {
  return NextResponse.json(
    { error: 'Failed to fetch schemas' }, 
    { status: StatusCodes.INTERNAL_SERVER_ERROR }
  );
}