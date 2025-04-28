import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import UserFormEdit from '@/app/(frontend)/admin/manage-user/components/userFormEdit';

describe('UserFormEdit', () => {
  const mockHandleChange = jest.fn();
  const mockHandleSubmit = jest.fn((e) => e.preventDefault());
  const mockHandleCancel = jest.fn();

  const defaultProps = {
    formData: {
      fullName: 'test',
      email: 'test@example.com',
      status: 'Aktif',
      role: 'ADMIN',
    },
    errors: {},
    handleChange: mockHandleChange,
    handleSubmit: mockHandleSubmit,
    handleCancel: mockHandleCancel,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields with default values', () => {
    render(<UserFormEdit {...defaultProps} />);

    expect(screen.getByLabelText(/Nama Lengkap/i)).toHaveValue('test');
    expect(screen.getByLabelText(/Email/i)).toHaveValue('test@example.com');
    expect(screen.getByLabelText('Aktif')).toBeChecked();
    expect(screen.getByLabelText('Admin')).toBeChecked();
  });

  it('calls handleChange when input values are changed', () => {
    render(<UserFormEdit {...defaultProps} />);
    
    fireEvent.change(screen.getByLabelText(/Nama Lengkap/i), {
      target: { value: 'test t2' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'test.k@example.com' },
    });

    expect(mockHandleChange).toHaveBeenCalledTimes(2);
  });

  it('calls handleSubmit when form is submitted', () => {
    render(<UserFormEdit {...defaultProps} />);
    
    const form = screen.getByText(/Simpan/i).closest('form');
    expect(form).not.toBeNull();
  
    fireEvent.submit(form!);
  
    expect(mockHandleSubmit).toHaveBeenCalled();
  });
  

  it('calls handleCancel when cancel button is clicked', () => {
    render(<UserFormEdit {...defaultProps} />);
    
    fireEvent.click(screen.getByText(/Batal/i));
    
    expect(mockHandleCancel).toHaveBeenCalled();
  });

  it('displays error messages when provided', () => {
    const propsWithErrors = {
      ...defaultProps,
      errors: {
        fullName: 'Nama wajib diisi',
        email: 'Email tidak valid',
        status: 'Pilih status',
        role: 'Pilih role',
      },
    };

    render(<UserFormEdit {...propsWithErrors} />);

    expect(screen.getByText('Nama wajib diisi')).toBeInTheDocument();
    expect(screen.getByText('Email tidak valid')).toBeInTheDocument();
    expect(screen.getByText('Pilih status')).toBeInTheDocument();
    expect(screen.getByText('Pilih role')).toBeInTheDocument();
  });

  it('allows selecting Nonaktif status and Business Analyst role', () => {
    const updatedProps = {
      ...defaultProps,
      formData: {
        ...defaultProps.formData,
        status: 'Nonaktif',
        role: 'BUSINESS_ANALYST',
      },
    };
  
    render(<UserFormEdit {...updatedProps} />);
  
    expect(screen.getByLabelText('Nonaktif')).toBeChecked();
    expect(screen.getByLabelText('Business Analyst')).toBeChecked();
  });  
});
