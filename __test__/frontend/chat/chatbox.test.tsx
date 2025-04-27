import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatBox from "@frontend/(chat)/chatbox";
import { ServiceProvider } from "@frontend/(chat)/context/serviceContext";
import { ReactNode } from "react";
import { Schema, Service } from "@frontend/common/types";

// **Mock react-markdown agar tidak memicu error ESM**
// eslint-disable-next-line react/display-name
jest.mock("react-markdown", () => (props: React.PropsWithChildren) => <div>{props.children}</div>);
jest.mock("remark-gfm", () => jest.fn());
jest.mock("rehype-raw", () => jest.fn());

// Helper function untuk render dengan ServiceProvider
const renderWithServiceProvider = (children: ReactNode) => {
  return render(<ServiceProvider>{children}</ServiceProvider>);
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
    service: mockServices[0],
    serviceId: ""
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
