import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AIBox, { AIBoxProps } from "@frontend/admin/manage-ai/components/ai-box";
import "@testing-library/jest-dom";
import { mockAiProviders } from "@/__mocks__/ai-providers-data";
import { patchSetActiveModel } from "@frontend/admin/manage-ai/utils/api/patch-set-active-model";
import { patchActivateProvider } from "@frontend/admin/manage-ai/utils/api/patch-activate-provider";
import { ToastContainer } from "react-toastify";

jest.mock("@frontend/admin/manage-ai/utils/api/patch-set-active-model", () => ({
  patchSetActiveModel: jest.fn(),
}));

jest.mock("@frontend/admin/manage-ai/utils/api/patch-activate-provider", () => ({
  patchActivateProvider: jest.fn(),
}));

// Has no active model
const deepSeekMockProps: AIBoxProps = {
  provider: mockAiProviders[0],
  refreshProviders: jest.fn(),
};

// Has active model
const geminiMockProps: AIBoxProps = {
  provider: mockAiProviders[1],
  refreshProviders: jest.fn(),
};

describe("AIBox Display", () => {
  it("should render model name and key icon", () => {
    render(<AIBox {...deepSeekMockProps} />);

    expect(screen.getByText("DeepSeek")).toBeInTheDocument();
    expect(screen.getByAltText("DeepSeek Logo")).toBeInTheDocument();
    expect(screen.getByAltText("icon-key")).toBeInTheDocument();
  });

  it("should display default button text as 'Pilih Model'", () => {
    render(<AIBox {...deepSeekMockProps} />);

    expect(screen.getByRole("button", { name: /Pilih Model/i })).toBeInTheDocument();
  });

  it("should open dropdown", async () => {
    render(<AIBox {...geminiMockProps} testOpenDropdown={true} />);

    const modelButton = await screen.findByText("gemini-2.0-flash", {
      selector: "button",
    });
    fireEvent.click(modelButton);

    expect(screen.getByRole("menuitem", { name: /gemini-2.0-flash/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /gemini-2.0-lite/i })).toBeInTheDocument();
  });

  it("should open and close edit API key modal", async () => {
    render(<AIBox {...deepSeekMockProps} />);

    const editButton = screen.getByRole("button", { name: /Edit API Key/i });
    fireEvent.click(editButton);

    expect(screen.getByText(/Edit API Key/i)).toBeInTheDocument();

    const closeButton = screen.getByText(/Batal/i);
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText(/Edit API Key/i)).not.toBeInTheDocument();
    });
  });
});

describe("AIBox Activate Provider", () => {
  it("should successfully activate provider", async () => {
    render(
      <>
        <AIBox {...geminiMockProps} />
        <ToastContainer />
      </>
    );

    // Mock the fetch function to return a successful response
    (patchActivateProvider as jest.Mock).mockResolvedValue({
      success: true,
    });

    const activateProviderButton = screen.getByTestId("GEMINI-radio-button");
    fireEvent.click(activateProviderButton);

    await waitFor(() => {
      expect(screen.getByText(/Provider Gemini diaktifkan/i)).toBeInTheDocument();
    });
  });

  it("should handle error when activating provider", async () => {
    render(
      <>
        <AIBox {...geminiMockProps} />
        <ToastContainer />
      </>
    );

    // Mock the fetch function to return an error response
    (patchActivateProvider as jest.Mock).mockResolvedValue({
      success: false,
      message: "Failed to activate provider",
    });

    const activateProviderButton = screen.getByTestId("GEMINI-radio-button");
    fireEvent.click(activateProviderButton);

    await waitFor(() => {
      expect(screen.getByText("Failed to activate provider")).toBeInTheDocument();
    });
  });
});

describe("AIBox Select Model Functionality", () => {
  it("should successfully select model", async () => {
    render(
      <>
        <AIBox {...geminiMockProps} testOpenDropdown={true} />
        <ToastContainer />
      </>
    );

    // Mock the fetch function to return a successful response
    (patchSetActiveModel as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        ...geminiMockProps.provider,
        activeModel: geminiMockProps.provider.models.find(
          (model) => model.name === "gemini-2.0-lite"
        ),
      },
    });

    const selectModelButton = screen.getByRole("menuitem", { name: /gemini-2.0-lite/i });
    fireEvent.click(selectModelButton);

    await waitFor(() => {
      const selectedModel = screen.getByText("gemini-2.0-lite", {
        selector: "button",
      });
      expect(selectedModel).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByText("Model gemini-2.0-lite untuk provider Gemini diaktifkan!")
      ).toBeInTheDocument();
    });
  });

  it("should handle error when selecting model", async () => {
    render(
      <>
        <AIBox {...geminiMockProps} testOpenDropdown={true} />
        <ToastContainer />
      </>
    );

    // Mock the fetch function to return an error response
    (patchSetActiveModel as jest.Mock).mockResolvedValue({
      success: false,
      message: "Failed to set active model",
    });

    const selectModelButton = screen.getByRole("menuitem", { name: /gemini-2.0-lite/i });
    fireEvent.click(selectModelButton);

    await waitFor(() => {
      expect(screen.getByText("Failed to set active model")).toBeInTheDocument();
    });
  });
});
