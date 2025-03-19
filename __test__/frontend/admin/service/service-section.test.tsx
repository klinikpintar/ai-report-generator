import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { ServiceSection } from "@frontend/admin/service/sections/service-section";

describe("Service Management Test", () => {
  it("Should have header text", () => {
    render(<ServiceSection />);

    const heading = screen.getByText(/Manajemen Service Klinik Pintar/i);

    expect(heading).toBeInTheDocument();
  });

  it("Should have service management button", () => {
    render(<ServiceSection />);

    const heading = screen.getByText(/Kelola Service Sekarang/i);

    expect(heading).toBeInTheDocument();
  });
});
