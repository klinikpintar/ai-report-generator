import { render, screen } from "@testing-library/react";
import AISelectionSection from "@frontend/admin/manage-ai/sections/ai-selection-section";
import "@testing-library/jest-dom";

jest.mock("@frontend/admin/manage-ai/components/ai-box", () => () => {
  return <div>Mocked AIBox</div>;
});

describe("AISelectionSection", () => {
  it("should render two AIBox components", () => {
    render(<AISelectionSection />);

    const aiBoxes = screen.getAllByText("Mocked AIBox");
    expect(aiBoxes.length).toBe(2);
  });
});
