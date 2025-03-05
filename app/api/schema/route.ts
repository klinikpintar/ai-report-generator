import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import schemaService from '../../services/schemaService';
import { validateSchemaInput, handlePrismaError } from '../../utils/schemaUtils';

export async function GET(req: NextRequest) {
  try {
    const schemas = await schemaService.findAllSchemas();
    return NextResponse.json(schemas, { status: StatusCodes.OK });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch schemas' }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = validateSchemaInput(body);

    const newSchema = await schemaService.createSchema(validatedData);
    
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

    const updatedSchema = await schemaService.updateSchema(body);

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

    await schemaService.deleteSchema(body.id);

    return NextResponse.json({ message: 'Schema deleted successfully' }, { status: StatusCodes.OK });
  } catch (error) {
    return handlePrismaError(error);
  }
}
