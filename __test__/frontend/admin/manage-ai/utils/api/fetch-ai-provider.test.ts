import { fetchAiProvider } from "@frontend/admin/manage-ai/utils/api/fetch-ai-provider";
import { AIProvider } from "@frontend/admin/manage-ai/types/ai-provider";
import { mockAiProviders } from "@/__mocks__/ai-providers-data";

describe("fetchAiProvider", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch AI providers (success case)", async () => {

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockAiProviders),
    });

    const result = await fetchAiProvider();

    expect(global.fetch).toHaveBeenCalledWith("/api/ai/model", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(result).toEqual({
      success: true,
      data: mockAiProviders,
    });
  });

  it("should return an error response when the API call fails (response not ok)", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: jest.fn(),
    });

    const result = await fetchAiProvider();

    expect(global.fetch).toHaveBeenCalledWith("/api/ai/model", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(result.success).toBe(false);
    expect(result).toHaveProperty("message");
    expect(result.data).toEqual([]);
  });

  it("should handle network or unexpected errors gracefully", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    const result = await fetchAiProvider();

    expect(global.fetch).toHaveBeenCalledWith("/api/ai/model", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(result).toEqual({
      success: false,
      message: expect.any(String),
      data: [],
    });
  });

  it("should handle empty provider list correctly (edge case)", async () => {
    const mockProviders: AIProvider[] = [];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockProviders),
    });

    const result = await fetchAiProvider();

    expect(global.fetch).toHaveBeenCalledWith("/api/ai/model", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(result).toEqual({
      success: true,
      data: [],
    });
  });

});
