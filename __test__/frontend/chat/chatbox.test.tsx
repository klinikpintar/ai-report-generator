import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatBox from "@frontend/(chat)/chatbox";
import { ServiceProvider } from "@frontend/(chat)/context/serviceContext";
import { ReactNode } from "react";
import { Schema, Service } from "@frontend/common/types";
import React from "react";

// **Mock react-markdown agar tidak memicu error ESM**
// eslint-disable-next-line react/display-name
jest.mock("react-markdown", () => (props: React.PropsWithChildren) => <div>{props.children}</div>);
jest.mock("remark-gfm", () => jest.fn());
jest.mock("rehype-raw", () => jest.fn());

// Mock SessionContext
jest.mock("@frontend/(chat)/context/sessionContext", () => ({
  useSession: () => ({
    activeSessionId: null,
    setActiveSessionId: jest.fn(),
    createNewSession: jest.fn().mockResolvedValue("mock-session-id"),
    sessions: [],
    isLoading: false,
    error: null,
    refreshSessions: jest.fn()
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn()
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn((param) => {
      if (param === "sessionId") return null; // Changed from "id" to "sessionId"
      return null;
    })
  })),
  usePathname: jest.fn(() => "/chat")
}));

// Helper function for rendering with both providers
const renderWithServiceProvider = (children: ReactNode) => {
  const SessionProvider = require("@frontend/(chat)/context/sessionContext").SessionProvider;
  
  return render(
    <SessionProvider>
      <ServiceProvider>{children}</ServiceProvider>
    </SessionProvider>
  );
};

describe("ChatBox Component", () => {
  it("should display a welcome message before chatting", () => {
    renderWithServiceProvider(<ChatBox />);
    expect(screen.getByText("Hello, Virgillia Yeala !!")).toBeInTheDocument();
  });

  it("should remove welcome message after sending a chat", async () => {
    renderWithServiceProvider(<ChatBox />);
    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Hi there!" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(screen.queryByText("Hello, Virgillia Yeala !!")).not.toBeInTheDocument();
    });
  });

  it("should add user message to chat", async () => {
    renderWithServiceProvider(<ChatBox />);
    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Hi, how are you?" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("Hi, how are you?")).toBeInTheDocument();
    });
  });

  it("should not add a message when Enter is pressed with empty input", async () => {
    renderWithServiceProvider(<ChatBox />);
    const input = screen.getByPlaceholderText("Type a message...");

    // Pastikan tidak ada pesan sebelum pengujian dimulai
    expect(screen.queryByTestId("chat-message")).not.toBeInTheDocument();

    // Simulasikan menekan Enter saat input kosong
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    // Tunggu sebentar dan pastikan tidak ada pesan yang ditambahkan
    await waitFor(() => {
      expect(screen.queryByTestId("chat-message")).not.toBeInTheDocument();
    });
  });
});

