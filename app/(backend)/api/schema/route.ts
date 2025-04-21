import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import schemaService from '../../services/schemaService';
import { validateSchemaInput } from '../../utils/schemaUtils';
import { handleError } from '@backend/utils/errorUtils';
import { GetSchemaDto } from '@backend/interfaces/ISchemaService';


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const params: GetSchemaDto = Object.fromEntries(searchParams.entries())
    if (params.serviceIds) {
      params.serviceIds = searchParams.getAll('serviceIds');
    }
    if (params.platformCodes) {
      params.platformCodes = searchParams.getAll('platformCodes');
    }
    
    const {data, pagination} = await schemaService.findAllSchemas(params);
    const response = {
      data,
      pagination: {
        current_page: pagination.currentPage,
        total_pages: pagination.totalPages,
        total_items: pagination.totalItems,
      },
    };
    return NextResponse.json(response, { status: StatusCodes.OK });
  } catch (error) {
    return handleError(error, "GET Schemas");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = validateSchemaInput(body);

    const newSchema = await schemaService.createSchema(validatedData);

    return NextResponse.json(newSchema, { status: StatusCodes.CREATED });
  } catch (error) {
    return handleError(error, "POST Schemas");
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
    return handleError(error, "PATCH Schemas");
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
    return handleError(error, "DELETE Schemas");
  }
}
