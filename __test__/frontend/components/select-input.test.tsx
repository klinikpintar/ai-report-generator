import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SelectInput from '@/app/(frontend)/components/select-input';
import '@testing-library/jest-dom';

describe('SelectInput Component', () => {
  const mockOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ];

  const mockProps = {
    label: 'Test Label',
    name: 'test-select',
    options: mockOptions
  };

  it('renders with default props correctly', () => {
    // Arrange & Act
    render(<SelectInput {...mockProps} />);
    
    // Assert
    const labelElement = screen.getByText('Test Label');
    expect(labelElement).toBeInTheDocument();
    
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toHaveAttribute('id', 'test-select');
    expect(selectElement).toHaveAttribute('name', 'test-select');
    expect(selectElement).toHaveValue('');
    
    // Cek default option
    const defaultOption = screen.getByText('Pilih Test Label');
    expect(defaultOption).toBeInTheDocument();
    expect(defaultOption).toHaveAttribute('disabled');
    
    // Cek semua option tersedia
    mockOptions.forEach(option => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  it('renders with provided value', () => {
    // Arrange & Act
    render(<SelectInput {...mockProps} value="option2" />);
    
    // Assert
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toHaveValue('option2');
  });

  it('renders the correct number of options', () => {
    // Arrange & Act
    render(<SelectInput {...mockProps} />);
    
    // Assert - 1 default option + 3 provided options
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(4);
  });

  it('applies the correct CSS classes', () => {
    // Arrange & Act
    render(<SelectInput {...mockProps} />);
    
    // Assert
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toHaveClass('bg-[#00B0EB]');
    expect(selectElement).toHaveClass('text-white');
    expect(selectElement).toHaveClass('rounded-lg');
    
    const labelElement = screen.getByText('Test Label');
    expect(labelElement).toHaveClass('text-gray-900');
    expect(labelElement).toHaveClass('font-semibold');
  });
});