import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import { ConfirmationDialog, ConfirmationDialogProps } from "@frontend/components/ConfirmationDialog";

describe("ConfirmationDialog Component", () => {
  const defaultProps: ConfirmationDialogProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: "Confirmation Dialog",
    description: "Are you sure you want to delete this item?",
  };

  const setup = (componentProps = defaultProps) => {
    render(<ConfirmationDialog {...componentProps} />);
  };

  // TC1 : should display dialog title
  it("should display dialog title", () => {
    setup();
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
  });

  // TC2 : should display dialog description
  it("should display dialog description", () => {
    setup();
    expect(screen.getByText(defaultProps.description)).toBeInTheDocument();
  });

  // TC3 : should display cancel button text
  it("should display cancel button text", () => {
    setup();
    expect(screen.getByText("Batal")).toBeInTheDocument();
  });

  // TC4 : should display confirm button text
  it("should display confirm button text", () => {
    setup();
    expect(screen.getByText("Konfirmasi")).toBeInTheDocument();
  });

  // TC: should display custom cancel button text
  it("should display custom cancel button text", () => {
    setup({ ...defaultProps, cancelButtonText: "No" });
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  // TC: should display custom confirm button text
  it("should display custom confirm button text", () => {
    setup({ ...defaultProps, confirmButtonText: "Yes" });
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });

  // TC5 : should call onClose when cancel button is clicked
  it("should call onClose when cancel button is clicked", () => {
    setup({ ...defaultProps, cancelButtonText: "No" });
    const cancelButton = screen.getByText("No");
    cancelButton.click();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  // TC6 : should call onConfirm when confirm button is clicked
  it("should call onConfirm when confirm button is clicked", () => {
    setup({ ...defaultProps, confirmButtonText: "Yes" });
    const confirmButton = screen.getByText("Yes");
    confirmButton.click();
    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });
});
