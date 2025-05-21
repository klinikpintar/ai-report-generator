import { AIProvider } from "../../types/ai-provider";

export interface FetchAIProviderResponse {
  success: boolean;
  message?: string;
  data: AIProvider[];
}

const setLogoUrl = (model: AIProvider): AIProvider => {
  let logoUrl;
  switch (model.name) {
    case "GEMINI":
      logoUrl = "/logo-gemini.svg";
      break;
    case "DEEPSEEK":
      logoUrl = "/logo-deepseek.svg";
      break;
    default:
      logoUrl = "/default-logo.png"; // Fallback logo
  }

  return {
    ...model,
    logoUrl,
  };
}

export const fetchAiProvider = async (): Promise<FetchAIProviderResponse> => {
  try {
    const response = await fetch("/api/ai/model", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Response error: ${response.status} ${response.statusText}`);
    }

    const data: AIProvider[] = await response.json();
    
    return {
      success: true,
      data: data.map((provider) => setLogoUrl(provider)),
    }
  } catch (error) {
    console.error("Error fetching AI providers | ", error);
    return {
      success: false,
      message: "Failed to fetch AI providers",
      data: [],
    }
  }
}
