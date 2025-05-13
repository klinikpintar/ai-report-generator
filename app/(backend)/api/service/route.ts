import { NextRequest, NextResponse } from 'next/server';
import { StatusCodes } from 'http-status-codes';
import serviceService from '@/app/(backend)/services/serviceService';
import { validateServiceInput } from '@/app/(backend)/utils/serviceUtils';
import { handleError } from '@backend/utils/errorUtils';
import { apiResponseDuration } from '@backend/utils/metrics';

const route = '/api/service';
export async function GET() {
  const method = 'GET';
  const endTimer = apiResponseDuration.startTimer({ route, method });
  try {
    const services = await serviceService.findAllServices();
    endTimer({ route, method });
    return NextResponse.json(services, { status: StatusCodes.OK });
  } catch (error) {
    endTimer({ route, method });
    return handleError(error, 'GET Services');
  }
}

export async function POST(req: NextRequest) {
  const method = 'POST';
  const endTimer = apiResponseDuration.startTimer({ route, method });
  try {
    const body = await req.json();
    const validated = validateServiceInput(body);
    const result = await serviceService.createService(validated);
    endTimer({ route, method });
    return NextResponse.json(result, { status: StatusCodes.CREATED });
  } catch (error) {
    endTimer({ route, method });
    return handleError(error, 'POST Service');
  }
}

export async function DELETE(req: NextRequest) {
  const method = 'DELETE';
  const endTimer = apiResponseDuration.startTimer({ route, method });
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: StatusCodes.BAD_REQUEST });
    }
    await serviceService.deleteService(body.id);
    endTimer({ route, method });
    return NextResponse.json({ message: 'Service deleted successfully' }, { status: StatusCodes.OK });
  } catch (error) {
    endTimer({ route, method });
    return handleError(error, 'DELETE Service');
  }
}
