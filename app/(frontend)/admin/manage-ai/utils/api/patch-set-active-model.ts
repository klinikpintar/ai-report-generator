import { AIProvider } from "../../types/ai-provider";

type PatchSetActiveModelParams = {
  providerId: string;
  modelId: string;
}

type PatchApiKeyResponse = {
  success: boolean;
  data?: AIProvider;
  message?: string;
}

type FailureResponse = {
  message: string;
}

export const patchSetActiveModel = async ({ providerId, modelId }: PatchSetActiveModelParams): Promise<PatchApiKeyResponse> => {
  try {
    const response = await fetch('/api/ai/model', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ providerId, modelId }),
    });

    if (!response.ok) {
      const errorMessage = (await response.json() as FailureResponse).message;
      throw new Error(errorMessage);
    }

    const data = await response.json() as AIProvider;

    return {
      success: true,
      data,
    };

  } catch (error) {
    console.error('Error updating active model:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}
