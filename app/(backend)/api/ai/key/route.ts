import { NextRequest, NextResponse } from 'next/server';
import { ServiceFactory } from '@/app/(backend)/factories/serviceFactory';
import { ErrorResponse, InternalServerErrorResponse } from '@/app/(backend)/utils/exceptions';
import { ProviderValidation } from '@/app/(backend)/dtos/provider.dto';
import { validateBody } from '@/app/(backend)/utils/validationUtils';
import { apiResponseDuration, apiMetrics } from '@/app/(backend)/utils/metrics';

const route = '/api/ai/key';
export async function PATCH(request: NextRequest) {
  const method = 'PATCH';
  const endTimer = apiResponseDuration.startTimer({ route, method });
  apiMetrics(method, route);
  try {
    const validatedData = await validateBody(ProviderValidation.UPDATE_API_KEY, request);
    
    // Dapatkan instance melalui factory
    const providerService = ServiceFactory.getProviderService();
    
    // Update API key
    const updatedProvider = await providerService.updateApiKey(
      validatedData.providerId,
      validatedData.apiKey
    );
    endTimer({ route, method });
    return NextResponse.json(updatedProvider);
  } catch (error) {
    if (error instanceof ErrorResponse) {
      return error.generate();
    }
    
    console.error('Error updating API key:', error);
    endTimer({ route, method });
    return new InternalServerErrorResponse('Failed to update API key').generate();
  }
}