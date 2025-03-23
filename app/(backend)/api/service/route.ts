import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import serviceService from '@/app/(backend)/services/serviceService';
import { validateServiceInput, handleError } from '@/app/(backend)/utils/serviceUtils';

export async function GET() {
  try {
    const services = await serviceService.findAllServices();
    return NextResponse.json(services, { status: StatusCodes.OK });
  } catch (error) {
    return handleError(error, 'GET Services');
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = validateServiceInput(body);
    const result = await serviceService.createService(validated);
    return NextResponse.json(result, { status: StatusCodes.CREATED });
  } catch (error) {
    return handleError(error, 'POST Service');
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: StatusCodes.BAD_REQUEST });
    }
    await serviceService.deleteService(body.id);
    return NextResponse.json({ message: 'Service deleted successfully' }, { status: StatusCodes.OK });
  } catch (error) {
    return handleError(error, 'DELETE Service');
  }
}
