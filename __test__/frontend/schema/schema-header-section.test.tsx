import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { SchemaHeaderSection } from "@/modules/schema/sections";

describe("Admin View Schema", () => {
  it("should have header text", () => {
    render(<SchemaHeaderSection />);

    const heading = screen.getByText(/manajemen skema database/i)

    expect(heading).toBeInTheDocument();
  });
});
