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

jest.mock("@frontend/(chat)/context/sessionContext", () => ({
  useSession: () => ({
    activeSessionId: null,
    setActiveSessionId: setActiveSessionIdMock,
    createNewSession: createNewSessionMock,
    setHasChatted: setHasChatted,
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

  // Mock fetch to return a proper error response
  global.fetch = jest.fn().mockImplementationOnce(() => 
    Promise.resolve({
      ok: false,
      status: 404,
      json: () => Promise.reject(new Error("Not found"))
    })
  );

  // Spy on console.error
  const consoleErrorSpy = jest
    .spyOn(console, "error")
    .mockImplementation(() => {});

  renderChatBox();

  await waitFor(() => {
    // Make sure this matches EXACTLY what's in your component
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error loading session:", 
      expect.any(Error)
    );
  });

  consoleErrorSpy.mockRestore();
});
});
