import { render, screen, fireEvent } from '@testing-library/react';
import Shortcut from '@frontend/admin/shortcut/index';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img 
      src={props.src} 
      width={props.width} 
      height={props.height} 
      alt={props.alt} 
      data-testid="mock-image"
    />;
  },
}));

describe('Shortcut Component', () => {
  // Mock the onShortcutClick prop
  const mockOnShortcutClick = jest.fn();

  beforeEach(() => {
    render(<Shortcut onShortcutClick={mockOnShortcutClick} />);
    // Clear the mock before each test
    mockOnShortcutClick.mockClear();
  });

  it('renders the title and description correctly', () => {
    // Check title
    const title = screen.getByText('AI Report Generation System');
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('text-2xl');
    expect(title).toHaveClass('font-bold');
    expect(title).toHaveClass('text-blue-6');

    // Check description
    const description = screen.getByText(/Analisis skema database secara otomatis menggunakan AI/i);
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('text-sm');
    expect(description).toHaveClass('text-gray-700');
  });

  it('renders both shortcut buttons with correct text', () => {
    // First button
    const configButton = screen.getByText('Konfigurasi AI untuk Generasi Laporan Otomatis');
    expect(configButton).toBeInTheDocument();
    expect(configButton.tagName.toLowerCase()).toBe('p');
    expect(configButton.parentElement?.tagName.toLowerCase()).toBe('button');

    // Second button
    const schemaButton = screen.getByText('Kelola Skema Database untuk Optimasi Laporan');
    expect(schemaButton).toBeInTheDocument();
    expect(schemaButton.tagName.toLowerCase()).toBe('p');
    expect(schemaButton.parentElement?.tagName.toLowerCase()).toBe('button');
  });

  it('renders arrow icons in each button', () => {
    // Get all arrow icons
    const arrowIcons = screen.getAllByTestId('mock-image');
    expect(arrowIcons).toHaveLength(2);
    
    // Check attributes
    arrowIcons.forEach(icon => {
      expect(icon).toHaveAttribute('src', '/icon-arrow-down.svg');
      expect(icon).toHaveAttribute('alt', 'Arrow Icon');
      expect(icon).toHaveAttribute('width', '24');
      expect(icon).toHaveAttribute('height', '24');
    });
  });

  it('calls onShortcutClick with "config" when config button is clicked', () => {
    const configButton = screen.getByText('Konfigurasi AI untuk Generasi Laporan Otomatis').parentElement;
    expect(configButton).not.toBeNull();
    
    fireEvent.click(configButton!);
    expect(mockOnShortcutClick).toHaveBeenCalledTimes(1);
    expect(mockOnShortcutClick).toHaveBeenCalledWith('config');
  });

  it('calls onShortcutClick with "schema" when schema button is clicked', () => {
    const schemaButton = screen.getByText('Kelola Skema Database untuk Optimasi Laporan').parentElement;
    expect(schemaButton).not.toBeNull();
    
    fireEvent.click(schemaButton!);
    expect(mockOnShortcutClick).toHaveBeenCalledTimes(1);
    expect(mockOnShortcutClick).toHaveBeenCalledWith('schema');
  });

  it('renders with correct layout structure', () => {
    // Main container div with flex layout
    const section = document.querySelector('section');
    const mainDiv = section?.firstChild;
    expect(mainDiv).toHaveClass('flex');
    expect(mainDiv).toHaveClass('flex-col');
    expect(mainDiv).toHaveClass('sm:flex-row');
    expect(mainDiv).toHaveClass('border-b-2');
    expect(mainDiv).toHaveClass('border-teal-7');
    
    // Buttons container
    const buttonsContainer = screen.getAllByRole('button')[0].parentElement;
    expect(buttonsContainer).toHaveClass('flex');
    expect(buttonsContainer).toHaveClass('gap-10');
  });

  it('renders with correct container styling', () => {
    // Use the section element directly instead of by role
    const section = document.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('container');
    expect(section).toHaveClass('mx-auto');
    expect(section).toHaveClass('max-w-screen-xl');
    expect(section).toHaveClass('px-8');
  });
});