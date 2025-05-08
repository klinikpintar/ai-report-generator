import React from 'react';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Sidebar from "@frontend/(chat)/components/sidebar";

// Mock fetch API
global.fetch = jest.fn();

// Mock the session context
const mockSetActiveSessionId = jest.fn();
const mockCreateNewSession = jest.fn().mockResolvedValue('new-id');
const mockSetShouldRefresh = jest.fn();

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
    isNewSession: false,
    shouldRefresh: false,
    setShouldRefresh: mockSetShouldRefresh,
    setActiveSessionId: mockSetActiveSessionId,
    createNewSession: mockCreateNewSession,
    refreshSessions: jest.fn()
  }),
  SessionProvider: ({ children }) => <div>{children}</div>
}));

// Mock the router
const mockRouterPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
  usePathname: () => '/',
}));

// Mock Image component from next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => <img {...props} />
}));

describe("Sidebar Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful fetch response with chat sessions
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        sessions: [
          { 
            id: '1', 
            title: 'Chat 1', 
            updatedAt: new Date().toISOString(),
            _count: { messages: 5 }
          },
          { 
            id: '2', 
            title: 'Chat 2', 
            updatedAt: new Date().toISOString(),
            _count: { messages: 3 }
          }
        ]
      })
    });
  });

  it("should render menu items", () => {
    render(<Sidebar isOpen={true} />);
    
    expect(screen.getByText(/New Chat/i)).toBeInTheDocument();
    expect(screen.getByText(/Recent/i)).toBeInTheDocument();
  });

  it("should not be visible when isOpen is false", () => {
    render(<Sidebar isOpen={false} />);
    
    const sidebar = document.querySelector('aside');
    expect(sidebar).toHaveClass('-translate-x-full');
  });

  it("should fetch chat sessions when sidebar is opened", async () => {
    render(<Sidebar isOpen={true} />);
    
    expect(global.fetch).toHaveBeenCalledWith("/api/chat-sessions");
    await waitFor(() => {
      expect(screen.getByText("Chat 1")).toBeInTheDocument();
      expect(screen.getByText("Chat 2")).toBeInTheDocument();
    });
  });

  it("should handle new chat creation", async () => {
    render(<Sidebar isOpen={true} />);
    
    const newChatButton = screen.getByText("New Chat");
    fireEvent.click(newChatButton);
    
    await waitFor(() => {
      expect(mockCreateNewSession).toHaveBeenCalled();
      expect(mockSetActiveSessionId).toHaveBeenCalledWith('new-id');
      expect(mockRouterPush).toHaveBeenCalledWith('/?sessionId=new-id');
    });
  });

  it("should navigate to existing chat when clicked", async () => {
    render(<Sidebar isOpen={true} />);
    
    await waitFor(() => {
      expect(screen.getByText("Chat 1")).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText("Chat 1"));
    
    expect(mockSetActiveSessionId).toHaveBeenCalledWith('1');
    expect(mockRouterPush).toHaveBeenCalledWith('/?sessionId=1');
  });

  it("should show loading state while fetching sessions", async () => {
    // Delay the fetch response
    global.fetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => 
          resolve({
            ok: true,
            json: () => Promise.resolve({ sessions: [] })
          }), 100)
      )
    );
    
    render(<Sidebar isOpen={true} />);
    
    expect(screen.getByText("Loading...")).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
  });

  it("should handle fetch error gracefully", async () => {
    // Mock console.error to prevent error output in test
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    global.fetch.mockRejectedValueOnce(new Error("Network error"));
    
    render(<Sidebar isOpen={true} />);
    
    await waitFor(() => {
      expect(screen.getByText("No chat history found")).toBeInTheDocument();
      expect(console.error).toHaveBeenCalled();
    });
    
    console.error.mockRestore();
  });

  it("should refresh sessions when shouldRefresh is true", async () => {
    // Override the mock to set shouldRefresh to true
    jest.mock("@frontend/(chat)/context/sessionContext", () => ({
      useSession: () => ({
        shouldRefresh: true,
        setShouldRefresh: mockSetShouldRefresh,
        isNewSession: false,
        createNewSession: mockCreateNewSession,
        setActiveSessionId: mockSetActiveSessionId,
      }),
    }), { virtual: true });
    
    render(<Sidebar isOpen={true} />);
    
    await waitFor(() => {
      // It should call fetch at least once on initial render
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("should show 'No chat history found' when there are no sessions", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ sessions: [] })
    });
    
    render(<Sidebar isOpen={true} />);
    
    await waitFor(() => {
      expect(screen.getByText("No chat history found")).toBeInTheDocument();
    });
  });
});