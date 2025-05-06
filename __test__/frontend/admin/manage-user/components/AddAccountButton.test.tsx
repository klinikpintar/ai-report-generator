import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddAccountButton } from "@frontend/admin/manage-user/components/addAccountButton";
import type { AddAccountModalProps } from "@frontend/admin/manage-user/components/addAccountModal";

jest.mock("@frontend/admin/manage-user/components/addAccountModal", () => ({
  __esModule: true,
  default: ({ isVisible, onClose }: AddAccountModalProps) =>
    isVisible ? (
      <div data-testid="mock-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null,
}));

describe("AddAccountButton", () => {
  it("should render the 'Tambah Akun' button", () => {
    render(<AddAccountButton />);
    const button = screen.getByRole("button", { name: /Tambah Akun/i });
    expect(button).toBeInTheDocument();
  });

  it("should open the modal when button is clicked", async () => {
    render(<AddAccountButton />);
    const button = screen.getByRole("button", { name: /Tambah Akun/i });

    await userEvent.click(button);
    const modal = await screen.findByTestId("mock-modal");
    expect(modal).toBeInTheDocument();
  });

  it("should close the modal when onClose is triggered", async () => {
    render(<AddAccountButton />);
    const button = screen.getByRole("button", { name: /Tambah Akun/i });
    await userEvent.click(button);
    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();

    const closeButton = await screen.findByText("Close Modal");
    await userEvent.click(closeButton);
    expect(screen.queryByTestId("mock-modal")).not.toBeInTheDocument();
  });

  it('applies the correct styling to the button', () => {
    render(<AddAccountButton />);
    
    const button = screen.getByRole('button', { name: /tambah akun/i });
    expect(button).toHaveClass('bg-blue-6');
    expect(button).toHaveClass('text-white');
    expect(button).toHaveClass('font-semibold');
    expect(button).toHaveClass('rounded-md');
  });
});
