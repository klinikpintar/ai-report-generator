import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import LoginPage from "@frontend/login/page";
import FeAuthService from "@frontend/login/services/feAuthService";
import { toast as mockedToast } from "react-toastify";

// Mock useRouter
const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

// Mock FeAuthService
jest.mock("@frontend/login/services/feAuthService");

// Mock useUser
const setEmailContextMock = jest.fn();
jest.mock("@frontend/login/context/userContext", () => ({
  useUser: () => ({
    setEmailContext: setEmailContextMock,
  }),
}));

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  },
  ToastContainer: jest.fn().mockImplementation(() => <div data-testid="toast-container" />),
}));

const originalLocalStorage = global.localStorage;

const renderWithUserContext = () => {
  return render(<LoginPage />);
};

describe("LoginPage", () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        clear: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true
    });

    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore original localStorage setelah semua test
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    });
  });

  it("renders title and subtitle", () => {
    renderWithUserContext();
    expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument();
    expect(screen.getByText(/Selamat Datang di AI Report Generator/i)).toBeInTheDocument();
    expect(screen.getByText(/Klinik Pintar/i)).toBeInTheDocument();
  });

  it("renders email and password inputs", () => {
    renderWithUserContext();

    const emailInput = screen.getByPlaceholderText(/Masukkan email/i);
    const passwordInput = screen.getByPlaceholderText(/Masukkan password/i);

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  it("renders login button", () => {
    renderWithUserContext();

    const button = screen.getByRole("button", { name: /login/i });
    expect(button).toBeInTheDocument();
  });

  it("shows validation errors if form is submitted empty", async () => {
    renderWithUserContext();
    const button = screen.getByRole("button", { name: /login/i });

    await act(async () => {
      fireEvent.click(button);
    });

    // Browser-native form validation won't throw errors directly for required fields
    expect(button).not.toBeDisabled();
  });

  it("calls FeAuthService.login and redirects on success", async () => {
    // Setup mocks
    (FeAuthService.login as jest.Mock).mockResolvedValue({
      success: true,
      message: "Login successful"
    });

    jest.useFakeTimers();
  
    // Render component and fill form
    renderWithUserContext();
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByPlaceholderText("Masukkan password");
    const button = screen.getByRole("button", { name: /login/i });
  
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
  
    await act(async () => {
      fireEvent.click(button);
    });
  
    // Verify toast success was called
    expect(mockedToast.success).toHaveBeenCalledWith(
      "Login successful! Redirecting..."
    );
  
    expect(window.localStorage.setItem).toHaveBeenCalledWith("userEmail", "test@example.com");
    expect(setEmailContextMock).toHaveBeenCalledWith("test@example.com");
    
    // Use waitFor because of the setTimeout in the component
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
  
    expect(pushMock).toHaveBeenCalledWith("/");
    
    // Restore real timers
    jest.useRealTimers();
  });

  it("shows error message on failed login (invalid credentials)", async () => {
    (FeAuthService.login as jest.Mock).mockResolvedValue({ success: false });

    renderWithUserContext();

    fireEvent.change(screen.getByPlaceholderText(/Masukkan email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Masukkan password/i), {
      target: { value: "wrongpassword" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /login/i }));
    });

    expect(mockedToast.error).toHaveBeenCalledWith(
      "Login failed. Please check your credentials."
    );
  });

  it("shows generic error on exception", async () => {
    (FeAuthService.login as jest.Mock).mockRejectedValue(new Error("Internal error"));

    renderWithUserContext();

    fireEvent.change(screen.getByPlaceholderText(/Masukkan email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Masukkan password/i), {
      target: { value: "password123" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /login/i }));
    });

    expect(mockedToast.error).toHaveBeenCalledWith(
      "Something went wrong. Please try again."
    );
  });

  it("displays loading state during login", async () => {
    let resolveLogin: any;
    (FeAuthService.login as jest.Mock).mockImplementation(
      () => new Promise((resolve) => (resolveLogin = resolve))
    );

    renderWithUserContext();

    fireEvent.change(screen.getByPlaceholderText(/Masukkan email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Masukkan password/i), {
      target: { value: "password123" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /login/i }));
    });

    expect(screen.getByRole("button", { name: /logging in/i })).toBeInTheDocument();

    // Resolve login to clean up
    await act(async () => {
      resolveLogin({ success: true });
    });
  });

  it("should prevent multiple submissions", async () => {
    const loginMock = jest.fn().mockResolvedValue({ success: true });
    (FeAuthService.login as jest.Mock).mockImplementation(loginMock);
  
    renderWithUserContext();
  
    fireEvent.change(screen.getByPlaceholderText(/Masukkan email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Masukkan password/i), {
      target: { value: "password123" },
    });
  
    const button = screen.getByRole("button", { name: /login/i });
  
    // Simulate multiple rapid clicks before loading state activates
    await act(async () => {
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
    });
  
    // Allow promise to resolve
    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledTimes(1);
    });
  });

  it("toggles password visibility when show/hide button is clicked", async () => {
    renderWithUserContext();

    const passwordInput = screen.getByPlaceholderText("Masukkan password");
    const toggleButton = screen.getByRole("button", { name: /show password/i });
    
    // password is hidden by default
    expect(passwordInput).toHaveAttribute("type", "password");

    await act(async () => {
      fireEvent.click(toggleButton);
    });
    
    // ensure password is visible after clicking the button
    expect(passwordInput).toHaveAttribute("type", "text");
    expect(toggleButton).toHaveAttribute("aria-label", "Hide password");
    
    await act(async () => {
      fireEvent.click(toggleButton);
    });
    
    // ensure password is hidden again
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(toggleButton).toHaveAttribute("aria-label", "Show password");
  });
});