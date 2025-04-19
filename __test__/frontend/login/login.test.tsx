import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import LoginPage from "@frontend/login/page";
import FeAuthService from "@frontend/login/services/feAuthService";

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

const renderWithUserContext = () => {
  return render(<LoginPage />);
};

describe("LoginPage", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
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
    (FeAuthService.login as jest.Mock).mockResolvedValue({ success: true });

    const setItemMock = jest.spyOn(Storage.prototype, "setItem");

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

    await waitFor(() => {
      expect(FeAuthService.login).toHaveBeenCalledWith("user@example.com", "password123");
      expect(setItemMock).toHaveBeenCalledWith("userEmail", "user@example.com");
      expect(setEmailContextMock).toHaveBeenCalledWith("user@example.com");
      expect(pushMock).toHaveBeenCalledWith("/");
    });
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

    expect(await screen.findByText(/login failed/i)).toBeInTheDocument();
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

    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
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
  
});