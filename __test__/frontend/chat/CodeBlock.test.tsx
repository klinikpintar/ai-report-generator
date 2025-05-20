import { render, screen, fireEvent, act } from "@testing-library/react";
import { CodeBlock } from "@frontend/(chat)/components/CodeBlock";
import "@testing-library/jest-dom";

// Mock the clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe("CodeBlock", () => {
  const mockProps = {
    language: "javascript",
    value: "const example = 'test code';",
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ✅ Positive test case
  it("should display the content in screen", () => {
    render(<CodeBlock {...mockProps} />);

    // Check if the value content is rendered, maybe broken up into separate components
    expect(screen.getByText(/const/)).toBeInTheDocument();
    expect(screen.getByText(/example/)).toBeInTheDocument();
    expect(screen.getByText(/'test code'/)).toBeInTheDocument();
  });

  // ✅ Positive test case
  it("should display clipboard icon first", () => {
    render(<CodeBlock {...mockProps} />);
    expect(screen.getByTestId("clipboard-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("check-icon")).not.toBeInTheDocument();
  });

  // ✅ Positive test case
  it("should copy the value to the clipboard when clipboard icon clicked", () => {
    render(<CodeBlock {...mockProps} />);

    const button = screen.getByRole("button", { name: /copy code/i });
    fireEvent.click(button);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockProps.value);
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
  });

  // ✅ Positive test case
  it("should display check icon when clipboard icon clicked", () => {
    render(<CodeBlock {...mockProps} />);

    const button = screen.getByRole("button", { name: /copy code/i });
    fireEvent.click(button);

    expect(screen.queryByTestId("clipboard-icon")).not.toBeInTheDocument();
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
  });

  // ✅ Positive test case
  it("should display the clipboard icon again after check icon", () => {
    render(<CodeBlock {...mockProps} />);

    const button = screen.getByRole("button", { name: /copy code/i });
    fireEvent.click(button);

    // Check that the check icon is displayed
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();

    // Fast-forward time to trigger the timeout
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Check that the clipboard icon is displayed again
    expect(screen.getByTestId("clipboard-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("check-icon")).not.toBeInTheDocument();
  });

  // Edge test case
  it("should handle empty code value", () => {
    render(<CodeBlock language="javascript" value="" />);

    const button = screen.getByRole("button", { name: /copy code/i });
    fireEvent.click(button);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("");
  });

  // Edge test case
  it("should handle very long code values", () => {
    const longCode = "const example = 'test code';\n".repeat(100);
    render(<CodeBlock language="javascript" value={longCode} />);

    const button = screen.getByRole("button", { name: /copy code/i });
    fireEvent.click(button);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(longCode);
  });

  // ❌ Negative test case
  it("should handle unsupported language gracefully", () => {
    render(
      <CodeBlock language="nonexistent-language" value={mockProps.value} />
    );
    expect(screen.getByText(mockProps.value)).toBeInTheDocument();
  });

  // Edge test case
  it("should handle multiple clicks correctly", () => {
    render(<CodeBlock {...mockProps} />);

    const button = screen.getByRole("button", { name: /copy code/i });

    // First click
    fireEvent.click(button);
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);

    // Second click while in "copied" state
    fireEvent.click(button);
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(2);

    // Fast-forward time to trigger the timeout
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Third click after reverting to clipboard icon
    fireEvent.click(button);
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(3);
  });

  it("Should show verified icon and label when isVerified = true", () => {
    render(<CodeBlock language="javascript" value="code" isVerified={true} />);
    expect(screen.getByTestId("verified-icon")).toBeInTheDocument();
    expect(screen.getByText(/verified/i)).toBeInTheDocument();
  });

  it("Should show not verified icon and label when isVerified = false", () => {
    render(<CodeBlock language="javascript" value="code" isVerified={false} />);
    expect(screen.getByTestId("not-verified-icon")).toBeInTheDocument();
    expect(screen.getByText(/not verified/i)).toBeInTheDocument();
  });
});
