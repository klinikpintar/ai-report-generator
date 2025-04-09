import { renderHook, act } from '@testing-library/react';
import { useAddAccount } from '@frontend/admin/manage-user/hooks/useAddAccount';

describe('useAddAccount Hook', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty form data and no errors', () => {
    const { result } = renderHook(() => useAddAccount(mockOnClose));

    expect(result.current.formData).toEqual({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
    });
    expect(result.current.errors).toEqual({});
  });

  it('should not update formData for invalid role input', () => {
    const { result } = renderHook(() => useAddAccount(mockOnClose));
    
    act(() => {
      result.current.handleChange({
        target: { name: 'role', value: 'invalid_role' }
      } as React.ChangeEvent<HTMLInputElement>);
    });
    
    expect(result.current.formData.role).toBe('');
  });
  
  it('should update formData for valid role input', () => {
    const { result } = renderHook(() => useAddAccount(mockOnClose));
    
    act(() => {
      result.current.handleChange({
        target: { name: 'role', value: 'admin' }
      } as React.ChangeEvent<HTMLInputElement>);
    });
    
    expect(result.current.formData.role).toBe('admin');
  });

  it('should validate email format', async () => {
    const { result } = renderHook(() => useAddAccount(mockOnClose));

    // Fill form with invalid email format
    act(() => {
      result.current.handleChange({
        target: { name: 'email', value: 'invalidemail' }
      } as React.ChangeEvent<HTMLInputElement>);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: () => {}
      } as React.FormEvent<HTMLFormElement>);
    });

    expect(result.current.errors.email).toBe('Email is invalid');
  });

  it('should validate password length', async () => {
    const { result } = renderHook(() => useAddAccount(mockOnClose));

    // Fill form with short password
    act(() => {
      result.current.handleChange({
        target: { name: 'password', value: 'short' }
      } as React.ChangeEvent<HTMLInputElement>);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: () => {}
      } as React.FormEvent<HTMLFormElement>);
    });

    expect(result.current.errors.password).toBe('Password must be at least 8 characters long');
  });

  it('should validate password match', async () => {
    const { result } = renderHook(() => useAddAccount(mockOnClose));

    // Fill form with mismatched passwords
    act(() => {
      result.current.handleChange({
        target: { name: 'password', value: 'password123' }
      } as React.ChangeEvent<HTMLInputElement>);
      result.current.handleChange({
        target: { name: 'confirmPassword', value: 'password456' }
      } as React.ChangeEvent<HTMLInputElement>);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: () => {}
      } as React.FormEvent<HTMLFormElement>);
    });

    expect(result.current.errors.confirmPassword).toBe('Passwords do not match');
  });

  it('should clear errors after user fill/fix the input of the error fields', () => {
    const { result } = renderHook(() => useAddAccount(mockOnClose));

    // Set an error
    act(() => {
      result.current.handleChange({
        target: { name: 'password', value: 'short' }
      } as React.ChangeEvent<HTMLInputElement>);
    });

    act(() => {
      result.current.handleSubmit({
        preventDefault: () => {}
      } as React.FormEvent<HTMLFormElement>);
    });

    expect(result.current.errors.password).toBeTruthy();

    // Start typing again
    act(() => {
      result.current.handleChange({
        target: { name: 'password', value: 'longer_password' }
      } as React.ChangeEvent<HTMLInputElement>);
    });

    // Error should be cleared
    expect(result.current.errors.password).toBeUndefined();
  });
});