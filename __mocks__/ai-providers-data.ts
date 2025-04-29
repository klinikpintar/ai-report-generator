import { AIProvider } from "@frontend/admin/manage-ai/types/ai-provider";

export const mockAiProviders: AIProvider[] = [
  {
    "id": "9f7e3280-9780-40a7-baee-b05614b72eff",
    "name": "DEEPSEEK",
    "displayName": "DeepSeek",
    "apiKey": "********",
    "isActive": true,
    "isDefault": false,
    "activeModelId": null,
    "logoUrl": "/logo-deepseek.svg",
    "models": [
      {
        "id": "57040f35-0827-484a-bf0f-8865f9f5c2da",
        "name": "deepseek-coder",
        "modelIdentifier": "deepseek-coder",
        "isDefault": true,
        "isAvailable": true
      }
    ],
    "activeModel": null
  },
  {
    "id": "b059da6d-ce56-4b58-83db-a1b17adb1f50",
    "name": "GEMINI",
    "displayName": "Gemini",
    "apiKey": "********",
    "isActive": false,
    "isDefault": true,
    "activeModelId": "57040f35-0827-484a-bf0f-8865f9f5c2df",
    "logoUrl": "/logo-gemini.svg",
    "models": [
      {
        "id": "57040f35-0827-484a-bf0f-8865f9f5c2df",
        "name": "gemini-2.0-flash",
        "modelIdentifier": "gemini-2.0-flash",
        "isDefault": true,
        "isAvailable": true
      }
    ],
    "activeModel": {
      "id": "57040f35-0827-484a-bf0f-8865f9f5c2df",
      "name": "gemini-2.0-flash",
      "modelIdentifier": "gemini-2.0-flash",
      "isDefault": true,
      "isAvailable": true
    }
  }
]