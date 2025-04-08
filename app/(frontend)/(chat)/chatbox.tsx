"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown"; // Import Markdown Renderer
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Dropdown from "./components/dropdown";
import { useService } from "./context/serviceContext"; // Import context
import Bantuan from "./components/bantuan";

// Definisikan tipe data pesan
interface Message {
  id: string;
  sender: "user" | "assistant";
  content: string;
  modelUsed?: string; // Tambahkan informasi model
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
    modelUsed: string;
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
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
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
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: input.trim() }],
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data: ApiResponse = await response.json();

      const assistantMessage: Message = {
        id: data.messageId,
        sender: "assistant",
        content: data.aiResponse, // Respon AI sudah siap dirender
        modelUsed: data.metadata.modelUsed,
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now().toString(),
          sender: "assistant",
          content: "Sorry, there was an error processing your request.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ml-64 flex flex-col h-screen pt-[72px]">
      <div className="flex justify-between items-center py-3">
        {/* Container untuk Select a Service */}
        <div className="flex flex-col">
          <Dropdown />
        </div>

        {/* Container untuk Bantuan */}
        <div className="flex items-center space-x-2">
          <Bantuan />
        </div>
      </div>

      {!hasChatted && (
        <h1 className="text-3xl font-bold text-center flex items-center justify-center h-full pb-24 text-blue-6">
          Hello, Virgillia Yeala !!
        </h1>
      )}

      {/* Bagian Chat Scrollable */}
      {hasChatted && (
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 bg-white"
        >
          <div className="ml-2 mt-4 flex flex-col mr-4 gap-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[90%] ${
                  msg.sender === "user" ? "self-end" : "self-start"
                } flex flex-col gap-1`}
              >
                {/* Bubble Message */}
                <div
                  className={`p-3 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-[#E4F6FC] text-[#00B0EB]"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  {msg.sender === "assistant" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>

                {/* Icon export hanya untuk assistant */}
                {msg.sender === "assistant" && (
                  <button
                    onClick={() => alert("Export logic here")}
                    className="mt-1 self-start"
                    title="Export response"
                  >
                    <Image
                      src="/icon-download.svg"
                      width={18}
                      height={18}
                      alt="Export"
                    />
                  </button>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="p-3 rounded-lg max-w-[90%] bg-gray-200 text-black self-start">
                AI is typing...
              </div>
            )}
          </div>
        </div>
      )}

      <div className="w-full flex justify-center pb-5 pt-3">
        {/* Container utama dengan max-width */}
        <div className="w-full flex flex-col">
          {/* Teks di atas container input */}
          <div className="mb-1">
            <p className="text-sm text-gray-600">Service: {selectedService}</p>
          </div>

          {/* Container untuk input dan button */}
          <div className="flex items-center p-1 gap-2">
            {/* Textarea */}
            <textarea
              className="flex-1 border border-gray-300 rounded-xl p-4 text-black resize-none outline-none"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim()) {
                    sendMessage();
                  }
                }
              }}
              rows={1}
              disabled={isLoading}
            />

            {/* Button di sebelah kanan textarea */}
            <button
              className="flex items-center justify-center transition disabled:opacity-50"
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
            >
              <Image
                src="/icon-send.svg"
                width={45}
                height={45}
                alt="Send Icon"
              />
            </button>
          </div>
          <p className="text-xs text-gray-600 text-center">
            This AI Report Generator can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
}
