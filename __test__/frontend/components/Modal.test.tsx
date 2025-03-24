import { render, screen, fireEvent } from "@testing-library/react";
import Modal from "@frontend/components/Modal";

describe("Modal Test", () => {
  const onCloseMock = jest.fn();

  const defaultProps = {
    isVisible: true,
    title: "Modal",
    subtitle: "Ini adalah Modal",
    onClose: onCloseMock,
    children: <p>Modal Content</p>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should not call 'onClose' if the click is inside the modal", () => {
    render(<Modal {...defaultProps} />);

    const modalContent = screen.getByText("Modal Content");
    fireEvent.click(modalContent);

    expect(onCloseMock).not.toHaveBeenCalled();
  });
});
