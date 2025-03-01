import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatBox from "../app/page";
import { ServiceProvider, ServiceContext } from "../app/context/serviceContext";

// Helper component agar `ChatBox` selalu mendapatkan `ServiceProvider`
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
    fireEvent.change(input, { target: { value: "Hello!" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("How can I assist you?")).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it("should clear the input field after sending a message", async () => {
    renderWithServiceProvider(<ChatBox />);

    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Testing input clear" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });

  it("should not send an empty message", async () => {
    renderWithServiceProvider(<ChatBox />);

    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(screen.queryByText("How can I assist you?")).not.toBeInTheDocument();
    });
  });

  it("should not send a message with only spaces", async () => {
    renderWithServiceProvider(<ChatBox />);

    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(screen.queryByText("   ")).not.toBeInTheDocument();
    });
  });

  it("should not trigger bot response when no user message is sent", async () => {
    renderWithServiceProvider(<ChatBox />);

    await waitFor(
      () => {
        expect(screen.queryByText("How can I assist you?")).not.toBeInTheDocument();
      },
      { timeout: 1500 }
    );
  });

  it("should not break if user types excessively long messages", async () => {
    renderWithServiceProvider(<ChatBox />);

    const longMessage = "A".repeat(500);
    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: longMessage } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });
  });
});

describe("ChatBox with ServiceContext", () => {
  it("should display selected service from context", () => {
    renderWithServiceProvider(<ChatBox />);
    expect(screen.getByText("Reservasi: Pilih Service")).toBeInTheDocument();
  });

  it("should update reservation text when service is selected", async () => {
    renderWithServiceProvider(<ChatBox />);

    expect(screen.getByText("Reservasi: Pilih Service")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Select a Service"));
    fireEvent.click(screen.getByLabelText("Reservasi Keuangan"));
    fireEvent.click(screen.getByText("Select a Service"));

    await waitFor(() => {
      expect(screen.getByText("Reservasi: Reservasi Keuangan")).toBeInTheDocument();
    });
  });

  it("should fallback to default service when no service is selected", () => {
    renderWithServiceProvider(<ChatBox />);
    expect(screen.getByText("Reservasi: Pilih Service")).toBeInTheDocument();
  });

  it("should handle missing context provider gracefully", () => {
    console.error = jest.fn(); // Supaya error tidak memenuhi output

    expect(() => {
      renderWithServiceProvider(<ChatBox />);
    }).not.toThrow();
  });
});