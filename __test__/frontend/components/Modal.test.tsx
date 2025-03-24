import { render, screen, fireEvent } from "@testing-library/react";
import Modal from "@frontend/components/Modal";

describe("Modal Test", () => {
  const onCloseMock = jest.fn();

  const formModal = {
    isVisible: true,
    title: "Modal",
    subtitle: "Ini adalah Modal",
    onClose: onCloseMock,
    children: <p>Modal Content</p>,
    isForm: true,
  };

  const nonFormModal = {
    isVisible: true,
    title: "Modal",
    subtitle: "Ini adalah Modal",
    onClose: onCloseMock,
    children: <p>Modal Content</p>,
    isForm: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should call 'onClose' if click outside modal", () => {
    render(<Modal {...nonFormModal} />);

    const wrapper = screen.getByTestId("wrapper");
    fireEvent.click(wrapper);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("Should not call 'onClose' if the click is inside the modal", () => {
    render(<Modal {...formModal} />);

    const modalContent = screen.getByText("Modal Content");
    fireEvent.click(modalContent);

    expect(onCloseMock).not.toHaveBeenCalled();
  });
});
