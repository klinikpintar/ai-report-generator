import { NextRequest, NextResponse } from 'next/server';
import providerService from '@/app/(backend)/services/providerService';
import { ErrorResponse, InternalServerErrorResponse } from '@/app/(backend)/utils/exceptions';
import { ProviderValidation } from '@/app/(backend)/dtos/provider.dto';
import { validateBody } from '@/app/(backend)/utils/validationUtils';
import { apiResponseDuration } from '@/app/(backend)/utils/metrics';

const route = '/api/ai/activate';
export async function PATCH(request: NextRequest) {
  const method = 'PATCH';
  const endTimer = apiResponseDuration.startTimer({ route, method });
  try {
    const validatedData = await validateBody(ProviderValidation.ACTIVATE, request);
    
    // Set provider sebagai aktif
    const updatedProvider = await providerService.setActiveProvider(
      validatedData.providerId
    );
    
    endTimer({ route, method });
    return NextResponse.json(updatedProvider);
  } catch (error) {
    if (error instanceof ErrorResponse) {
      return error.generate();
    }
    
    console.error('Error activating provider:', error);
    endTimer({ route, method });
    return new InternalServerErrorResponse('Failed to activate provider').generate();
  }
}