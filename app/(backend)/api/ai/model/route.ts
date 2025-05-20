import { NextRequest, NextResponse } from 'next/server';
import { ServiceFactory } from '@/app/(backend)/factories/serviceFactory';
import { ErrorResponse, InternalServerErrorResponse } from '@/app/(backend)/utils/exceptions';
import { ProviderValidation } from '@/app/(backend)/dtos/provider.dto';
import { validateQueryParams, validateBody } from '@/app/(backend)/utils/validationUtils';

export async function GET(request: NextRequest) {
  try {
    const validatedParams = validateQueryParams(ProviderValidation.GET, request);
    
    // Selalu mengambil provider dengan model-modelnya
    const options = {
      ...validatedParams,
      includeModels: true
    };
    
    // Dapatkan instance melalui factory
    const providerService = ServiceFactory.getProviderService();

    let providers = await providerService.getAllProviders(options);
    
    // Fallback: Jika tidak ada provider, buat provider default
    if (providers.length === 0) {
      const defaultProvider = await providerService.getActiveOrDefaultProvider();
      providers = [defaultProvider];
    }
    
    return NextResponse.json(providers);
  } catch (error) {
    if (error instanceof ErrorResponse) {
      return error.generate();
    }
    
    console.error('Error fetching models:', error);
    return new InternalServerErrorResponse('Failed to fetch AI models').generate();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const validatedData = await validateBody(ProviderValidation.SET_ACTIVE_MODEL, request);
    
    // Dapatkan instance melalui factory
    const providerService = ServiceFactory.getProviderService();
    
    // Update active model
    const updatedProvider = await providerService.updateActiveModel(
      validatedData.providerId,
      validatedData.modelId
    );
    
    return NextResponse.json(updatedProvider);
  } catch (error) {
    if (error instanceof ErrorResponse) {
      return error.generate();
    }
    
    console.error('Error updating active model:', error);
    return new InternalServerErrorResponse('Failed to update active model').generate();
  }
}