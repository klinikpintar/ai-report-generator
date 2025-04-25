import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Navbar from "@frontend/components/navbar";
import FeAuthService from "@frontend/login/services/feAuthService";
import { useRouter, usePathname } from "next/navigation";
import { UserProvider } from "@/app/(frontend)/login/context/userContext";
import { toast as mockedToast } from "react-toastify";

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  },
  ToastContainer: jest.fn().mockImplementation(() => <div data-testid="toast-container" />),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock("@frontend/login/services/feAuthService", () => ({
  logout: jest.fn(),
}));

// Helper untuk membungkus dengan UserProvider
const renderWithUserProvider = (ui: React.ReactElement) => {
  localStorage.setItem("userEmail", "virgillia.yeala@ui.ac.id"); // Simulasikan user yang login
  return render(<UserProvider>{ui}</UserProvider>);
};

describe("Navbar Component", () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
      prefetch: jest.fn(),
    });

    (usePathname as jest.Mock).mockReturnValue("/"); // Default return / (bukan halaman login)

    jest.clearAllMocks();
    localStorage.clear();
  });

  it("should display user email from context", async () => {
    renderWithUserProvider(<Navbar />);
    expect(await screen.findByText("virgillia.yeala@ui.ac.id")).toBeInTheDocument();
  });

  it("should have a logout button", async () => {
    renderWithUserProvider(<Navbar />);
    const logoutButton = await screen.findByRole("button", { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();
  });

  it("should call logout and redirect on success", async () => {
    (FeAuthService.logout as jest.Mock).mockResolvedValue({ success: true });

    renderWithUserProvider(<Navbar />);
    const logoutButton = await screen.findByRole("button", { name: /logout/i });
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/login");
    });
  });

  it("should show toast if logout fails", async () => {
    (FeAuthService.logout as jest.Mock).mockResolvedValue({ success: false });
  
    renderWithUserProvider(<Navbar />);
    const logoutButton = await screen.findByRole("button", { name: /logout/i });
    fireEvent.click(logoutButton);
  
    await waitFor(() => {
      expect(mockedToast.error).toHaveBeenCalledWith(
        "Logout failed. Please try again.",
        expect.any(Object)
      );
    });
  }); 

  it("should not display email and logout button on login page", async () => {
    (usePathname as jest.Mock).mockReturnValue("/login");

    renderWithUserProvider(<Navbar />);

    expect(screen.queryByText("virgillia.yeala@ui.ac.id")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /logout/i })).not.toBeInTheDocument();
  });
});