describe("ChatBox API Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock for session message loading
    global.fetch = jest.fn().mockImplementation((url) => {
      // Handle session-related API calls
      if (url.includes('/api/chat-sessions/')) {
        if (url.endsWith('/messages')) {
          // Handle messages endpoint
          return Promise.resolve({
            ok: true,
            json: async () => ({
              messages: []
            })
          });
        } else {
          // Handle session details endpoint
          return Promise.resolve({
            ok: true,
            json: async () => ({
              session: {
                id: "mock-session-id",
                title: "Test Session",
                messages: []
              }
            })
          });
        }
      }
      
      // Let other fetch calls be handled by specific test implementations
      return Promise.resolve({
        ok: true,
        json: async () => ([])
      });
    });
  });

  const mockServices: Service[] = [
    { id: "1", name: "Reservasi", platformCode: "Postgresql", createdAt: "" },
    { id: "2", name: "Pendaftaran", platformCode: "Postgresql", createdAt: "" },
  ];
  const mockSchema: Schema = {
    id: 1,
    name: "pasien_portal",
    description: "",
    createdAt: "",
    schemaText: "",
    serviceId: "1",
    service: mockServices[0],
  };

  it("should receive response after send message without service selection", async () => {
    // Mocking the fetch response to /api/service
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockServices as Service[],
    });
    renderWithServiceProvider(<ChatBox />);

    // await for the service to be fetched (in the dropdown component)
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    // Mocking the fetch response to /api/chat
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        messageId: "1234",
        userPrompt: "Hello!",
        aiResponse: "How can I assist you?",
        createdAt: new Date().toISOString(),
        metadata: {
          finishReason: "stop",
          usage: { promptTokens: 5, completionTokens: 10 },
          modelUsed: "gemini",
          // Include these fields for session support
          sessionId: "mock-session-id"
        },
      }),
    });

    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Halo bisa bantu saya?" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });
    expect(fetch).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );

    const botResponse = await screen.findByText(/How can I assist you?/i);
    expect(botResponse).toBeInTheDocument();
  });

  it("should receive response after send message with service selection", async () => {
    // Mocking the fetch responses
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockServices as Service[], // Mock response for /api/service
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [mockSchema] as Schema[], // Mock response for /api/schema
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          messageId: "1234",
          userPrompt: "Hello!",
          aiResponse: "How can I assist you?",
          createdAt: new Date().toISOString(),
          metadata: {
            finishReason: "stop",
            usage: { promptTokens: 5, completionTokens: 10 },
            modelUsed: "gemini",
            schemaId: ["1"],
            schemaIncluded: true,
          },
        }), // Mock response for /api/chat
      });

    renderWithServiceProvider(<ChatBox />);

    // Wait for the initial service fetch
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    // Simulate selecting a service
    const serviceDropdown = screen.getByText(/Select a Service/i);
    fireEvent.click(serviceDropdown);
    const serviceOption = screen.getByText(/Reservasi/i);
    fireEvent.click(serviceOption);

    // Simulate typing and sending a message
    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Halo bisa bantu saya?" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    // Wait for both fetch calls to complete (schema GET + chat POST)
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(3); // Initial service fetch + schema fetch + chat POST
    });

    // Validate the first fetch call (schema GET) - Updated to match actual implementation
    expect(fetch).toHaveBeenNthCalledWith(2, "/api/schema?serviceIds=1");

    // Validate the second fetch call (chat POST)
    expect(fetch).toHaveBeenNthCalledWith(3, "/api/chat", expect.anything());
  });

  it("should handle API failure gracefully when querying without service selection", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
    });

    renderWithServiceProvider(<ChatBox />);
    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Hello!" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    const errorMessage = await screen.findByText(
      /Sorry, there was an error processing your request./i
    );
    expect(errorMessage).toBeInTheDocument();
  });

  it("should handle API failure gracefully when querying with service selection", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockServices as Service[], // Mock response for /api/service
      })
      .mockRejectedValueOnce({
        ok: false,
      });

    renderWithServiceProvider(<ChatBox />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    const serviceDropdown = screen.getByText(/Select a Service/i);
    fireEvent.click(serviceDropdown);
    const serviceOption = screen.getByText(/Reservasi/i);
    fireEvent.click(serviceOption);

    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Hello!" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    const errorMessage = await screen.findByText(
      /Sorry, there was an error processing your request./i
    );
    expect(errorMessage).toBeInTheDocument();
  });
});

