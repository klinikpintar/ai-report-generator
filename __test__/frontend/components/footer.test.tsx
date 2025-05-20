import { render, screen } from '@testing-library/react';
import Footer from '@frontend/components/footer';

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

describe('Footer Component', () => {
  beforeEach(() => {
    render(<Footer />);
  });

  it('renders the Klinik Pintar logo', () => {
    const logoImage = screen.getByTestId('mock-image');
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', '/logo-kp.png');
    expect(logoImage).toHaveAttribute('alt', 'Klinik Pintar Logo');
  });

  it('renders the Researcher section with correct content', () => {
    const researcherHeading = screen.getByText('Researcher');
    expect(researcherHeading).toBeInTheDocument();
    
    const researcherName = screen.getByText('Kak Suryo');
    expect(researcherName).toBeInTheDocument();
  });

  it('renders the Developers section with heading', () => {
    const developersHeading = screen.getByText('Developers');
    expect(developersHeading).toBeInTheDocument();
  });

  it('renders all developer names correctly', () => {
    // First column
    expect(screen.getByText('Adrian Aryaputra Hamzah')).toBeInTheDocument();
    expect(screen.getByText('Ilham Abdillah Alhamdi')).toBeInTheDocument();
    expect(screen.getByText('Virgillia Yeala Prabowo')).toBeInTheDocument();
    expect(screen.getByText('Muhammad Yusuf Haikal')).toBeInTheDocument();
    
    // Second column
    expect(screen.getByText('Restu Ahmad Ar Ridho')).toBeInTheDocument();
    expect(screen.getByText('Lucinda Laurent')).toBeInTheDocument();
    expect(screen.getByText('Muhammad Rafi Zia Ulhaq')).toBeInTheDocument();
  });

  it('has the proper styling classes on the main footer element', () => {
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveClass('bg-white');
    expect(footer).toHaveClass('border-t-2');
    expect(footer).toHaveClass('border-teal-7');
  });
  
  // Fix for "renders the layout container with proper styling" test
it('renders the layout container with proper styling', () => {
    // Get the footer element first
    const footer = screen.getByRole('contentinfo');
    // Then check the main container div inside footer
    const mainContainer = footer.querySelector('div');
    expect(mainContainer).toHaveClass('max-w-6xl');
    expect(mainContainer).toHaveClass('mx-auto');
    expect(mainContainer).toHaveClass('flex');
  });
  
  // Fix for "renders responsive design elements correctly" test
  it('renders responsive design elements correctly', () => {
    // Test that responsive classes are applied correctly
    const footer = screen.getByRole('contentinfo');
    const logoDiv = footer.querySelector('div > div:first-child');
    expect(logoDiv).toHaveClass('mb-6');
    expect(logoDiv).toHaveClass('md:mb-0');
    
    // The issue is in how we're selecting the developers grid
    // The structure is likely different than what we expected
    // Let's select it more directly by looking for the grid within the developers section
    const developersSection = screen.getByText('Developers').closest('div');
    const developersGrid = developersSection?.querySelector('.grid');
    
    // Make sure the element exists before asserting classes
    expect(developersGrid).not.toBeNull();
    expect(developersGrid).toHaveClass('grid-cols-1');
    expect(developersGrid).toHaveClass('md:grid-cols-2');
  });
});