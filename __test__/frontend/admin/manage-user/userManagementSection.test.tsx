import { render, screen, fireEvent } from '@testing-library/react';
import { UserManagementSection } from '@frontend/admin/manage-user/sections/user-management-section';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('UserManagementSection', () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('renders section title, description, and back button', () => {
    render(<UserManagementSection />);
    
    expect(screen.getByText(/Kelola dan Atur Akses Pengguna/)).toBeInTheDocument();
    expect(screen.getByText(/Melihat daftar akun yang terdaftar/)).toBeInTheDocument();
    expect(screen.getByText('Kembali')).toBeInTheDocument();
  });

  it('navigates back to admin page on back button click', () => {
    render(<UserManagementSection />);
    
    const backButton = screen.getByRole('button', { name: /kembali/i });
    fireEvent.click(backButton);
    
    expect(mockPush).toHaveBeenCalledWith('/admin');
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  // Negative Case
  it('does not crash if navigation fails', () => {
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn().mockImplementation(() => { throw new Error('Navigation error'); }),
    });
    render(<UserManagementSection />);
    const backButton = screen.getByRole('button', { name: /kembali/i });
    expect(() => fireEvent.click(backButton)).not.toThrow();
  });
});