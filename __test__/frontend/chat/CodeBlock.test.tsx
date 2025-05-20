import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { CodeBlock } from "@frontend/(chat)/components/CodeBlock";
import "@testing-library/jest-dom";
import { ToastContainer } from "react-toastify";

// Mock the clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

const MockedTooltipComponent = jest.fn(
  ({ children, content, variant, side, align, "data-testid": dataTestId }) => (
    <div
      data-testid={dataTestId}
      data-content={content}
      data-variant={variant}
      data-side={side}
      data-align={align}
    >
      {children}
    </div>
  )
);

jest.mock("@/components/ui/tooltip", () => ({
  Tooltip: (props: unknown) => MockedTooltipComponent(props),
}));

describe("CodeBlock", () => {
  const mockPropsBase = {
    language: "javascript",
    value: "const example = 'test code';",
  };

  // Props including a default valid validationStatus, matching user's original mockProps
  const mockPropsWithValidStatus = {
    ...mockPropsBase,
    validationStatus: {
      isValid: true,
      errorMessage: "",
      warningMessage: "",
    },
  };

  beforeEach(() => {
    jest.useFakeTimers();
    (navigator.clipboard.writeText as jest.Mock).mockClear();
    MockedTooltipComponent.mockClear(); // Clear the Tooltip mock before each test
  });

  afterEach(() => {
    jest.useRealTimers();
  });
    jest.useRealTimers();
  });

  // ✅ Positive test case
  it("should display the content in screen", () => {
    render(<CodeBlock {...mockPropsWithValidStatus} />);

    expect(screen.getByText(/const/)).toBeInTheDocument();
    expect(screen.getByText(/example/)).toBeInTheDocument();
    expect(screen.getByText(/'test code'/)).toBeInTheDocument();
  });

  // ✅ Positive test case
  it("should display clipboard icon first", () => {
    render(<CodeBlock {...mockPropsWithValidStatus} />);
    expect(screen.getByTestId("clipboard-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("check-icon")).not.toBeInTheDocument();
  });

  // ✅ Positive test case
  it("should copy the value to the clipboard, show toast, when clipboard icon clicked", async () => {
    render(
      <>
        <CodeBlock {...mockPropsWithValidStatus} />
        <ToastContainer />
      </>
    );

    const button = screen.getByRole("button", { name: /copy code/i });
    fireEvent.click(button);
    const button = screen.getByRole("button", { name: /copy code/i });
    fireEvent.click(button);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockPropsWithValidStatus.value);
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);

    expect(await screen.findByText("Code copied to clipboard!")).toBeInTheDocument();
  });

  // ✅ Positive test case
  it("should display check icon when clipboard icon clicked", () => {
    render(<CodeBlock {...mockPropsWithValidStatus} />);

    const button = screen.getByRole("button", { name: /copy code/i });
    fireEvent.click(button);
    const button = screen.getByRole("button", { name: /copy code/i });
    fireEvent.click(button);

    expect(screen.queryByTestId("clipboard-icon")).not.toBeInTheDocument();
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
  });
    expect(screen.queryByTestId("clipboard-icon")).not.toBeInTheDocument();
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
  });

  // ✅ Positive test case
  it("should display the clipboard icon again after check icon", () => {
    render(<CodeBlock {...mockPropsWithValidStatus} />);

    const button = screen.getByRole("button", { name: /copy code/i });
    fireEvent.click(button);
    const button = screen.getByRole("button", { name: /copy code/i });
    fireEvent.click(button);

    expect(screen.getByTestId("check-icon")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.getByTestId("clipboard-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("check-icon")).not.toBeInTheDocument();
  });

  // Edge test case
  it("should handle empty code value and show toast", async () => {
    render(
      <>
        <CodeBlock
          language="javascript"
          value=""
          validationStatus={mockPropsWithValidStatus.validationStatus}
        />
        <ToastContainer />
      </>
    );

    const button = screen.getByRole("button", { name: /copy code/i });
    fireEvent.click(button);
    const button = screen.getByRole("button", { name: /copy code/i });
    fireEvent.click(button);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("");
    await waitFor(async () => {
      const toasts = await screen.findAllByText("Code copied to clipboard!");
      expect(toasts.length).toBeGreaterThan(0);
    });
  });

  // Edge test case
  it("should handle very long code values and show toast", async () => {
    const longCode = "const example = 'test code';\n".repeat(100);
    render(
      <>
        <CodeBlock
          language="javascript"
          value={longCode}
          validationStatus={mockPropsWithValidStatus.validationStatus}
        />
        <ToastContainer />
      </>
    );

    const button = screen.getByRole("button", { name: /copy code/i });
    fireEvent.click(button);
    const button = screen.getByRole("button", { name: /copy code/i });
    fireEvent.click(button);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(longCode);
    expect(await screen.findByText("Code copied to clipboard!")).toBeInTheDocument();
  });

  // ❌ Negative test case
  it("should handle unsupported language gracefully", () => {
    render(
      <CodeBlock
        language="nonexistent-language"
        value={mockPropsWithValidStatus.value}
        validationStatus={mockPropsWithValidStatus.validationStatus}
      />
    );
    expect(screen.getByText(mockPropsWithValidStatus.value)).toBeInTheDocument();
    expect(screen.queryByText("Code copied to clipboard!")).not.toBeInTheDocument();
  });
});

describe("CodeBlock with validationStatus", () => {
  const baseProps = {
    language: "javascript",
    value: "const example = 'test code';",
  };

  it("should not render validation icon or tooltip if validationStatus is not provided", () => {
    render(<CodeBlock {...baseProps} />);
    expect(screen.queryByTestId("query-validation-tooltip")).not.toBeInTheDocument();
  });

  it("should render success icon and tooltip for valid status", () => {
    const validationStatus = { isValid: true };
    render(<CodeBlock {...baseProps} validationStatus={validationStatus} />);

    // Now this will find the div rendered by MockedTooltipComponent
    const tooltipElement = screen.getByTestId("query-validation-tooltip");
    expect(tooltipElement).toBeInTheDocument();

    // Check attributes on the mocked div
    expect(tooltipElement).toHaveAttribute("data-content", "Query is valid and ready to execute");
  });

  it("should render warning icon and tooltip for invalid status with errorMessage", () => {
    const validationStatus = { isValid: false, errorMessage: "Test Error Message" };
    render(<CodeBlock {...baseProps} validationStatus={validationStatus} />);

    const tooltipElement = screen.getByTestId("query-validation-tooltip");
    expect(tooltipElement).toBeInTheDocument();
    expect(tooltipElement).toHaveAttribute("data-content", "Test Error Message");
  });

  it("should render warning icon and tooltip for invalid status with warningMessage", () => {
    const validationStatus = { isValid: false, warningMessage: "Test Warning Message" };
    render(<CodeBlock {...baseProps} validationStatus={validationStatus} />);

    const tooltipElement = screen.getByTestId("query-validation-tooltip");
    expect(tooltipElement).toBeInTheDocument();
    expect(tooltipElement).toHaveAttribute("data-content", "Test Warning Message");
  });

  it("should render warning icon and tooltip for invalid status with no specific message", () => {
    const validationStatus = { isValid: false };
    render(<CodeBlock {...baseProps} validationStatus={validationStatus} />);

    const tooltipElement = screen.getByTestId("query-validation-tooltip");
    expect(tooltipElement).toBeInTheDocument();
    expect(tooltipElement).toHaveAttribute("data-content", "Query has validation issues");
  });
});
