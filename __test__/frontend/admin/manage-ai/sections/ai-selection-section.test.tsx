import { render, screen, waitFor } from "@testing-library/react";
import AISelectionSection from "@frontend/admin/manage-ai/sections/ai-selection-section";
import "@testing-library/jest-dom";
import { AIProvider } from "@frontend/admin/manage-ai/types/ai-provider";
import { fetchAiProvider } from "@frontend/admin/manage-ai/utils/api/fetch-ai-provider";

// Mock AIBox component
jest.mock("@frontend/admin/manage-ai/components/ai-box", () => ({
  __esModule: true,
  default: ({ provider }: { provider: AIProvider }) => (
    <div>{`Mocked AIBox: ${provider.name}`}</div>
  ),
}));

// Mock fetchAiProvider
jest.mock("@frontend/admin/manage-ai/utils/api/fetch-ai-provider", () => ({
  fetchAiProvider: jest.fn().mockResolvedValue({
    success: true,
    data: [
      { id: "1", name: "GEMINI" },
      { id: "2", name: "DEEPSEEK" },
    ],
  }),
}));

describe("AISelectionSection", () => {
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
    jest.mocked(fetchAiProvider).mockResolvedValueOnce({
      success: true,
      data: [],
    });

    render(<AISelectionSection />);

    // Wait to ensure no AIBoxes are rendered
    await waitFor(() => {
      expect(screen.queryByText(/Mocked AIBox:/)).not.toBeInTheDocument();
    });
  });

});

describe("AISelectionSection", () => {
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
});
