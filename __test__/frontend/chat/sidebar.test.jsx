import React from 'react';
import { render, screen } from "@testing-library/react";
import Sidebar from "@frontend/(chat)/components/sidebar";

// Mock the session context
jest.mock("@frontend/(chat)/context/sessionContext", () => ({
  useSession: () => ({
    sessions: [
      {
        id: '1',
        title: 'Test Chat 1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    activeSessionId: '1',
    isLoading: false,
    error: null,
    setActiveSessionId: jest.fn(),
    createNewSession: jest.fn().mockResolvedValue('new-id'),
    refreshSessions: jest.fn()
  }),
  SessionProvider: ({ children }) => <div>{children}</div>
}));

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/',
}));

describe("Sidebar Component", () => {
  it("should render menu items", () => {
    render(<Sidebar />);
    
    expect(screen.getByText(/New Chat/i)).toBeInTheDocument();
    expect(screen.getByText(/Recent/i)).toBeInTheDocument();
  });
});
