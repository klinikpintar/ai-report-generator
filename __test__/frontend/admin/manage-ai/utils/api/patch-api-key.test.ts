import { patchApiKey } from "@frontend/admin/manage-ai/utils/api/patch-api-key";

describe("patchApiKey", () => {
  const mockParams = {
    providerId: "123",
    apiKey: "test-api-key",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should send a PATCH request with correct payload and return success response", async () => {
    const mockResponse = {
      success: true,
      message: "API key updated successfully",
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    const result = await patchApiKey(mockParams);

    expect(global.fetch).toHaveBeenCalledWith("/api/ai/key", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        providerId: mockParams.providerId,
        apiKey: mockParams.apiKey,
      }),
    });

    expect(result).toEqual(mockResponse);
  });

  it("should return error response when the API call fails", async () => {
    const mockErrorResponse = {
      success: false,
      message: "Failed to update API key",
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue(mockErrorResponse),
    });

    const result = await patchApiKey(mockParams);

    expect(global.fetch).toHaveBeenCalledWith("/api/ai/key", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        providerId: mockParams.providerId,
        apiKey: mockParams.apiKey,
      }),
    });

    expect(result).toEqual(mockErrorResponse);
  });

  it("should handle network or unexpected errors gracefully", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    const result = await patchApiKey(mockParams);

    expect(global.fetch).toHaveBeenCalledWith("/api/ai/key", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        providerId: mockParams.providerId,
        apiKey: mockParams.apiKey,
      }),
    });

    expect(result).toEqual({
      success: false,
      message: "Network error",
    });
  });
});