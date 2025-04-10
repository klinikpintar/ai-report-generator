import { CreateSchemaDto } from '@backend/dtos/schema.dtos';
import { handleError } from '@backend/utils/errorUtils';
import { ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { Prisma } from '@prisma/client';
import { validateSchemaInput } from '@backend/utils/schemaUtils';

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => new MockResponse(data, options.status)),
  },
}));

class MockResponse {
  constructor(public data: Record<string, any>, public status: number) {}
}

const ERROR_CASES = [
  [
    'BAD_REQUEST for ZodError',
    new ZodError([{ message: 'Invalid data', path: ['name'], code: 'invalid_type', expected: 'string', received: 'undefined' }]),
    StatusCodes.BAD_REQUEST,
    'Test Context: Invalid input',
  ],
  [
    'CONFLICT for P2002 error',
    new Prisma.PrismaClientKnownRequestError('Unique constraint failed', { code: 'P2002', clientVersion: '4.0.0' }),
    StatusCodes.CONFLICT,
    'Instance with this name already exists',
  ],
  [
    'NOT_FOUND for P2025 error',
    new Prisma.PrismaClientKnownRequestError('Record not found', { code: 'P2025', clientVersion: '4.0.0' }),
    StatusCodes.NOT_FOUND,
    'Instance not found',
  ],
  [
    'INTERNAL_SERVER_ERROR for unknown PrismaClientKnownRequestError code',
    new Prisma.PrismaClientKnownRequestError('Some DB issue', {
      code: 'P9999',
      clientVersion: '4.0.0',
    }),
    StatusCodes.NOT_FOUND,
    'Database error',
  ],
  [
    'INTERNAL_SERVER_ERROR for generic errors',
    new Error('Unexpected error'),
    StatusCodes.INTERNAL_SERVER_ERROR,
    'Test Context: Internal Server Error',
  ],
];

describe('Schema Utils Unit Tests', () => {
  describe('validateSchemaInput', () => {
    const validData = {
      name: 'Test Schema',
      description: 'Valid description',
      schemaText: 'CREATE TABLE test (id SERIAL PRIMARY KEY, name TEXT);',
      serviceId: 'db9caeca-aa1a-46f6-84de-adfe0a414c03'
    };

    it('should validate correct input', () => {
      expect(validateSchemaInput(validData)).toEqual(validData);
    });

    it('should throw a ZodError for invalid input', () => {
      expect(() => validateSchemaInput({})).toThrow(ZodError);
    });

    it('should throw a ZodError for missing serviceId', () => {
      const invalidData = {
        name: 'Valid Name',
        description: 'Valid Description',
        schemaText: 'CREATE TABLE...',
      };
    
      expect(() => CreateSchemaDto.parse(invalidData)).toThrow(ZodError);
    });
    
    it('should throw a ZodError for invalid serviceId format', () => {
      const invalidData = {
        name: 'Valid Name',
        description: 'Valid Description',
        schemaText: 'CREATE TABLE...',
        serviceId: 'not-a-uuid',
      };
    
      expect(() => CreateSchemaDto.parse(invalidData)).toThrow(ZodError);
    });    
  });

  describe('handleError', () => {
    it.each(ERROR_CASES)('should return %s', (_, error, expectedStatus, expectedMessage) => {
      const response = handleError(error, 'Test Context');
      expect(response.status).toBe(expectedStatus);
      expect(response.data.error).toBe(expectedMessage);
    });
  });
});
