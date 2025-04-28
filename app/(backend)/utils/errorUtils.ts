import { ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ErrorResponse } from './exceptions';

type AppError = ZodError | Prisma.PrismaClientKnownRequestError | Error | unknown;

export const handleError = (error: AppError, context: string) => {
  if (error instanceof ErrorResponse) {
    return error.generate();
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: `${context}: Invalid input`, details: error.errors },
      { status: StatusCodes.BAD_REQUEST }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const errorMessages: Record<string, string> = {
      'P2002': 'Instance with this name already exists',
      'P2025': 'Instance not found',
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
