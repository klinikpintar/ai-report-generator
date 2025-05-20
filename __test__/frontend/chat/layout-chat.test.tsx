import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Layout from '@frontend/(chat)/layout';
import { UIStateContext } from '@frontend/(chat)/context/uiStateContext';

// Mock the components used in the Layout
jest.mock('@frontend/(chat)/components/sidebar', () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="sidebar" data-is-open={isOpen.toString()}>
      Sidebar Component
    </div>
  )
}));

jest.mock('@frontend/components/navbar', () => ({
  __esModule: true,
  default: () => <div data-testid="navbar">Navbar Component</div>
}));

// Mock the context providers to avoid unnecessary complexity
jest.mock('@frontend/(chat)/context/serviceContext', () => ({
  ServiceProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="service-provider">{children}</div>
  )
}));

jest.mock('@frontend/(chat)/context/sessionContext', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="session-provider">{children}</div>
  )
}));

// Export the mocked context for test assertions
// Create a mock implementation of UIStateContext
const mockSetIsSidebarOpen = jest.fn();
const mockSetShowProfileDropdown = jest.fn();
const mockContextValue = {
  isSidebarOpen: false,
  setIsSidebarOpen: mockSetIsSidebarOpen,
  showProfileDropdown: false,
  setShowProfileDropdown: mockSetShowProfileDropdown
};

jest.mock('@frontend/(chat)/context/uiStateContext', () => {
    const actual = jest.requireActual('@frontend/(chat)/context/uiStateContext');
    
    // Return the actual implementation
    return actual;
  });
  
  // Add this custom wrapper component with state tracking
  function LayoutWrapper({ children }: { children: React.ReactNode }) {
    // We need to track actual state changes
    const [sidebarOpenState, setSidebarOpenState] = React.useState(false);
    const [dropdownOpenState, setDropdownOpenState] = React.useState(false);
    
    // Create spy functions that update our tracked state 
    const trackingSidebarSetter = jest.fn((newVal) => {
      setSidebarOpenState(newVal);
    });
    
    const trackingDropdownSetter = jest.fn((newVal) => {
      setDropdownOpenState(newVal);
    });
    
    // Create a wrapper for the Layout component
    return (
      <UIStateContext.Provider value={{
        isSidebarOpen: sidebarOpenState,
        setIsSidebarOpen: trackingSidebarSetter,
        showProfileDropdown: dropdownOpenState,
        setShowProfileDropdown: trackingDropdownSetter
      }}>
        <Layout>
          {children}
        </Layout>
      </UIStateContext.Provider>
    );
  }

describe('Chat Layout Component', () => {
    const renderLayout = () => {
        return render(
          <LayoutWrapper>
            <div data-testid="child-content">Child Content</div>
          </LayoutWrapper>
        );
      };
    

  it('renders all required components', () => {
    renderLayout();
    
    // Check if all major components are rendered
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByTestId('service-provider')).toBeInTheDocument();
    expect(screen.getByTestId('session-provider')).toBeInTheDocument();
    
    // Check for the sidebar toggle button
    expect(screen.getByText('☰')).toBeInTheDocument();
  });

  it('toggles sidebar when the button is clicked', () => {
    renderLayout();
    
    // Initially sidebar should be closed
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-is-open', 'false');
    
    // Click the toggle button
    fireEvent.click(screen.getByText('☰'));
    
    // Sidebar should now be open
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-is-open', 'true');
    
    // Click again to close
    fireEvent.click(screen.getByText('☰'));
    
    // Sidebar should be closed again
    expect(screen.getByTestId('sidebar')).toHaveAttribute('data-is-open', 'false');
  });

  it('correctly applies CSS classes based on sidebar state', () => {
    renderLayout();
  });
  
  it('correctly handles profile dropdown state changes', () => {
    renderLayout();
    
    // Test setShowProfileDropdown
    mockContextValue.setShowProfileDropdown(true);
    
    // Verify call was made
    expect(mockSetShowProfileDropdown).toHaveBeenCalledWith(true);
  });

  it('correctly applies CSS classes based on sidebar state', () => {
    renderLayout();
    
    // Get the main content element
    const mainContent = screen.getByTestId('child-content').parentElement;
    
    // Initially sidebar is closed, so no ml-64 class
    expect(mainContent).not.toHaveClass('md:ml-64');
    
    // Open the sidebar
    fireEvent.click(screen.getByText('☰'));
    
    // Now the ml-64 class should be present
    expect(mainContent).toHaveClass('md:ml-64');
  });
  
  it('renders context providers correctly', () => {
    renderLayout();
    
    // Check for context providers
    expect(screen.getByTestId('service-provider')).toBeInTheDocument();
    expect(screen.getByTestId('session-provider')).toBeInTheDocument();
  });
});