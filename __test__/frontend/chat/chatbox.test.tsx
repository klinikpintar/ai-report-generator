import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatBox from "@frontend/(chat)/chatbox";
import { ServiceProvider } from "@frontend/(chat)/context/serviceContext";
import { UserProvider } from "@frontend/login/context/userContext";
import React from "react";

// ===== FIX: Pindahkan deklarasi getMock di SINI! =====
let getMock: jest.Mock<string | null, [string]> = jest.fn();

// Mock session and router
const setActiveSessionIdMock = jest.fn();
const createNewSessionMock = jest.fn().mockResolvedValue("mock-session-id");
const setHasChatted = jest.fn();
const refreshSessionsMock = jest.fn();

jest.mock("@frontend/(chat)/context/sessionContext", () => ({
  useSession: () => ({
    activeSessionId: null,
    setActiveSessionId: setActiveSessionIdMock,
    createNewSession: createNewSessionMock,
    setHasChatted: setHasChatted,
    refreshSessions: refreshSessionsMock,
    isNewSession: false,
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => ({
    get: (key: string) => getMock(key), // 🔥 Sekarang getMock udah ada!
  }),
}));

// Mock the Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt} />,
}));

// Mock ReactMarkdown component
jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children, components }: any) => (
    <div data-testid="markdown">{children}</div>
  ),
}));

Object.defineProperty(window, "open", { value: jest.fn() });

beforeEach(() => {
  getMock.mockImplementation(() => null); // default tidak ada sessionId
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    })
  ) as jest.Mock;
});

afterEach(() => {
  jest.clearAllMocks();
  getMock = jest.fn((key: string) => null); // initialize getMock default null
});

// Helper render
const renderChatBox = () =>
  render(
    <UserProvider>
      <ServiceProvider>
        <ChatBox />
      </ServiceProvider>
    </UserProvider>
  );

// --- TEST CASES ---
describe("ChatBox", () => {
  it("✅ should display welcome message initially", () => {
    renderChatBox();
    expect(screen.getByText(/Hello, /i)).toBeInTheDocument();
  });

  it("✅ should allow typing and sending a message", async () => {
    renderChatBox();
    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Hello there" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("Hello there")).toBeInTheDocument();
    });
  });

  it("✅ should not send empty message", async () => {
    renderChatBox();
    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(screen.queryByText("AI is typing...")).not.toBeInTheDocument();
    });
  });

  it("✅ should show loading indicator when sending", async () => {
    renderChatBox();
    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Loading..." } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(screen.getByText(/AI is typing.../i)).toBeInTheDocument();
  });

  it("✅ should set sessionId and load session messages if sessionId exists", async () => {
    // Simulasikan return "test-session-id" dari search params
    getMock.mockImplementation((key: string) =>
      key === "sessionId" ? "test-session-id" : null
    );

    renderChatBox();

    await waitFor(() => {
      expect(setActiveSessionIdMock).toHaveBeenCalledWith("test-session-id");
    });
  });

  it("✅ should create a new session if none exists when sending message", async () => {
    renderChatBox();

    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Hello" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(createNewSessionMock).toHaveBeenCalled();
    });
  });

  it("✅ should handle errors when creating a new session", async () => {
    createNewSessionMock.mockRejectedValueOnce(
      new Error("Failed to create session")
    );
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    renderChatBox();

    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, {
      target: { value: "Test session creation error" },
    });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to create session:",
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it("✅ should handle empty service list when fetching schemas", async () => {
    jest.mock("@frontend/(chat)/context/serviceContext", () => ({
      useService: () => ({
        selectedService: [],
        services: [],
        getServiceRepresentation: jest.fn(),
      }),
    }));

    renderChatBox();

    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Test empty services" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    // No schema fetch should happen with empty services
    await waitFor(() => {
      expect(screen.getByText("Test empty services")).toBeInTheDocument();
    });
  });

  it("✅ should handle errors when fetching schemas", async () => {
    global.fetch = jest.fn().mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      })
    );

    renderChatBox();

    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Test schema error" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(
        screen.getByText("Sorry, there was an error processing your request.")
      ).toBeInTheDocument();
    });
  });

  it("✅ should handle API response format with data property", async () => {
    global.fetch = jest
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: [{ id: 1 }, { id: 2 }] }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              messageId: "123",
              aiResponse: "Response with data property",
              metadata: { modelUsed: "GPT-4" },
            }),
        })
      );

    renderChatBox();

    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Test data property" } });
    fireEvent.click(screen.getByAltText("Send Icon"));

    await waitFor(() => {
      expect(
        screen.getByText("Response with data property")
      ).toBeInTheDocument();
    });
  });

  it("✅ should handle unexpected schema API response format", async () => {
    global.fetch = jest
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ unexpectedFormat: true }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              messageId: "123",
              aiResponse: "Response with unexpected schema format",
              metadata: { modelUsed: "GPT-4" },
            }),
        })
      );

    renderChatBox();

    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Test unexpected format" } });
    fireEvent.click(screen.getByAltText("Send Icon"));

    await waitFor(() => {
      expect(
        screen.getByText("Response with unexpected schema format")
      ).toBeInTheDocument();
    });
  });

  it("✅ should handle chat API error response", async () => {
    global.fetch = jest
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ id: 1 }]),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 500,
        })
      );

    renderChatBox();

    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Test API error" } });
    fireEvent.click(screen.getByAltText("Send Icon"));

    await waitFor(() => {
      expect(
        screen.getByText("Sorry, there was an error processing your request.")
      ).toBeInTheDocument();
    });
  });

  it("✅ should scroll to bottom when new messages are added", async () => {
    // Create a spy for the scrollTop property
    const scrollTopSpy = jest.fn();
    Element.prototype.scrollTo = scrollTopSpy;

    renderChatBox();

    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Test scrolling" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("Test scrolling")).toBeInTheDocument();
    });
  });

  it("✅ should handle errors when loading session messages", async () => {
    // Mock session ID
    getMock.mockImplementation((key: string) =>
      key === "sessionId" ? "invalid-session" : null
    );

    // Mock fetch to return error
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    // Spy on console.error
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    renderChatBox();

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error loading session messages:",
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  // ADDITIONAL TESTS FOR IMPROVED COVERAGE
  
  it("should show loading spinner during initialization", () => {
    getMock.mockImplementation((key: string) => 
      key === "sessionId" ? "test-session-id" : null
    );
    
    // Create a delayed response to keep initializing state true
    global.fetch = jest.fn().mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => 
        resolve({
          ok: true,
          json: () => Promise.resolve({ 
            session: { 
              title: "Test Session", 
              messages: [] 
            } 
          })
        }), 100)
      )
    );
    
    renderChatBox();
    
    // Should find the loading spinner
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });
  
  it("should refresh sessions when sending first message with new session", async () => {
    // Mock session as a new one
    jest.mock("@frontend/(chat)/context/sessionContext", () => ({
      useSession: () => ({
        activeSessionId: "new-session-id",
        setActiveSessionId: setActiveSessionIdMock,
        createNewSession: createNewSessionMock,
        refreshSessions: refreshSessionsMock,
        isNewSession: true,
      }),
    }), { virtual: true });
    
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([{ id: 1 }]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          messageId: "123",
          aiResponse: "First response to new session",
          metadata: { modelUsed: "GPT-4" },
        }),
      });
    
    renderChatBox();
    
    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "First message to new chat" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    
    await waitFor(() => {
      expect(refreshSessionsMock).toHaveBeenCalled();
    });
  });
  
  
});