import { render, screen, waitFor } from "@testing-library/react";
import AISelectionSection from "@frontend/admin/manage-ai/sections/ai-selection-section";
import "@testing-library/jest-dom";
import type { AIProvider } from "@frontend/admin/manage-ai/types/ai-provider";
import { fetchAiProvider } from "@frontend/admin/manage-ai/utils/api/fetch-ai-provider";

// Mock AIBox component
jest.mock("@frontend/admin/manage-ai/components/ai-box", () => ({
  __esModule: true,
  default: ({ provider }: { provider: AIProvider }) => (
    <div data-testid="ai-box">{`Mocked AIBox: ${provider.name}`}</div>
  ),
}));

// Mock AIBoxSkeleton component
jest.mock("@frontend/admin/manage-ai/components/ai-box-skeleton", () => ({
  __esModule: true,
  default: () => <div data-testid="ai-box-skeleton">Mocked AIBox Skeleton</div>,
}));

// Mock fetchAiProvider with delay to test loading state
jest.mock("@frontend/admin/manage-ai/utils/api/fetch-ai-provider", () => ({
  fetchAiProvider: jest.fn().mockImplementation(() => {
    return new Promise((resolve) => {
      // Add a small delay to simulate network request
      setTimeout(() => {
        resolve({
          success: true,
          data: [
            { id: "1", name: "GEMINI" },
            { id: "2", name: "DEEPSEEK" },
          ],
        });
      }, 100);
    });
  }),
}));

describe("AISelectionSection", () => {
  it("should display skeleton loaders while fetching data", async () => {
    render(<AISelectionSection />);

    // Check that skeletons are displayed during loading
    expect(screen.getAllByTestId("ai-box-skeleton")).toHaveLength(2);

    // Wait for the loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId("ai-box-skeleton")).not.toBeInTheDocument();
    });

    // Verify AIBoxes are rendered after loading
    expect(screen.getAllByTestId("ai-box")).toHaveLength(2);
  });

  it("should render AIBox components based on fetched providers", async () => {
    render(<AISelectionSection />);

    // Wait for AIBoxes to appear because fetchAiProvider is async
    await waitFor(() => {
      expect(screen.getByText("Mocked AIBox: GEMINI")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("Mocked AIBox: DEEPSEEK")).toBeInTheDocument();
    });

    const aiBoxes = screen.getAllByText(/Mocked AIBox:/);
    expect(aiBoxes.length).toBe(2);
  });

  it("should display no AIBox components if no providers are fetched", async () => {
    // Mock fetchAiProvider to return an empty list
    (fetchAiProvider as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: [],
    });

    render(<AISelectionSection />);

    // Initially should show skeletons
    expect(screen.getAllByTestId("ai-box-skeleton")).toHaveLength(2);

    // Wait to ensure no AIBoxes are rendered after loading
    await waitFor(() => {
      expect(screen.queryByTestId("ai-box-skeleton")).not.toBeInTheDocument();
    });

    // Ensure no AIBoxes are rendered after loading
    await waitFor(() => {
      expect(screen.queryByText(/Mocked AIBox:/)).not.toBeInTheDocument();
    });
  });

  it("should handle error cases gracefully", async () => {
    // Mock fetchAiProvider to return an error
    (fetchAiProvider as jest.Mock).mockResolvedValueOnce({
      success: false,
      message: "Failed to fetch providers",
    });

    // Spy on console.error
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    render(<AISelectionSection />);

    // Initially should show skeletons
    expect(screen.getAllByTestId("ai-box-skeleton")).toHaveLength(2);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId("ai-box-skeleton")).not.toBeInTheDocument();
    });

    // Should log the error
    expect(consoleSpy).toHaveBeenCalledWith("Failed to fetch providers");

    // No AIBoxes should be rendered
    expect(screen.queryByTestId("ai-box")).not.toBeInTheDocument();

    // Clean up
    consoleSpy.mockRestore();
  });
});
