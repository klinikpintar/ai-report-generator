import { render, screen, fireEvent } from '@testing-library/react';
import { ManageUserSection } from '@frontend/admin/manage-user/sections/manage-user-section';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('ManageUserSection', () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('renders section title and description', () => {
    render(<ManageUserSection />);
    
    expect(screen.getByText('Manajemen Pengguna Internal')).toBeInTheDocument();
    expect(screen.getByText(/Kelola Akun Internal Klinik Pintar/)).toBeInTheDocument();
    expect(screen.getByText(/Periksa, perbarui, atau nonaktifkan/)).toBeInTheDocument();
  });

  it('navigates to manage-user page on button click', () => {
    render(<ManageUserSection />);
    
    const button = screen.getByText('Kelola Akun Sekarang');
    fireEvent.click(button);
    
    expect(mockPush).toHaveBeenCalledWith('admin/manage-user');
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  // Negative Case
  it('handles router push failure gracefully', () => {
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn().mockImplementation(() => { throw new Error('Navigation failed'); }),
    });
    render(<ManageUserSection />);
    const button = screen.getByText('Kelola Akun Sekarang');
    expect(() => fireEvent.click(button)).not.toThrow(); // Shouldn't crash the app
  });
});