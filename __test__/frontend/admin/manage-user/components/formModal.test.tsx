import { render, screen, fireEvent } from '@testing-library/react';
import FormModal from '@frontend/admin/manage-user/components/formModal';

describe('FormModal Component', () => {
    const defaultProps = {
        isVisible: true,
        title: 'Test Form Title',
        subtitle: 'Test Form Subtitle',
        children: <div>Test Form Content</div>,
        onClose: jest.fn(),
    };

    test('renders form modal with correct title and content', () => {
        render(<FormModal {...defaultProps} />);

        expect(screen.getByText('Test Form Title')).toBeInTheDocument();
        expect(screen.getByText('Test Form Subtitle')).toBeInTheDocument();
        expect(screen.getByText('Test Form Content')).toBeInTheDocument();
    });

    test('does not close modal when clicking outside the form', () => {
        const mockOnClose = jest.fn();
        render(
            <FormModal
                {...defaultProps}
                onClose={mockOnClose}
            />
        );

        const wrapper = screen.getByTestId('modal-wrapper');

        // Simulate click outside the modal
        fireEvent.click(wrapper);

        // Should not close modal as it's a form modal
        expect(mockOnClose).not.toHaveBeenCalled();
    });

    test('applies correct visibility classes when visible', () => {
        render(<FormModal {...defaultProps} isVisible={true} />);

        const wrapper = screen.getByTestId('modal-wrapper');
        expect(wrapper).toHaveClass('visible');
        expect(wrapper).not.toHaveClass('invisible');
    });

    test('applies correct visibility classes when not visible', () => {
        render(<FormModal {...defaultProps} isVisible={false} />);

        const wrapper = screen.getByTestId('modal-wrapper');
        expect(wrapper).toHaveClass('invisible');
        expect(wrapper).not.toHaveClass('visible');
    });

    test('calls onClearForm and onClose when pressing Escape key', () => {
        const mockOnClose = jest.fn();
        const mockOnClearForm = jest.fn();

        render(
            <FormModal
                {...defaultProps}
                onClose={mockOnClose}
                onClearForm={mockOnClearForm}
            />
        );

        // Simulasi menekan tombol Escape
        fireEvent.keyDown(document, { key: 'Escape' });

        // Verifikasi kedua fungsi dipanggil
        expect(mockOnClearForm).toHaveBeenCalledTimes(1);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('calls only onClose when pressing Escape key and onClearForm is not provided', () => {
        const mockOnClose = jest.fn();

        // Secara eksplisit set onClearForm menjadi undefined
        const props = {
            ...defaultProps,
            onClose: mockOnClose,
            onClearForm: undefined
        };

        render(<FormModal {...props} />);

        // Simulasi menekan tombol Escape
        fireEvent.keyDown(document, { key: 'Escape' });

        // Verifikasi hanya onClose yang dipanggil
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
});