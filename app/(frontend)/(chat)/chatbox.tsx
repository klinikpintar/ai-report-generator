"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown"; // Import Markdown Renderer
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Dropdown from "./components/dropdown";
import { useService } from "./context/serviceContext"; // Import context
import Bantuan from "./components/bantuan";
import type { Service } from "@frontend/common/types";
import ExportModal from "@/app/(frontend)/(chat)/components/ekspor/modal";
import { CodeBlock } from "./components/CodeBlock";
import { useSession } from "./context/sessionContext";
import { useSearchParams } from "next/navigation";
import { useUser } from "@frontend/login/context/userContext";

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
  const [isInitializing, setIsInitializing] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const {
    selectedService,
    services,
    getServiceRepresentation,
    setSelectedService, // Make sure this is exposed in your context
  } = useService(); // Ambil service dari context
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const {
    activeSessionId,
    setActiveSessionId,
    createNewSession,
    isNewSession,
    refreshSessions,
  } = useSession();
  const [exportModalData, setExportModalData] = useState<{
    id: string;
    content: string;
  } | null>(null);
  const { name } = useUser();

  const searchParams = useSearchParams();

  // Check for sessionId in URL on load
  useEffect(() => {
    const sessionId = searchParams.get("sessionId");
    setIsInitializing(true); // Start initializing

    if (sessionId) {
      setActiveSessionId(sessionId);
      loadSessionMessages(sessionId).finally(() => setIsInitializing(false));
    } else {
      setIsInitializing(false); // No session to load
    }
  }, [searchParams, setActiveSessionId]);

  // Add this new useEffect to select all services when starting a new chat
  useEffect(() => {
    const sessionId = searchParams.get("sessionId");

    // If there's no sessionId (new chat) and no services are selected yet
    if (!sessionId && (!selectedService || selectedService.length === 0)) {
      // Select all services by default
      setSelectedService(services);
    }
  }, [searchParams, services, selectedService, setSelectedService]);

  // Load messages from a session
  const loadSessionMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat-sessions/${sessionId}`);
      if (!response.ok) throw new Error("Failed to load session");

      const data = await response.json();

      // Set messages from the session data
      setMessages(
        data.session.messages.map((m: any) => ({
          id: m.id,
          sender: m.role,
          content: m.content,
        }))
      );

      // Restore saved service selection
      if (
        data.session.lastSelectedServices &&
        data.session.lastSelectedServices.length > 0
      ) {
        // Find services that match the saved IDs
        const serviceIds = data.session.lastSelectedServices;
        const servicesToSelect = services.filter((service) =>
          serviceIds.includes(service.id)
        );

        // Set selected services if we found matches
        if (servicesToSelect.length > 0) {
          setSelectedService(servicesToSelect);
        }
      }

      setHasChatted(true);
    } catch (error) {
      console.error("Error loading session:", error);
    }
  };

  // Auto-scroll ke pesan terbaru setiap kali messages diperbarui
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const getRelatedSchemaIds = async (services: Service[]) => {
    if (services.length === 0) return [];

    const serviceIds = services.map((service) => service.id);
    const queryParams = new URLSearchParams();
    serviceIds.forEach((id) => queryParams.append("serviceIds", id.toString()));

    const response = await fetch(`/api/schema?${queryParams.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch schemas");

    const responseData = await response.json();
    // ("Schema API response:", responseData);

    const schemas = Array.isArray(responseData)
      ? responseData
      : responseData.data;

    if (!Array.isArray(schemas)) {
      console.error("Unexpected API response format:", responseData);
      return [];
    }

    return schemas.map((schema) => schema.id);
  };

  const sendMessage = async () => {
    // Store the message content before any async operations
    const messageContent = input.trim();
    if (!messageContent) return;

    // Create user message object
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user", // This is correct for your frontend interface
      content: messageContent,
    };

    // Update UI immediately
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setHasChatted(true);
    setIsLoading(true);

    // Handle session (create if needed)
    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      try {
        currentSessionId = await createNewSession();
        // Don't reset messages here - that's likely the bug
      } catch (error) {
        console.error("Failed to create session:", error);
        setIsLoading(false);
        return;
      }
    }

    try {
      // Get the IDs of selected services
      const serviceIds = selectedService.map((service) => service.id);
      
      // Convert service IDs to schema IDs - using your existing function
      const schemaIds = await getRelatedSchemaIds(selectedService);
      
      const apiMessages = messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      }));

      apiMessages.push({ role: "user", content: messageContent });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          sessionId: currentSessionId,
          serviceIds: serviceIds, // For storing with the session
          schemaId: schemaIds
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data: ApiResponse = await response.json();

      // When adding the AI response, use the functional form to preserve existing messages
      const assistantMessage: Message = {
        id: data.messageId || `${Date.now()}-ai`,
        sender: "assistant", // This is correct for your frontend interface
        content: data.aiResponse,
        modelUsed: data.metadata?.modelUsed,
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);

      // Add this after successfully submitting the first message
      if (isNewSession) {
        refreshSessions();
      }

      if (!isNewSession && messages.length === 0) {
        refreshSessions();
      }
    } catch (error) {
      console.error("Error sending message:", error);

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

  // Your useEffect hooks
  useEffect(() => {
    const sessionId = searchParams.get("sessionId");
    setIsInitializing(true);

    if (sessionId) {
      setActiveSessionId(sessionId);
      loadSessionMessages(sessionId).finally(() => setIsInitializing(false));
    } else {
      setIsInitializing(false);
    }
  }, [searchParams, setActiveSessionId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen pb-20">
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

      {isInitializing ? (
          <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
        </div>
      ) : !hasChatted ? (
        <h1 className="text-3xl font-bold text-center flex items-center justify-center h-full text-blue-6">
          Hello, {name} !!
        </h1>
      ) : (
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 bg-white"
        >
          <div className="mt-4 flex flex-col gap-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[90%] ${
                  msg.sender === "user" ? "self-end" : "self-start"
                } flex flex-col gap-1`}
              >
                {/* Bubble */}
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
                      components={{
                        h1: (props) => (
                          <h1 className="text-2xl font-bold my-4" {...props} />
                        ),
                        h2: (props) => (
                          <h2 className="text-xl font-bold my-3" {...props} />
                        ),
                        h3: (props) => (
                          <h3 className="text-lg font-bold my-2" {...props} />
                        ),
                        p: (props) => <p className="my-2" {...props} />,
                        ul: (props) => (
                          <ul className="list-disc pl-5 my-2" {...props} />
                        ),
                        ol: (props) => (
                          <ol className="list-decimal pl-5 my-2" {...props} />
                        ),
                        li: (props) => <li className="my-1" {...props} />,
                        code: ({
                          inline,
                          className,
                          children,
                          ...props
                        }: {
                          inline?: boolean;
                          className?: string;
                          children?: React.ReactNode;
                        }) => {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline && match ? (
                            <CodeBlock
                              language={match[1]}
                              value={String(children).replace(/\n$/, "")}
                            />
                          ) : (
                            <code
                              className="bg-gray-100 px-1 rounded text-sm"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>

                {msg.sender === "assistant" && (
                  <button
                    onClick={() => {
                      setIsExportModalVisible(true);
                      setExportModalData({ id: msg.id, content: msg.content });
                    }}
                  >
                    <Image
                      src="/icon-download.svg"
                      width={20}
                      height={20}
                      alt="Download"
                      className="cursor-pointer"
                    />
                  </button>
                )}
              </div>
            ))}

            {isExportModalVisible && exportModalData && (
              <ExportModal
                key={exportModalData.id}
                isVisible={!!exportModalData}
                onClose={() => {
                  setExportModalData(null);
                  setIsExportModalVisible(false);
                }}
                content={exportModalData.content}
                title={`Laporan-${exportModalData.id}`}
              />
            )}

            {isLoading && (
              <div className="p-3 rounded-lg max-w-[90%] bg-gray-200 text-black self-start">
                AI is typing...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer input */}
      <div className="w-full pb-5 pt-3">
        <div className="w-full mx-auto flex flex-col">
          <p className="text-sm text-gray-600 mb-1">
            Service:{" "}
            {getServiceRepresentation(
              selectedService,
              selectedService.length === services.length
            )}
          </p>
          <div className="flex items-center p-1 gap-2">
            <textarea
              className="flex-1 border border-gray-300 rounded-xl p-4 text-black resize-none outline-none"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim()) sendMessage();
                }
              }}
              rows={1}
              disabled={isLoading}
            />
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
          <p className="text-xs text-gray-600 text-center mt-1">
            This AI Report Generator can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
}
