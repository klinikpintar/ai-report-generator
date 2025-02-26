import { render, screen } from "@testing-library/react";
import Sidebar from "../app/components/sidebar";

describe("Sidebar Component", () => {
  it("should render menu items", () => {
    render(<Sidebar />);
    
    expect(screen.getByText(/New Chat/i)).toBeInTheDocument();
    expect(screen.getByText(/Recent/i)).toBeInTheDocument();
  });
});
