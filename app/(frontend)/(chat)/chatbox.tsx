"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Dropdown from "./components/dropdown";
import { useService } from "./context/serviceContext";
import Bantuan from "./components/bantuan";
import type { Service } from "@frontend/common/types";
import ExportModal from "@/app/(frontend)/(chat)/components/ekspor/modal";
import { useSession } from "./context/sessionContext";
import { useSearchParams } from "next/navigation";
import { useUser } from "@frontend/login/context/userContext";
import { ReportFormatter } from "./components/ReportFormatter";
import { QueryValidationResult } from "./interfaces/QueryValidationResult";


interface Message {
  id: string;
  sender: "user" | "assistant";
  content: string;
  modelUsed?: string;
  queryValidationResults?: QueryValidationResult[];
}

interface ApiResponse {
  messageId: string;
  userPrompt: string;
  aiResponse: string;
  createdAt: string;
  queryValidationResults: QueryValidationResult[];
  metadata: {
    finishReason: string;
    usage: {
      promptTokens: number;
      completionTokens: number;
    };
    modelUsed: string;
  };
}

// Add this interface for the session message type
interface SessionMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  modelUsed?: string;
  queryValidationResults?: QueryValidationResult[];
}

// Add this interface for the session data
interface SessionData {
  session: {
    id: string;
    title?: string;
    messages: SessionMessage[];
    lastSelectedServices?: string[]; // Keep this for service selection persistence
  }
}

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [hasChatted, setHasChatted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [titleSession, setTitleSession] = useState<string>("AI Report Generator");
  const {
    selectedService,
    services,
    getServiceRepresentation,
    setSelectedService, // Keep this important function
  } = useService();
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const {
    activeSessionId,
    setActiveSessionId,
    createNewSession,
    isNewSession,
    refreshSessions,
  } = useSession();
  const [exportModalData, setExportModalData] = useState<{ id: string; content: string } | null>(null);
  const { name } = useUser();
  const searchParams = useSearchParams();

  // Add this effect for selecting all services when starting a new chat
  useEffect(() => {
    const sessionId = searchParams.get("sessionId");

    // If there's no sessionId (new chat) and no services are selected yet
    if (!sessionId && (!selectedService || selectedService.length === 0)) {
      // Select all services by default
      setSelectedService(services);
    }
  }, [searchParams, services, selectedService, setSelectedService]);

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

  // Use useCallback for loadSessionMessages
  const loadSessionMessages = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat-sessions/${sessionId}`);
      if (!response.ok) throw new Error("Failed to load session");
      const data = await response.json() as SessionData;
      setTitleSession(data.session.title ?? "AI Report Generator");

      // Convert session messages to the right format
      const formattedMessages = data.session.messages.map(
        (msg: SessionMessage) => ({
          id: msg.id,
          sender: msg.role === "user" ? "user" : "assistant" as const,
          content: msg.content,
          modelUsed: msg.modelUsed ?? undefined,
          queryValidationResults: msg.queryValidationResults ?? undefined,
        })
      );

      setMessages(formattedMessages as Message[]);
      if (formattedMessages.length > 0) setHasChatted(true);
      
      // Restore saved service selection - keep this important feature
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
    } catch (error) {
      console.error("Error loading session messages:", error);
    }
  }, [services, setSelectedService]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
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
    // Handle different response formats more explicitly
    let schemas = [];
    if (Array.isArray(responseData)) {
      schemas = responseData;
    } else if (responseData && responseData.data && Array.isArray(responseData.data)) {
      schemas = responseData.data;
    } else {
      console.error("Unexpected API response format:", responseData);
      return [];
    }
    // Define the schema structure
    interface Schema {
      id: number;
      [key: string]: unknown; // Additional schema properties
    }

    // Cast the schemas array with the correct type
    return schemas.map((schema: Schema) => schema.id);
  };

  const sendMessage = async () => {
    const messageContent = input.trim();
    if (!messageContent) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: messageContent,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setHasChatted(true);
    setIsLoading(true);

    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      try {
        currentSessionId = await createNewSession();
      } catch (error) {
        console.error("Failed to create session:", error);
        setIsLoading(false);
        return;
      }
    }

    try {
      // Get the IDs of selected services
      const serviceIds = selectedService.map((service) => service.id);
      
      // Convert service IDs to schema IDs
      const schemaIds = await getRelatedSchemaIds(selectedService);
      
      const apiMessages = messages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      })).concat({ role: "user", content: messageContent });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          schemaId: schemaIds,
          sessionId: currentSessionId,
          serviceIds: serviceIds, // Include serviceIds for storing with the session
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data: ApiResponse = await response.json();
      const assistantMessage: Message = {
        id: data.messageId ?? `${Date.now()}-ai`,
        sender: "assistant", // This is correct for your frontend interface
        content: data.aiResponse,
        modelUsed: data.metadata?.modelUsed,
        queryValidationResults: data.queryValidationResults ?? [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (isNewSession || (!isNewSession && messages.length === 0)) refreshSessions();
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        sender: "assistant",
        content: "Sorry, there was an error processing your request.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  let chatContent;
  if (isInitializing) {
    chatContent = (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  } else if (!hasChatted) {
    chatContent = (
      <h1 className="text-3xl font-bold text-center flex items-center justify-center h-full text-blue-6">
        Hello, {name} !!
      </h1>
    );
  } else {
    chatContent = (
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 bg-white">
        <div className="mt-4 flex flex-col gap-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-[90%] ${msg.sender === "user" ? "self-end" : "self-start"} flex flex-col gap-1`}
            >
              <div className={`p-3 rounded-lg ${msg.sender === "user" ? "bg-[#E4F6FC] text-[#00B0EB]" : "bg-gray-200 text-black"}`}>
                {msg.sender === "assistant" ? (
                  <ReportFormatter
                    content={msg.content}
                    validationResults={msg.queryValidationResults}
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
              {msg.sender === "assistant" && (
                <button onClick={() => {
                  setIsExportModalVisible(true);
                  setExportModalData({ id: msg.id, content: msg.content });
                }}>
                  <Image src="/icon-download.svg" width={20} height={20} alt="Download" className="cursor-pointer" />
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
              title={titleSession}
            />
          )}

          {isLoading && (
            <div className="p-3 rounded-lg max-w-[90%] bg-gray-200 text-black self-start">
              AI is typing...
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen pb-20">
      <div className="flex justify-between items-center py-3">
        <div className="flex flex-col"><Dropdown /></div>
        <div className="flex items-center space-x-2"><Bantuan /></div>
      </div>
      {chatContent}
      <div className="w-full pb-5 pt-3">
        <div className="w-full mx-auto flex flex-col">
          <p className="text-sm text-gray-600 mb-1">
            Service: {getServiceRepresentation(selectedService, selectedService.length === services.length)}
          </p>
          <div className="flex items-center p-1 gap-2">
            <textarea
              className="flex-1 border border-gray-300 rounded-xl p-4 text-black resize-none outline-none"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    if (input.trim()) sendMessage();
                  } else {
                    // Make sure we don't clear the input on shift+enter
                    e.preventDefault();
                    // Add a newline character if needed
                    setInput(prev => prev + "\n");
                  }
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
              <Image src="/icon-send.svg" width={45} height={45} alt="Send Icon" />
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