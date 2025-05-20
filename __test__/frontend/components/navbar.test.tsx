import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Navbar from "@frontend/components/navbar";
import FeAuthService from "@frontend/login/services/feAuthService";
import { useRouter, usePathname } from "next/navigation";
import { UserProvider } from "@/app/(frontend)/login/context/userContext";
import { toast as mockedToast } from "react-toastify";
import { useUIState } from "@frontend/(chat)/context/uiStateContext";

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

jest.mock("@frontend/(chat)/context/uiStateContext", () => ({
  useUIState: jest.fn(),
}));

// Helper untuk membungkus dengan UserProvider
const renderWithUserProvider = (ui: React.ReactElement) => {
  localStorage.setItem("userEmail", "virgillia.yeala@ui.ac.id");
  return render(<UserProvider>{ui}</UserProvider>);
};

describe("Navbar Component", () => {
  const pushMock = jest.fn();
  const setIsSidebarOpenMock = jest.fn();
  const setShowProfileDropdownMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
      prefetch: jest.fn(),
    });

    (usePathname as jest.Mock).mockReturnValue("/");

    (useUIState as jest.Mock).mockReturnValue({
      isSidebarOpen: false,
      setIsSidebarOpen: setIsSidebarOpenMock,
      showProfileDropdown: false,
      setShowProfileDropdown: setShowProfileDropdownMock,
    });

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

  it("should call logout, show success toast, and redirect on success", async () => {
    (FeAuthService.logout as jest.Mock).mockResolvedValue({ success: true });

    renderWithUserProvider(<Navbar />);
    const logoutButton = await screen.findByRole("button", { name: /logout/i });
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockedToast.success).toHaveBeenCalledWith("Successfully logged out.");
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
        "Logout failed. Please try again."
      );
    });
  });

  it("should not display email and logout button on login page", async () => {
    (usePathname as jest.Mock).mockReturnValue("/login");

    renderWithUserProvider(<Navbar />);

    expect(screen.queryByText("virgillia.yeala@ui.ac.id")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /logout/i })).not.toBeInTheDocument();
  });

  it("should close sidebar and toggle profile dropdown if sidebar is open", async () => {
    // Simulasikan sidebar sedang terbuka
    (useUIState as jest.Mock).mockReturnValue({
      isSidebarOpen: true,
      setIsSidebarOpen: setIsSidebarOpenMock,
      showProfileDropdown: false,
      setShowProfileDropdown: setShowProfileDropdownMock,
    });

    renderWithUserProvider(<Navbar />);

    // Ambil tombol profil (ikon img dalam button)
    const profileBtn = screen.getAllByRole("button").find((btn) =>
      btn.querySelector("img")
    );

    expect(profileBtn).toBeInTheDocument();

    if (profileBtn) fireEvent.click(profileBtn);

    expect(setIsSidebarOpenMock).toHaveBeenCalledWith(false); // baris 41
    expect(setShowProfileDropdownMock).toHaveBeenCalledWith(true); // baris 43
  });

});