import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatBox from "../app/chatbox";
import { ServiceProvider } from "../app/context/serviceContext";

// Helper function to render ChatBox with ServiceProvider
const renderWithServiceProvider = (ui) => {
  return render(<ServiceProvider>{ui}</ServiceProvider>);
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

  it("should receive a bot response after user sends a message", async () => {
    renderWithServiceProvider(<ChatBox />);
    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Halo bisa bantu saya?" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    const botResponse = await screen.findByText(/membantu|bantu|hello|tentu/i, {}, { timeout: 5000 });
    expect(botResponse).toBeInTheDocument();
  });
});

describe("ChatBox API Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should send a message and receive a bot response", async () => {
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
        },
      }),
    });

    renderWithServiceProvider(<ChatBox />);
    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Halo bisa bantu saya?" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith("/api/chat", expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }));
    });

    const botResponse = await screen.findByText(/membantu|bantu|hello|tentu/i, {}, { timeout: 5000 });
    expect(botResponse).toBeInTheDocument();
  });

  it("should handle API failure gracefully", async () => {
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

    const errorMessage = await screen.findByText(/Sorry, there was an error processing your request./i);
    expect(errorMessage).toBeInTheDocument();
  });
});