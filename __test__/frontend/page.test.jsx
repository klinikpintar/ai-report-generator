import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Page from "../../app/page";

describe("Main page", () => {
  it("should have started text", () => {
    render(<Page />);

    const heading = screen.getByText(/get started/i)

    expect(heading).toBeInTheDocument();
  });

  it("should have an image", () => {
    render(<Page />);

    const heading = screen.getByRole("img", { name: "Vercel logomark" });

    expect(heading).toBeInTheDocument();
  });
});
