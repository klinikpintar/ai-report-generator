import { render, screen, fireEvent } from '@testing-library/react';
import { ManageUserSection } from '@frontend/admin/manage-user/sections/manageUserSection';
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
    it('disables button when navigation is not possible', () => {
        // Mock router to simulate a scenario where navigation is not possible
        (useRouter as jest.Mock).mockReturnValue(null);

        render(<ManageUserSection />);
        const button = screen.getByText('Kelola Akun Sekarang');

        // Check that the button is present but not clickable
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
    });
});