"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Dropdown from "../app/components/dropdown";
import { useService } from "../app/context/serviceContext"; // Import context

// Definisikan tipe data pesan
interface Message {
  id: string;
  sender: "user" | "assistant";
  content: string;
  modelUsed?: string; // Add this field
}

interface ApiResponse {
  messageId: string;
  userPrompt: string;
  aiResponse: string;
  createdAt: string;
  metadata: {
    finishReason: string;
    usage: {
      promptTokens: number;
      completionTokens: number;
    };
    modelUsed: string; // Add this field
  };
}

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [hasChatted, setHasChatted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { selectedService } = useService(); // Ambil service dari context

  // Auto-scroll ke pesan terbaru setiap kali messages diperbarui
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
  
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: input.trim(),
    };
  
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setHasChatted(true);
    setIsLoading(true);
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: input.trim() },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data: ApiResponse = await response.json();

      const assistantMessage: Message = {
        id: data.messageId,
        sender: 'assistant',
        content: data.aiResponse,
        modelUsed: data.metadata.modelUsed, // Include the model information
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      
      // Show error in chat
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now().toString(),
          sender: 'assistant',
          content: 'Sorry, there was an error processing your request.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="ml-64 flex flex-col h-screen">
      <Dropdown />

      {!hasChatted && (
        <h1 className="text-3xl font-bold text-center flex items-center justify-center h-full pb-24" style={{ color: "#00B0EB" }}>
          Hello, Virgillia Yeala !!
        </h1>
      )}

      {/* Bagian Chat Scrollable */}
      {hasChatted && (
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-white pb-24">
          <div className="ml-2 mt-4 space-y-2 flex flex-col mr-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-lg max-w-[90%] ${
                  msg.sender === "user" ? "bg-[#E4F6FC] text-[#00B0EB] self-end" : "bg-gray-200 text-black self-start"
                }`}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="p-3 rounded-lg max-w-[90%] bg-gray-200 text-black self-start">AI is typing...</div>
            )}
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div className="sticky bottom-3 w-full bg-white py-4 px-6">
        <p className="text-sm text-gray-600 absolute left-6 top-2">Reservasi: {selectedService}</p>

        <div className="relative w-full flex items-center mx-auto mt-5">
          <input
            type="text"
            className="w-full border rounded-3xl p-3 pr-12 text-black"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={isLoading}
          />
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
          >
            <Image src="/icon-send.svg" width={40} height={40} alt="Send Icon" />
          </button>
        </div>

        <p className="text-xs text-gray-600 mt-2 text-center">This AI Report Generator can make mistakes. Check important info.</p>
      </div>
    </div>
  );
}