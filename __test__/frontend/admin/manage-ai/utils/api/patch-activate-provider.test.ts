import { patchActivateProvider } from "@frontend/admin/manage-ai/utils//api/patch-activate-provider";

describe("patchActivateProvider", () => {
  const mockPayload = {
    providerId: "provider-123",
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully activate a provider when API call succeeds", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn(), // Not really used here since the function hardcodes success
    });

    const result = await patchActivateProvider(mockPayload);

    expect(global.fetch).toHaveBeenCalledWith("/api/ai/activate", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ providerId: mockPayload.providerId }),
    });

    expect(result).toEqual({
      success: true,
    });
  });

  it("should return error response when the API call fails (response not ok)", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: jest.fn(), // Could simulate server returning JSON error if needed
    });

    const result = await patchActivateProvider(mockPayload);

    expect(global.fetch).toHaveBeenCalledWith("/api/ai/activate", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ providerId: mockPayload.providerId }),
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Failed to activate provider");
  });

  it("should handle network or unexpected errors gracefully", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    const result = await patchActivateProvider(mockPayload);

    expect(global.fetch).toHaveBeenCalledWith("/api/ai/activate", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ providerId: mockPayload.providerId }),
    });

    expect(result).toEqual({
      success: false,
      message: expect.any(String), 
    });
  });

  it('should handle status code other than 200', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: jest.fn().mockResolvedValue({ message: 'Internal Server Error' }),
    });

    const result = await patchActivateProvider(mockPayload);

    expect(global.fetch).toHaveBeenCalledWith("/api/ai/activate", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ providerId: mockPayload.providerId }),
    });

    expect(result).toEqual({
      success: false,
      message: expect.any(String), 
    });
  });
});
