
type PatchApiKeyParams = {
  providerId: string;
  apiKey: string;
}

type PatchApiKeyResponse = {
  success: boolean;
  message: string;
}

export const patchApiKey = async ({ providerId, apiKey }: PatchApiKeyParams) => {
  
}