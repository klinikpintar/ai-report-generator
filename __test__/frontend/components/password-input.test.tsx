import { render, screen, fireEvent } from "@testing-library/react";
import PasswordInput from "@frontend/components/password-input";

describe("PasswordInput", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders properly with default props", () => {
    render(
      <PasswordInput
        label="Password"
        name="password"
        value="test123"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByLabelText("Password");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "password");
  });

  it("toggles password visibility when the button is clicked", () => {
    render(
      <PasswordInput
        label="Password"
        name="password"
        value="test123"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByLabelText("Password");
    const toggleButton = screen.getByRole("button", { name: /show password/i });

    // Initially password is hidden
    expect(input).toHaveAttribute("type", "password");

    // Click to show
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute("type", "text");

    // Click to hide again
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute("type", "password");
  });

  it("displays error message when provided", () => {
    render(
      <PasswordInput
        label="Password"
        name="password"
        value="test123"
        onChange={mockOnChange}
        error="Password is required"
      />
    );

    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("uses proper aria labels for confirm password", () => {
    render(
      <PasswordInput
        label="Confirm Password"
        name="confirmPassword"
        value="test123"
        onChange={mockOnChange}
        confirmPassword={true}
      />
    );

    const toggleButton = screen.getByRole("button", { name: /show confirm password/i });
    expect(toggleButton).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.getByRole("button", { name: /hide confirm password/i })).toBeInTheDocument();
  });
});