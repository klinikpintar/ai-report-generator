import { render, screen, fireEvent } from "@testing-library/react";
import Navbar from "../app/components/Navbar";

describe("Navbar Component", () => {
  it("should display user email", () => {
    render(<Navbar user={{ email: "virgillia.yeala@ui.ac.id" }} />);
    
    expect(screen.getByText("virgillia.yeala@ui.ac.id")).toBeInTheDocument();
  });

  it("should have a logout button", () => {
    render(<Navbar />);
    
    const logoutButton = screen.getByRole("button", { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();
  });

  it("should remove email after logout", () => {
    render(<Navbar />);

    expect(screen.getByText("virgillia.yeala@ui.ac.id")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /logout/i }));

    expect(screen.queryByText("virgillia.yeala@ui.ac.id")).not.toBeInTheDocument();
  });
});
