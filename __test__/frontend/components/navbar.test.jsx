import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Navbar from "@frontend/components/navbar";
import FeAuthService from "@frontend/login/services/feAuthService"; 
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@frontend/login/services/feAuthService", () => ({
  logout: jest.fn(),
}));

describe("Navbar Component", () => {
  beforeEach(() => {
    useRouter.mockReturnValue({
      push: jest.fn(),
      prefetch: jest.fn(),
    });

    window.alert = jest.fn();
  });

  it("should display user email", () => {
    render(<Navbar user={{ email: "virgillia.yeala@ui.ac.id" }} />);
    
    expect(screen.getByText("virgillia.yeala@ui.ac.id")).toBeInTheDocument();
  });

  it("should have a logout button", () => {
    render(<Navbar />);
    
    const logoutButton = screen.getByRole("button", { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();
  });

  it("should remove email after logout", async () => {
    FeAuthService.logout.mockResolvedValue({ success: true });
    render(<Navbar />);

    expect(screen.getByText("virgillia.yeala@ui.ac.id")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /logout/i }));

    await waitFor(() => {
      expect(screen.queryByText("virgillia.yeala@ui.ac.id")).not.toBeInTheDocument();
    });
  });
});
