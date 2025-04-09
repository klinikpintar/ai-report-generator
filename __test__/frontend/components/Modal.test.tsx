import { render, screen } from "@testing-library/react";
import Modal from "@frontend/components/Modal";

describe("Modal Component", () => {
  const onCloseMock = jest.fn();
  const onClearFormMock = jest.fn();

  const baseProps = {
    title: "Contoh Modal",
    subtitle: "Ini subtitle modal",
    children: <p>Isi konten modal</p>,
    onClose: onCloseMock,
  };

  it("should render modal with title, subtitle, and children", () => {
    render(<Modal {...baseProps} />);

    expect(screen.getByText("Contoh Modal")).toBeInTheDocument();
    expect(screen.getByText("Ini subtitle modal")).toBeInTheDocument();
    expect(screen.getByText("Isi konten modal")).toBeInTheDocument();

    const wrapper = screen.getByTestId("wrapper");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass("bg-black/50");
  });

  it("should render with onClearForm prop without throwing error", () => {
    render(<Modal {...baseProps} onClearForm={onClearFormMock} />);
    expect(screen.getByText("Contoh Modal")).toBeInTheDocument();
    // Hanya memastikan tidak error saat onClearForm diberikan
    expect(onClearFormMock).not.toHaveBeenCalled();
  });

  it("should apply expected base classes", () => {
    render(<Modal {...baseProps} />);

    const wrapper = screen.getByTestId("wrapper");
    const inner = wrapper.querySelector("div.bg-white");

    expect(wrapper).toHaveClass("fixed", "inset-0", "bg-black/50");
    expect(inner).toHaveClass("bg-white", "rounded-lg", "shadow");
  });
});
