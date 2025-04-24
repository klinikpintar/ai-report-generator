import { renderHook, act } from '@testing-library/react';
import { useEditAccount } from '@frontend/admin/manage-user/hooks/useEditAccount';

describe('useEditAccount Hook', () => {
  const mockOnClose = jest.fn();
  const mockUser = {
    id: '1',
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    status: 'Aktif',
    role: 'Admin',
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
      role: 'Admin',
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
        target: { name: 'role', value: 'invalid_role' }
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formData.role).toBe('Admin');
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
});
