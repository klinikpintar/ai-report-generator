import { NextRequest, NextResponse } from 'next/server';
import providerService from '@/app/(backend)/services/providerService';
import { ErrorResponse, InternalServerErrorResponse } from '@/app/(backend)/utils/exceptions';
import { ProviderValidation } from '@/app/(backend)/dtos/provider.dto';
import { validateBody } from '@/app/(backend)/utils/validationUtils';

export async function PATCH(request: NextRequest) {
  try {
    const validatedData = await validateBody(ProviderValidation.ACTIVATE, request);
    
    // Set provider sebagai aktif
    const updatedProvider = await providerService.setActiveProvider(
      validatedData.providerId
    );
    
    return NextResponse.json(updatedProvider);
  } catch (error) {
    if (error instanceof ErrorResponse) {
      return error.generate();
    }
    
    console.error('Error activating provider:', error);
    return new InternalServerErrorResponse('Failed to activate provider').generate();
  }
}