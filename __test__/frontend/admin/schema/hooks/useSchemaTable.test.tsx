import { renderHook, waitFor } from "@testing-library/react";
import { SchemaProvider } from "@frontend/admin/schema/context/SchemaContext";
import { useSchemaTable } from "@frontend/admin/schema/hooks";
import { fetchSchemas } from "@frontend/admin/schema/utils/api";
import type { ReactNode } from "react";
import { mockSchemas } from "@/__mocks__/schema-data";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn((key) => (key === "page" ? "1" : null)),
  })),
}));

jest.mock("@frontend/admin/schema/utils/api", () => ({
  fetchSchemas: jest.fn(),
  fetchPlatforms: jest.fn(),
  fetchServices: jest.fn(),
}));

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));


const TestWrapper = ({ children }: { children: ReactNode }) => {
  return <SchemaProvider>{children}</SchemaProvider>;
};

describe("useSchemaTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("basic functionality", () => {
    it("should provide schema data and loading state", async () => {
      (fetchSchemas as jest.Mock).mockResolvedValue(mockSchemas);

      const { result } = renderHook(() => useSchemaTable(), {
        wrapper: TestWrapper,
      });

      expect(result.current.schemas).toEqual([]);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();

      await result.current.refreshSchemas();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.schemas).toEqual(mockSchemas);
      expect(result.current.error).toBeNull();
    });

    it("should handle errors during schema fetch", async () => {
      (fetchSchemas as jest.Mock).mockRejectedValue(new Error("API error"));

      const { result } = renderHook(() => useSchemaTable(), {
        wrapper: TestWrapper,
      });

      await result.current.refreshSchemas().catch(() => {});

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe("Failed to fetch schemas");
    });
  });

  describe("pagination", () => {
    it("should handle page changes", async () => {
      (fetchSchemas as jest.Mock).mockResolvedValue(mockSchemas);

      const { result } = renderHook(() => useSchemaTable(), {
        wrapper: TestWrapper,
      });

      expect(result.current.currentPage).toBe(1);

      result.current.handlePageChange(2);

      await waitFor(() => {
        expect(result.current.currentPage).toBe(2);
      });
    });
  });
});
