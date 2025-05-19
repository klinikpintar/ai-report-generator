import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminDashboardPage from '@/app/(frontend)/admin/page';
import '@testing-library/jest-dom';

// Mock komponen yang digunakan dalam AdminDashboardPage
jest.mock('@frontend/admin/schema', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="schema-module">Schema Module</div>,
  };
});

jest.mock('@frontend/admin/manage-user/sections/manageUserSection', () => {
  return {
    ManageUserSection: () => <div data-testid="manage-user-section">Manage User Section</div>,
  };
});

jest.mock('@/app/(frontend)/admin/service', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="service-module">Service Module</div>,
  };
});

jest.mock('@frontend/admin/shortcut', () => {
  return {
    __esModule: true,
    default: ({ onShortcutClick }: { onShortcutClick: (section: "config" | "schema") => void }) => (
      <div data-testid="shortcut-component">
        <button 
          data-testid="config-shortcut"
          onClick={() => onShortcutClick('config')}
        >
          Go to Config
        </button>
        <button 
          data-testid="schema-shortcut"
          onClick={() => onShortcutClick('schema')}
        >
          Go to Schema
        </button>
      </div>
    ),
  };
});

jest.mock('@/app/(frontend)/admin/manage-ai', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="manage-ai-module">Manage AI Module</div>,
  };
});

// Mock Element.scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all components correctly', () => {
    // Arrange & Act
    render(<AdminDashboardPage />);

    // Assert
    expect(screen.getByTestId('shortcut-component')).toBeInTheDocument();
    expect(screen.getByTestId('manage-user-section')).toBeInTheDocument();
    expect(screen.getByTestId('manage-ai-module')).toBeInTheDocument();
    expect(screen.getByTestId('service-module')).toBeInTheDocument();
    expect(screen.getByTestId('schema-module')).toBeInTheDocument();
  });

  it('scrolls to config section when config shortcut is clicked', () => {
    // Arrange
    render(<AdminDashboardPage />);
    
    // Act
    fireEvent.click(screen.getByTestId('config-shortcut'));
    
    // Assert
    const scrollSpy = jest.spyOn(Element.prototype, 'scrollIntoView');
    expect(scrollSpy).toHaveBeenCalledTimes(1);
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('scrolls to schema section when schema shortcut is clicked', () => {
    // Arrange
    render(<AdminDashboardPage />);
    
    // Act
    fireEvent.click(screen.getByTestId('schema-shortcut'));
    
    // Assert
    const scrollSpy = jest.spyOn(Element.prototype, 'scrollIntoView');
    expect(scrollSpy).toHaveBeenCalledTimes(1);
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('creates refs for config and schema sections', () => {
    // Arrange & Act
    const { container } = render(<AdminDashboardPage />);
    
    // Assert
    // Verifikasi bahwa ref diberikan ke div dengan class yang benar
    const configDiv = container.querySelector('div[class="mt-12 "]');
    expect(configDiv).toBeInTheDocument();
    
    const schemaDiv = container.querySelector('div[class="mt-12"]');
    expect(schemaDiv).toBeInTheDocument();
  });
});