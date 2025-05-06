import { mockAiProviders } from "@/__mocks__/ai-providers-data";
import { patchSetActiveModel } from "@frontend/admin/manage-ai/utils/api/patch-set-active-model";

const mockAiProvider = mockAiProviders[1]

describe("patchSetActiveModel", () => {
  it('should send a PATCH request with the correct payload and return success response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockAiProvider),
    });

    const result = await patchSetActiveModel({
      providerId: mockAiProvider.id,
      modelId: mockAiProvider.models[0].id,
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/ai/model', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        providerId: mockAiProvider.id,
        modelId: mockAiProvider.models[0].id,
      }),
    });

    expect(result).toEqual({
      success: true,
      data: mockAiProvider,
    });
  })

  it('should handle API errors gracefully', async () => {
    const mockErrorResponse = {
      message: "Provider with ID b059da6d-ce56-4b58-83db-a1b17adb1f10 not found"
    }

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: jest.fn().mockResolvedValue(mockErrorResponse),
    });

    const result = await patchSetActiveModel({
      providerId: mockAiProvider.id,
      modelId: mockAiProvider.models[0].id,
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/ai/model', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        providerId: mockAiProvider.id,
        modelId: mockAiProvider.models[0].id,
      }),
    });

    expect(result).toEqual({
      success: false,
      message: mockErrorResponse.message,
    });
  })

  it('should handle network errors gracefully', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    const result = await patchSetActiveModel({
      providerId: mockAiProvider.id,
      modelId: mockAiProvider.models[0].id,
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/ai/model', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        providerId: mockAiProvider.id,
        modelId: mockAiProvider.models[0].id,
      }),
    });

    expect(result).toEqual(expect.objectContaining({
      success: false,
    }));
  })
});