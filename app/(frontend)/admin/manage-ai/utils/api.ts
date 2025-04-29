
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
    const response = await fetch('/api/manage-ai/api-key', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_ai: providerId,
        api_key: apiKey,
      }),
    });
    const data: PatchApiKeyResponse = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message,
    };
  }
}