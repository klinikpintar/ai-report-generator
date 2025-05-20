import React, { Suspense } from 'react';
import { render, screen } from '@testing-library/react';
import Layout from '@/app/(frontend)/admin/layout';
import '@testing-library/jest-dom';

// Mock komponenen yang digunakan oleh Layout
jest.mock('@frontend/components/navbar', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="mock-navbar">Navbar</div>,
  };
});

jest.mock('@frontend/components/footer', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="mock-footer">Footer</div>,
  };
});

// Mock Suspense untuk menghindari error "act" warnings
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    Suspense: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe('Admin Layout', () => {
  it('renders the layout with navbar, children, and footer', () => {
    // Arrange & Act
    render(
      <Layout>
        <div data-testid="test-children">Test Content</div>
      </Layout>
    );

    // Assert
    // Cek apakah navbar muncul
    const navbar = screen.getByTestId('mock-navbar');
    expect(navbar).toBeInTheDocument();

    // Cek apakah children muncul
    const children = screen.getByTestId('test-children');
    expect(children).toBeInTheDocument();
    expect(children).toHaveTextContent('Test Content');

    // Cek apakah footer muncul
    const footer = screen.getByTestId('mock-footer');
    expect(footer).toBeInTheDocument();

    // Cek apakah struktur container sesuai yang diharapkan
    const container = screen.getByTestId('test-children').parentElement;
    expect(container).toHaveClass('min-h-screen');
    expect(container).toHaveClass('flex');
    expect(container).toHaveClass('flex-col');
    expect(container).toHaveClass('bg-white');
    expect(container).toHaveClass('overflow-y-auto');
  });
});