import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import AdminDashboardPage from "@/app/admin/page";

describe("Admin View Schema", () => {
  it("should have header text", () => {
    render(<AdminDashboardPage />);

    const heading = screen.getByText(/manajemen skema database/i)

    expect(heading).toBeInTheDocument();
  });
});
