import { renderHook, act } from '@testing-library/react';
import { useEditAccount } from '@frontend/admin/manage-user/hooks/useEditAccount';
import axios from 'axios';
import { toast } from 'react-toastify';

jest.mock('axios');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('useEditAccount Hook', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockUser = {
    id: '1',
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    status: 'Aktif',
    role: 'ADMIN',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize formData with provided user data', () => {
    const { result } = renderHook(() => useEditAccount(mockUser, mockOnClose));

    expect(result.current.formData).toEqual({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      status: 'Aktif',
      role: 'ADMIN',
    });
    expect(result.current.errors).toEqual({});
  });

  it('should update formData on valid input', () => {
    const { result } = renderHook(() => useEditAccount(mockUser, mockOnClose));

    act(() => {
      result.current.handleChange({
        target: { name: 'fullName', value: 'Updated Name' }
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.fullName).toBe('Updated Name');
  });

  it('should not update role if invalid', () => {
    const { result } = renderHook(() => useEditAccount(mockUser, mockOnClose));

    act(() => {
      result.current.handleChange({
        target: { name: 'role', value: 'INVALID_ROLE' }
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.role).toBe('ADMIN');
  });

  it('should not update status if invalid', () => {
    const { result } = renderHook(() => useEditAccount(mockUser, mockOnClose));
  
    act(() => {
      result.current.handleChange({
        target: { name: 'status', value: 'invalid_status' }
      } as React.ChangeEvent<HTMLInputElement>);
    });
  
    expect(result.current.formData.status).toBe('Aktif');
  });

  it('should validate missing required fields', async () => {
    const { result } = renderHook(() => useEditAccount({ ...mockUser, role: '', status: '' }, mockOnClose));

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: () => {}
      } as React.FormEvent<HTMLFormElement>);
    });

    expect(result.current.errors.role).toBe('Role harus dipilih');
    expect(result.current.errors.status).toBe('Status akun harus dipilih');
  });

  it('should clear errors when input is corrected', () => {
    const { result } = renderHook(() => useEditAccount(mockUser, mockOnClose));

    act(() => {
      result.current.setErrors({ fullName: 'Required' });
    });

    act(() => {
      result.current.handleChange({
        target: { name: 'fullName', value: 'Corrected Name' }
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.errors.fullName).toBeUndefined();
  });

  it('should submit successfully and call onSuccess and onClose', async () => {
    (axios.patch as jest.Mock).mockResolvedValue({});

    const { result } = renderHook(() => useEditAccount(mockUser, mockOnClose, mockOnSuccess));

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: () => {}
      } as React.FormEvent<HTMLFormElement>);
    });

    expect(axios.patch).toHaveBeenCalledWith(`/api/users/${mockUser.id}`, {
      name: mockUser.fullName,
      email: mockUser.email,
      role: mockUser.role,
      isActive: mockUser.status == "Aktif" ? true : false,
    });
    expect(toast.success).toHaveBeenCalledWith("User successfully updated", expect.any(Object));
    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should handle API error and set email error if email conflict', async () => {
    (axios.patch as jest.Mock).mockRejectedValue({
      response: { data: { message: "Email already exists" } }
    });

    const { result } = renderHook(() => useEditAccount(mockUser, mockOnClose));

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: () => {}
      } as React.FormEvent<HTMLFormElement>);
    });

    expect(result.current.errors.email).toBe("Email already exists");
    expect(toast.error).toHaveBeenCalledWith("Update failed: Email already exists", expect.any(Object));
  });

  it('should handle unexpected API error', async () => {
    (axios.patch as jest.Mock).mockRejectedValue({});

    const { result } = renderHook(() => useEditAccount(mockUser, mockOnClose));

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: () => {}
      } as React.FormEvent<HTMLFormElement>);
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Update failed: Unexpected error occurred. Please try again",
      expect.any(Object)
    );
  });
});
