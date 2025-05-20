import React from 'react';
import { render, screen } from '@testing-library/react';
import Layout from '@frontend/admin/manage-user/layout';
import '@testing-library/jest-dom';

// Mock dependencies
jest.mock('@frontend/components/navbar', () => {
  return function MockNavbar() {
    return <div data-testid="mock-navbar">Navbar Mock</div>;
  };
});

describe('Admin Manage User Layout', () => {
  it('should render navbar and children content', () => {
    render(
      <Layout>
        <div data-testid="child-content">Test Content</div>
      </Layout>
    );

    // Verify navbar is rendered
    expect(screen.getByTestId('mock-navbar')).toBeInTheDocument();

    // Verify children are rendered
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});