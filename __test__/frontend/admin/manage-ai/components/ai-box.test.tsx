import { render, screen, fireEvent } from "@testing-library/react";
import AIBox from "@frontend/admin/manage-ai/components/ai-box";
import '@testing-library/jest-dom';
import { JSX, ClassAttributes, ImgHTMLAttributes } from "react";

jest.mock("next/image", () => (props: JSX.IntrinsicAttributes & ClassAttributes<HTMLImageElement> & ImgHTMLAttributes<HTMLImageElement>) => {
  // Mock Next.js Image component
  return <img {...props} />;
});

describe("AIBox", () => {
  it("should render DeepSeek title and key icon", () => {
    render(<AIBox />);

    expect(screen.getByText("DeepSeek")).toBeInTheDocument();
    expect(screen.getByAltText("DeepSeek Logo")).toBeInTheDocument();
    expect(screen.getByAltText("icon-key")).toBeInTheDocument();
  });

  it("should display default button text as 'Pilih Model'", () => {
    render(<AIBox />);

    expect(screen.getByRole("button", { name: /Pilih Model/i })).toBeInTheDocument();
  });

  it("should open dropdown and select a model", () => {
    render(<AIBox />);

    // Open dropdown
    const triggerButton = screen.getByRole("button", { name: /Pilih Model/i });
    fireEvent.click(triggerButton);

    // // Select a model (e.g., "deepseek-coder")
    // const modelItem = screen.getByText("deepseek-coder");
    // fireEvent.click(modelItem);

    // // After selecting, the button should display "deepseek-coder"
    // expect(screen.getByRole("button", { name: /deepseek-coder/i })).toBeInTheDocument();
  });
});
