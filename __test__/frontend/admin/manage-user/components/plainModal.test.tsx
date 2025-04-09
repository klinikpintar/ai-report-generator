import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '@frontend/admin/manage-user/components/plainModal'; 

describe('Modal Component', () => {
  const defaultProps = {
    isVisible: true,
    title: 'Test Title',
    subtitle: 'Test Subtitle',
    children: <div>Test Content</div>,
    onClose: jest.fn(),
  };

  test('closes modal when clicking wrapper and isForm is false', () => {
    const mockOnClose = jest.fn();
    render(
      <Modal
        {...defaultProps}
        isForm={false}
        onClose={mockOnClose}
      />
    );

    const wrapper = screen.getByTestId('modal-wrapper');
    
    // Simulate click outside the modal
    fireEvent.click(wrapper);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('does not close modal when clicking wrapper and isForm is true', () => {
    const mockOnClose = jest.fn();
    render(
      <Modal
        {...defaultProps}
        isForm={true}
        onClose={mockOnClose}
      />
    );

    const wrapper = screen.getByTestId('modal-wrapper');
    
    // Simulate click outside the modal
    fireEvent.click(wrapper);

    expect(mockOnClose).not.toHaveBeenCalled();
  });
});