import React from 'react';
import { render, screen } from '@testing-library/react';
import { HeaderSection } from '@/app/(frontend)/components/header-section';
import '@testing-library/jest-dom';

describe('HeaderSection Component', () => {
  const mockProps = {
    title: 'Section Title',
    subtitle: 'Main Heading',
    description: 'This is a detailed description of the section.'
  };

  it('renders with left alignment by default', () => {
    // Arrange & Act
    render(<HeaderSection {...mockProps} />);
    
    // Assert
    const container = screen.getByText(mockProps.title).closest('div');
    expect(container).toHaveClass('text-left');
    expect(container).toHaveClass('md:w-3/5');
    expect(container).not.toHaveClass('text-center');
    
    // Check content rendering
    expect(screen.getByText(mockProps.title)).toBeInTheDocument();
    expect(screen.getByText(mockProps.subtitle)).toBeInTheDocument();
    expect(screen.getByText(mockProps.description)).toBeInTheDocument();
  });

  it('renders with center alignment when specified', () => {
    // Arrange & Act
    render(<HeaderSection {...mockProps} align="center" />);
    
    // Assert
    const container = screen.getByText(mockProps.title).closest('div');
    expect(container).toHaveClass('text-center');
    expect(container).toHaveClass('px-6');
    expect(container).toHaveClass('md:px-7');
    expect(container).toHaveClass('mx-auto');
    expect(container).not.toHaveClass('text-left');
    expect(container).not.toHaveClass('md:w-3/5');
  });

  it('applies correct styling to title, subtitle and description', () => {
    // Arrange & Act
    render(<HeaderSection {...mockProps} />);
    
    // Assert
    // Check title styling
    const title = screen.getByText(mockProps.title);
    expect(title).toHaveClass('font-semibold');
    expect(title).toHaveClass('text-lg');
    expect(title).toHaveClass('text-gray-600');
    
    // Check subtitle styling
    const subtitle = screen.getByText(mockProps.subtitle);
    expect(subtitle).toHaveClass('text-[#00B0EB]');
    expect(subtitle).toHaveClass('font-bold');
    expect(subtitle).toHaveClass('text-3xl');
    expect(subtitle).toHaveClass('mt-2');
    
    // Check description styling
    const description = screen.getByText(mockProps.description);
    expect(description).toHaveClass('mt-4');
    expect(description).toHaveClass('text-gray-800');
  });
  
  it('has max-width constraint', () => {
    // Arrange & Act
    render(<HeaderSection {...mockProps} />);
    
    // Assert
    const container = screen.getByText(mockProps.title).closest('div');
    expect(container).toHaveClass('max-w-3xl');
  });
});