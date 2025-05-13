import { NextRequest, NextResponse } from 'next/server';
import providerService from '@/app/(backend)/services/providerService';
import { ErrorResponse, InternalServerErrorResponse } from '@/app/(backend)/utils/exceptions';
import { ProviderValidation } from '@/app/(backend)/dtos/provider.dto';
import { validateBody } from '@/app/(backend)/utils/validationUtils';
import { apiResponseDuration } from '@/app/(backend)/utils/metrics';

const route = '/api/ai/key';
export async function PATCH(request: NextRequest) {
  const method = 'PATCH';
  const endTimer = apiResponseDuration.startTimer({ route, method });
  try {
    const validatedData = await validateBody(ProviderValidation.UPDATE_API_KEY, request);
    
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