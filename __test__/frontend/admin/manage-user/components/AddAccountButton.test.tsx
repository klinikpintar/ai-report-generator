import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddAccountButton } from '@frontend/admin/manage-user/components/addAccountButton';
import '@testing-library/jest-dom';

// Mock AddAccountModal karena kita hanya ingin menguji button, bukan modal
jest.mock('@frontend/admin/manage-user/components/addAccountModal', () => {
  return function MockAddAccountModal({ isVisible, onClose }: { isVisible: boolean, onClose: () => void }) {
    return isVisible ? <div data-testid="mock-modal">Modal Open <button onClick={onClose}>Close</button></div> : null;
  };
});

describe('AddAccountButton', () => {
  it('should render the button with correct text', () => {
    render(<AddAccountButton />);
    expect(screen.getByText('Tambah Akun')).toBeInTheDocument();
  });

  it('should show modal when button is clicked', async () => {
    render(<AddAccountButton />);
    
    // Modal shouldn't be visible initially
    expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Tambah Akun'));
    
    // Modal should now be visible
    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
  });

  it('should close the modal when onClose is triggered', async () => {
    render(<AddAccountButton />);
    
    // Open modal
    fireEvent.click(screen.getByText('Tambah Akun'));
    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Close'));
    
    // Modal should now be hidden
    await waitFor(() => {
      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    });
  });
});