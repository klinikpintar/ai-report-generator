
type PatchApiKeyParams = {
  providerId: string;
  apiKey: string;
}

type PatchApiKeyResponse = {
  success: boolean;
  message: string;
}

export const patchApiKey = async ({ providerId, apiKey }: PatchApiKeyParams) => {
  try {
    const response = await fetch('/api/ai/key', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        providerId,
        apiKey,
      }),
    });
    const data: PatchApiKeyResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    return {
      success: true,
      message: 'API key updated successfully',
    } as PatchApiKeyResponse;
    
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message,
    };
  }
}