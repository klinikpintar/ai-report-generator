import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { CreateServiceValidator } from '../dtos/service.dtos';

export function validateServiceInput(data: unknown) {
  return CreateServiceValidator.parse(data);
}

export function handleError(error: unknown, context: string) {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: `${context}: Invalid input` }, { status: StatusCodes.BAD_REQUEST });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Service already exists' }, { status: StatusCodes.CONFLICT });
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Service not found' }, { status: StatusCodes.NOT_FOUND });
    }
  }

  return NextResponse.json({ error: `${context}: Internal Server Error` }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
}
