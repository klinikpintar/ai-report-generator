import { render, screen, fireEvent } from "@testing-library/react";
import AIBox from "@frontend/admin/manage-ai/components/ai-box";
import '@testing-library/jest-dom';
import { JSX, ClassAttributes, ImgHTMLAttributes } from "react";

jest.mock("next/image", () => (props: JSX.IntrinsicAttributes & ClassAttributes<HTMLImageElement> & ImgHTMLAttributes<HTMLImageElement>) => {
  return <img {...props} />;
});

const mockProps = {
  modelName: "DeepSeek",
  logoPath: "/logo-deepseek.png",
  models: ["o4", "o3-mini", "deepseek-coder", "deepseek-chat"],
};

describe("AIBox", () => {
  it("should render model name and key icon", () => {
    render(<AIBox {...mockProps} />);

    expect(screen.getByText("DeepSeek")).toBeInTheDocument();
    expect(screen.getByAltText("DeepSeek Logo")).toBeInTheDocument();
    expect(screen.getByAltText("icon-key")).toBeInTheDocument();
  });

  it("should display default button text as 'Pilih Model'", () => {
    render(<AIBox {...mockProps} />);

    expect(screen.getByRole("button", { name: /Pilih Model/i })).toBeInTheDocument();
  });

  it("should open dropdown and select a model", async () => {
    render(<AIBox {...mockProps} testOpenDropdown={true} />);

    const modelItem = await screen.findByText("deepseek-coder");
    fireEvent.click(modelItem);

    expect(screen.getByRole("button", { name: /deepseek-coder/i })).toBeInTheDocument();
  });
});
