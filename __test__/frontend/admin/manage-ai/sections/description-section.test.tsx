import { render, screen } from "@testing-library/react";
import ManageAISection from "@frontend/admin/manage-ai/sections/description-section";
import "@testing-library/jest-dom";

describe("ManageAISection", () => {
  it("should render ManageAISection text", () => {
    render(<ManageAISection />);

    expect(screen.getByText("ini manage ai section hahai")).toBeInTheDocument();
  });
});
