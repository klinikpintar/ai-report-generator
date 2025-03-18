import { render, screen, fireEvent } from "@testing-library/react";
import Modal from "@frontend/components/Modal";

describe("Modal Test", () => {
  const onCloseMock = jest.fn();
  const onClearFormMock = jest.fn();

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

  it("Should call 'onClose' if click outside modal", () => {
    render(<Modal {...defaultProps} />);

    const wrapper = screen.getByTestId("wrapper");
    fireEvent.click(wrapper);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("Should not call 'onClose' if the click is inside the modal", () => {
    render(<Modal {...defaultProps} />);

    const modalContent = screen.getByText("Modal Content");
    fireEvent.click(modalContent);

    expect(onCloseMock).not.toHaveBeenCalled();
  });

  it("Should call 'onClearForm' if given as props and click outside modal", () => {
    render(<Modal {...defaultProps} onClearForm={onClearFormMock} />);

    const wrapper = screen.getByTestId("wrapper");
    fireEvent.click(wrapper);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
    expect(onClearFormMock).toHaveBeenCalledTimes(1);
  });
});
