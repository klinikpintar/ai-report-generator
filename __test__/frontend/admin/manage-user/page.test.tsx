import React from 'react';
import { render, screen } from '@testing-library/react';
import ManageUserPage from '@frontend/admin/manage-user/page';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('@frontend/admin/manage-user/sections/userManagementSection', () => {
  return {
    UserManagementSection: function MockUserManagementSection() {
      return <div data-testid="mock-user-management">User Management Section</div>;
    }
  };
});

jest.mock('@frontend/admin/manage-user/sections/userTableSection', () => {
  return {
    UserTableSection: function MockUserTableSection() {
      return <div data-testid="mock-user-table">User Table Section</div>;
    }
  };
});

// Mock the context provider
jest.mock('@frontend/admin/manage-user/context/UserTableContext', () => {
  return {
    UserTableProvider: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="mock-context-provider">{children}</div>
    )
  };
});

describe('Admin Manage User Page', () => {
  it('should render with UserTableProvider context', () => {
    render(<ManageUserPage />);

    expect(screen.getByTestId('mock-context-provider')).toBeInTheDocument();
  });

  it('should render UserManagementSection component', () => {
    render(<ManageUserPage />);

    expect(screen.getByTestId('mock-user-management')).toBeInTheDocument();
    expect(screen.getByText('User Management Section')).toBeInTheDocument();
  });

  it('should render UserTableSection component', () => {
    render(<ManageUserPage />);

    expect(screen.getByTestId('mock-user-table')).toBeInTheDocument();
    expect(screen.getByText('User Table Section')).toBeInTheDocument();
  });

  it('should render components in correct order', () => {
    render(<ManageUserPage />);

    // Get all elements
    const management = screen.getByTestId('mock-user-management');
    const table = screen.getByTestId('mock-user-table');

    // UserManagementSection should come before UserTableSection in the DOM
    expect(management.compareDocumentPosition(table)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});