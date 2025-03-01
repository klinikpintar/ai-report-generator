import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatBox from "../app/page";

describe("ChatBox Component", () => {
  it("should display a welcome message before chatting", () => {
    render(<ChatBox />);
    
    expect(screen.getByText("Hello, Virgillia Yeala !!")).toBeInTheDocument();
  });

  it("should remove welcome message after sending a chat", async () => {
    render(<ChatBox />);
    
    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Hi there!" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(screen.queryByText("Hello, Virgillia Yeala !!")).not.toBeInTheDocument();
    });
  });

  it("should add user message to chat", async () => {
    render(<ChatBox />);
    
    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Hi, how are you?" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("Hi, how are you?")).toBeInTheDocument();
    });
  });

  it("should receive a bot response after user sends a message", async () => {
    render(<ChatBox />);
    
    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Hello!" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
        expect(screen.getByText("How can I assist you?")).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it("should clear the input field after sending a message", async () => {
    render(<ChatBox />);
    
    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Testing input clear" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });

  it("should not send an empty message", async () => {
    render(<ChatBox />);
    
    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(screen.queryByText("How can I assist you?")).not.toBeInTheDocument();
    });
  });

  it("should not send a message with only spaces", async () => {
    render(<ChatBox />);
    
    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(screen.queryByText("   ")).not.toBeInTheDocument();
    });
  });

  it("should not trigger bot response when no user message is sent", async () => {
    render(<ChatBox />);
    
    await waitFor(
      () => {
        expect(screen.queryByText("How can I assist you?")).not.toBeInTheDocument();
      },
      { timeout: 1500 } 
    );
  });

  it("should not break if user types excessively long messages", async () => {
    render(<ChatBox />);
    
    const longMessage = "A".repeat(500); 
    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: longMessage } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    await waitFor(() => {
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });
  });
});
