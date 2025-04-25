import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddAccountModal from "@frontend/admin/manage-user/components/addAccountModal";
import userEvent from "@testing-library/user-event";
import { toast } from "react-toastify";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));
const mockedToast = toast as jest.Mocked<typeof toast>;

describe('AddAccountModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be hidden when first rendered", () => {
    render(<AddAccountModal isVisible={false} onClose={() => { }} />);

    expect(screen.getByText("Sign up new account")).toHaveAttribute("aria-hidden", "true");
  });

  it('should render correctly when visible', () => {
    render(<AddAccountModal isVisible={true} onClose={mockOnClose} />);
    expect(screen.getByText('Sign up new account')).toBeVisible();
  });

  it('should call handleClose and clear the form when Batal button is clicked', async () => {
    render(<AddAccountModal isVisible={true} onClose={mockOnClose} />);

    await userEvent.type(screen.getByLabelText('Nama Lengkap'), 'John Doe');

    await userEvent.click(screen.getByText('Batal'));
    // Verify handleClose was called when the Batal button is clicked
    expect(mockOnClose).toHaveBeenCalled();

    // re-render the component, simulate reopen the modal
    render(<AddAccountModal isVisible={true} onClose={mockOnClose} />);

    // Check that the field is empty in the new render
    expect(screen.getByLabelText('Nama Lengkap')).toHaveValue('');
  });

  it('should show validate required field that is not handled by HTML form validation', async () => {
    render(<AddAccountModal isVisible={true} onClose={mockOnClose} />);

    const button = screen.getByRole('button', { name: /simpan/i });
    const form = button.closest('form');
    if (form) {
      fireEvent.submit(form);
    }
    await waitFor(() => {
      expect(screen.getByText('Role is required')).toBeInTheDocument();
    });
  });

  it('should validate password length', async () => {
    render(<AddAccountModal isVisible={true} onClose={mockOnClose} />);

    // Fill in all fields except password is too short
    await userEvent.type(screen.getByLabelText('Nama Lengkap'), 'John Doe');
    await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'short');
    await userEvent.type(screen.getByLabelText('Confirm Password'), 'short');

    const adminRadio = screen.getByLabelText('Admin');
    fireEvent.click(adminRadio);

    const button = screen.getByRole('button', { name: /simpan/i });
    const form = button.closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
    });
  });

  it('should validate password match', async () => {
    render(<AddAccountModal isVisible={true} onClose={mockOnClose} />);

    // Fill form with mismatched passwords
    await userEvent.type(screen.getByLabelText('Nama Lengkap'), 'John Doe');
    await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirm Password'), 'password456');

    const adminRadio = screen.getByLabelText('Admin');
    fireEvent.click(adminRadio);

    const button = screen.getByRole('button', { name: /simpan/i });
    const form = button.closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(screen.getByText('Password and confirm password must match')).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    // Mock successful API response
    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

    render(<AddAccountModal isVisible={true} onClose={mockOnClose} />);

    // Fill form with valid data
    await userEvent.type(screen.getByLabelText('Nama Lengkap'), 'John Doe');
    await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirm Password'), 'password123');
    await userEvent.click(screen.getByLabelText('Admin'));

    // Submit form
    await userEvent.click(screen.getByText('Simpan'));

    // Verify API called with correct data
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/users', {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        role: 'ADMIN'
      });
    });

    // Verify modal was closed
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should show API error when submission fails', async () => {
    // Mock failed API call
    const errorMessage = 'Email already exists';
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        data: {
          message: errorMessage
        }
      }
    });

    render(<AddAccountModal isVisible={true} onClose={mockOnClose} />);

    // Fill form with valid data
    await userEvent.type(screen.getByLabelText('Nama Lengkap'), 'John Doe');
    await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirm Password'), 'password123');
    await userEvent.click(screen.getByLabelText('Admin'));

    // Submit form
    await userEvent.click(screen.getByText('Simpan'));

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Modal should not close
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should display toast notification when form is submitted successfully', async () => {
    // Mock successful API response
    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

    render(<AddAccountModal isVisible={true} onClose={mockOnClose} />);

    // Fill form with valid data
    await userEvent.type(screen.getByLabelText('Nama Lengkap'), 'John Doe');
    await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirm Password'), 'password123');
    await userEvent.click(screen.getByLabelText('Admin'));

    // Submit form
    await userEvent.click(screen.getByText('Simpan'));

    // Verify toast notification was shown
    await waitFor(() => {
      expect(mockedToast.success).toHaveBeenCalledWith(
        'Registration successful! New account has been created',
        expect.any(Object)
      );
    });
  });

  //handle various error messages from the API
  it('should display error toast when email already exists', async () => {
    // Mock failed API call
    const errorMessage = 'Email already exists';
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        data: {
          message: errorMessage
        }
      }
    });

    render(<AddAccountModal isVisible={true} onClose={mockOnClose} />);

    // Fill form with valid data
    await userEvent.type(screen.getByLabelText('Nama Lengkap'), 'John Doe');
    await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirm Password'), 'password123');
    await userEvent.click(screen.getByLabelText('Admin'));

    // Submit form
    await userEvent.click(screen.getByText('Simpan'));

    // Verify error toast notification was shown
    await waitFor(() => {
      expect(mockedToast.error).toHaveBeenCalledWith(
        `Registration failed: ${errorMessage}`,
        expect.any(Object)
      );
    });
  });

  it('should display error toast when password is too weak', async () => {
    const errorMessage = 'Password is too weak';
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        data: {
          message: errorMessage
        }
      }
    });
    render(<AddAccountModal isVisible={true} onClose={mockOnClose} />);

    // Fill form with valid data
    await userEvent.type(screen.getByLabelText('Nama Lengkap'), 'John Doe');
    await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirm Password'), 'password123');
    await userEvent.click(screen.getByLabelText('Admin'));

    // Submit form
    await userEvent.click(screen.getByText('Simpan'));

    // Verify error toast notification was shown
    await waitFor(() => {
      expect(mockedToast.error).toHaveBeenCalledWith(
        `Registration failed: ${errorMessage}`,
        expect.any(Object)
      );
    });
  })

  it('should display error toast with general message when the response error message is empty', async () => {
    const errorMessage = null;
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        data: {
          message: errorMessage
        }
      }
    });
    render(<AddAccountModal isVisible={true} onClose={mockOnClose} />);

    // Fill form with valid data
    await userEvent.type(screen.getByLabelText('Nama Lengkap'), 'John Doe');
    await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirm Password'), 'password123');
    await userEvent.click(screen.getByLabelText('Admin'));

    // Submit form
    await userEvent.click(screen.getByText('Simpan'));

    // Verify error toast notification was shown
    await waitFor(() => {
      expect(mockedToast.error).toHaveBeenCalledWith(
        `Registration failed: Unexpected error occurred. Please try again`,
        expect.any(Object)
      );
    });
  })

  it('should toggle password visibility when the show password button is clicked', async () => {
    render(<AddAccountModal isVisible={true} onClose={mockOnClose} />);
  
    // Find password fields and toggle buttons
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    
    const showPasswordButton = screen.getByLabelText('Show password');
    
    // Verify initially passwords are hidden (type is password)
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    
    await userEvent.click(showPasswordButton);
    
    // Verify password is now visible (type is text)
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password'); // Confirm password field should still be hidden
    
    // Toggle password back to hidden
    await userEvent.click(showPasswordButton);
    
    // Verify password and confirm password fields are hidden again
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });

  it('should toggle confirm password visibility when the show confirm password button is clicked', async () => {
    render(<AddAccountModal isVisible={true} onClose={mockOnClose} />);
  
    // Find password fields and toggle buttons
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    
    const showConfirmPasswordButton = screen.getByLabelText('Show confirm password');
    
    // Verify initially passwords are hidden (type is password)
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    
    await userEvent.click(showConfirmPasswordButton);
    
    // Verify confirm password is now visible
    expect(passwordInput).toHaveAttribute('type', 'password'); // Password field should still be hidden
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    
    // Toggle confirm password back to hidden
    await userEvent.click(showConfirmPasswordButton);
    
     // Verify password and confirm password fields are hidden again
     expect(passwordInput).toHaveAttribute('type', 'password');
     expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });

  it('should update aria-label when toggling password visibility', async () => {
    render(<AddAccountModal isVisible={true} onClose={mockOnClose} />);
    
    const showPasswordButton = screen.getByLabelText('Show password');
    
    // Initially the aria-label should be "Show password"
    expect(showPasswordButton).toHaveAttribute('aria-label', 'Show password');
    
    // After clicking, the aria-label should change
    await userEvent.click(showPasswordButton);
    expect(showPasswordButton).toHaveAttribute('aria-label', 'Hide password');
    
    // After clicking again, the aria-label should revert
    await userEvent.click(showPasswordButton);
    expect(showPasswordButton).toHaveAttribute('aria-label', 'Show password');
  });
});