describe("ChatBox Session Management", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });


  it("should handle errors when loading session messages", async () => {
    // Spy on console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock fetch to return error for session
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('/api/chat-sessions/')) {
        return Promise.resolve({
          ok: false,
          status: 404,
          json: async () => ({ error: "Session not found" })
        });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    // Mock searchParams to include sessionId
    require("next/navigation").useSearchParams.mockImplementation(() => ({
      get: jest.fn().mockReturnValue("invalid-session-id")
    }));

    renderWithServiceProvider(<ChatBox />);

    // Wait for the component to attempt to load session
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/chat-sessions/invalid-session-id");
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error loading session messages:", 
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  // Test for lines 72-100 (loadSessionMessages implementation)
  it("should load and format messages from a session", async () => {
    // Sample session data with messages
    const mockSessionData = {
      session: {
        id: "mock-session-id",
        title: "Test Session",
        messages: [
          { id: "msg1", content: "Hello", role: "user" },
          { id: "msg2", content: "Hi there!", role: "assistant", modelUsed: "gemini" },
          { id: "msg3", content: "How are you?", role: "user" }
        ]
      }
    };

    // Mock fetch to return session data
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('/api/chat-sessions/test-session')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockSessionData
        });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    // Mock searchParams to include sessionId
    require("next/navigation").useSearchParams.mockImplementation(() => ({
      get: jest.fn().mockReturnValue("test-session")
    }));

    renderWithServiceProvider(<ChatBox />);

    // Verify messages are loaded and formatted correctly
    await waitFor(() => {
      // User messages
      expect(screen.getByText("Hello")).toBeInTheDocument();
      expect(screen.getByText("How are you?")).toBeInTheDocument();
      
      // Assistant message
      expect(screen.getByText("Hi there!")).toBeInTheDocument();
      
      // Welcome message should be gone (hasChatted=true)
      expect(screen.queryByText("Hello, Virgillia Yeala !!")).not.toBeInTheDocument();
    });
  });

  // Test for loading spinner
  it("should show loading spinner when initializing", () => {
    // Create a modified version of ChatBox with forced initializing state
    const MockChatBox = () => {
      const [isInitializing] = React.useState(true);
      
      // Import the actual component - FIX THE PATH HERE
      const ActualChatBox = require("@frontend/(chat)/chatbox").default;
      
      // Monkey patch the useState to return our forced value
      const originalUseState = React.useState;
      React.useState = jest.fn().mockImplementation((init) => {
        // Only override the isInitializing state
        if (init === false && typeof init === 'boolean') {
          return [true, jest.fn()];
        }
        return originalUseState(init);
      });
      
      const result = <ActualChatBox />;
      
      // Restore original useState to prevent affecting other tests
      React.useState = originalUseState;
      
      return result;
    };
    
    renderWithServiceProvider(<MockChatBox />);
    
    // Check for loading spinner using data-testid if possible
    const spinnerElement = screen.queryByTestId('loading-spinner') || 
                           document.querySelector('.animate-spin');
    expect(spinnerElement).toBeInTheDocument();
  });

describe("ChatBox Message UI", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test for lines 263-308 (message UI rendering)
  it("should render user and assistant messages with correct styling", async () => {
    // Setup the component with mock messages
    renderWithServiceProvider(<ChatBox />);
    
    // Wait for messages to be rendered
    await waitFor(() => {
      // For user message
      const userBubble = screen.getByText("Hello").closest("div");
      expect(userBubble).toHaveClass("bg-[#E4F6FC]");
      expect(userBubble).toHaveClass("text-[#00B0EB]");
      
      // For AI message - go up two levels to get the styling div
      const aiText = screen.getByText("Hi there!");
      const aiBubble = aiText.parentElement; // Get the parent div with bg-gray-200
      expect(aiBubble).toHaveClass("bg-gray-200");
      expect(aiBubble).toHaveClass("text-black");
    });
  });

  it("should open export modal when download button is clicked", async () => {
    // Set up component
    renderWithServiceProvider(<ChatBox />);
    
    // Wait for any assistant message to be rendered
    await waitFor(() => {
      // Look for any AI message content
      const aiMessage = screen.getByText("Hi there!");
      expect(aiMessage).toBeInTheDocument();
    });
    
    // Find and click any download button
    const downloadButton = screen.getAllByAltText("Download")[0]; // Get the first download button
    expect(downloadButton).toBeInTheDocument();
    
    // Need to use fireEvent instead of userEvent for more direct click
    fireEvent.click(downloadButton);
    
    // Look for the export modal by its data-testid
    await waitFor(() => {
      const exportModal = screen.getByTestId("wrapper");
      expect(exportModal).toBeInTheDocument();
      
      // Check for the modal title by a more specific selector
      const modalTitle = screen.getByText("Ekspor Laporan");
      expect(modalTitle).toBeInTheDocument();
    }, { timeout: 3000 }); // Give it more time to appear
  });
  
  it("should render markdown content in assistant messages", async () => {
    // Setup the component
    renderWithServiceProvider(<ChatBox />);
    
    // Add user message and mock response with markdown
    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Show me markdown" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    
    // Complex markdown content
    const markdownContent = `
# Heading
## Subheading
* List item 1
* List item 2

\`\`\`sql
SELECT * FROM users;
\`\`\`
    `;
    
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        messageId: "md1",
        aiResponse: markdownContent,
        metadata: { modelUsed: "gemini" }
      })
    });
    
    // Since we're mocking ReactMarkdown, we just need to verify
    // the markdown content is passed to it
    await waitFor(() => {
      // Find individual pieces of the markdown instead of the whole block
      expect(screen.getByText((content) => content.includes("Heading"))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes("Subheading"))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes("List item 1"))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes("SELECT * FROM users"))).toBeInTheDocument();
    });
  });
});

})