interface PatchActivateProviderPayload {
  providerId: string;
}

interface PatchActivateProviderResponse {
  success: boolean;
  message?: string;
}

export const patchActivateProvider = async ({ providerId }: PatchActivateProviderPayload) => {
  try {
    const response = await fetch(`/api/ai/activate`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ providerId }),
    });

    if (!response.ok) {
      throw new Error("Failed to activate provider");
    }

    const data = {
      success: true,
    };

    return data as PatchActivateProviderResponse;
  } catch (error) {
    console.error("Error activating provider:", error);
    return {
      success: false,
      message: (error as Error).message,
    };
  }
}