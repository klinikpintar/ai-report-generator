import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddAccountModal from "@frontend/admin/manage-user/components/addAccountModal";
import userEvent from "@testing-library/user-event";

describe('AddAccountModal', () => {
    const handleClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should be hidden when first rendered", () => {
    render(<AddAccountModal isVisible={false} onClose={() => {}} />);

    expect(screen.getByText("Sign up new account")).toHaveAttribute("aria-hidden", "true");
  });

  it('should render correctly when visible', () => {
    render(<AddAccountModal isVisible={true} onClose={handleClose} />);
    expect(screen.getByText('Sign up new account')).toBeVisible();
  });

  it('should call handleClose and clear the form when Batal button is clicked', async () => {
    render(<AddAccountModal isVisible={true} onClose={handleClose} />);
    
    await userEvent.type(screen.getByLabelText('Nama Lengkap'), 'John Doe');

    await userEvent.click(screen.getByText('Batal'));
    // Verify handleClose was called when the Batal button is clicked
    expect(handleClose).toHaveBeenCalled();
    
    // re-render the component, simulate reopen the modal
    render(<AddAccountModal isVisible={true} onClose={handleClose} />);
    
    // Check that the field is empty in the new render
    expect(screen.getByLabelText('Nama Lengkap')).toHaveValue('');
  });

  it('should show validation errors when submitting empty form', async () => {
    render(<AddAccountModal isVisible={true} onClose={handleClose} />);

    const form = screen.getByRole('form');
    
    // Submit empty form directly
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(screen.getByText('Nama Lengkap is required')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Confirm Password is required')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Role is required')).toBeInTheDocument();
    });
  });

  it('should validate password length', async () => {
    render(<AddAccountModal isVisible={true} onClose={handleClose} />);
    
    // Fill in all fields except password is too short
    await userEvent.type(screen.getByLabelText('Nama Lengkap'), 'John Doe');
    await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'short');
    await userEvent.type(screen.getByLabelText('Confirm Password'), 'short');
    

    const adminRadio = screen.getByLabelText('Admin');
    fireEvent.click(adminRadio);
    
    fireEvent.submit(screen.getByRole('form'));
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
    });
  });

  it('should validate password match', async () => {
    render(<AddAccountModal isVisible={true} onClose={handleClose} />);
    
    // Fill form with mismatched passwords
    await userEvent.type(screen.getByLabelText('Nama Lengkap'), 'John Doe');
    await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirm Password'), 'password456');
    
    const adminRadio = screen.getByLabelText('Admin');
    fireEvent.click(adminRadio);

    fireEvent.submit(screen.getByRole('form'));
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });
});
