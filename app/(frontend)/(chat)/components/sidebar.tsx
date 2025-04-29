"use client";

import Image from "next/image";
import { useSession } from "../context/sessionContext";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  _count?: {
    messages: number;
  };
}

export default function Sidebar({ isOpen }: SidebarProps) {
  const { createNewSession, setActiveSessionId, isNewSession, shouldRefresh, setShouldRefresh } = useSession();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Fetch chat sessions
  const fetchChatSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/chat-sessions");
      if (!response.ok) {
        throw new Error("Failed to fetch chat sessions");
      }
      const data = await response.json();

      // Filter out sessions with no messages (empty chats)
      const filteredSessions = (data.sessions || []).filter(
        (session: ChatSession) =>
          !session._count || session._count.messages > 0 || !isNewSession
      );

      setChatSessions(filteredSessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isNewSession]);

  useEffect(() => {
    if (isOpen) {
      fetchChatSessions();
    }
  }, [isOpen, fetchChatSessions]);

  // Listen for refresh triggers from the session context
  useEffect(() => {
    if (shouldRefresh) {
      fetchChatSessions();
      setShouldRefresh(false); // Reset the flag after fetching
    }
  }, [shouldRefresh, setShouldRefresh, fetchChatSessions]);

  const handleNewChat = async () => {
    try {
      const sessionId = await createNewSession();
      setActiveSessionId(sessionId);
      router.push(`/?sessionId=${sessionId}`);
    } catch (error) {
      console.error("Failed to create new chat:", error);
    }
  };

  const navigateToChat = (sessionId: string) => {
    setActiveSessionId(sessionId);
    router.push(`/?sessionId=${sessionId}`);
  };

  return (
    <aside
      className={`fixed top-[72px] left-0 h-full w-64 bg-white text-black z-50 shadow-md border-r-2 border-teal-700 transform transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="px-4 py-2">
        <button
          className="flex items-center gap-3 p-2 hover:bg-gray-200 w-full text-left"
          onClick={handleNewChat}
        >
          <Image src="/icon-plus.svg" width={20} height={20} alt="New Chat" />
          <h1 className="text-sm font-medium">New Chat</h1>
        </button>

        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-600">Recent</h2>

          {isLoading ? (
            <p className="text-sm text-gray-500 p-2">Loading...</p>
          ) : chatSessions.length > 0 ? (
            <div className="mt-2 max-h-[calc(100vh-200px)] overflow-y-auto">
              {chatSessions.map((session) => (
                <button
                  key={session.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-200 w-full text-left"
                  onClick={() => navigateToChat(session.id)}
                >
                  <Image
                    src="/icon-align-left.svg"
                    width={20}
                    height={20}
                    alt="Chat History"
                  />
                  <p className="text-sm font-medium truncate">
                    {session.title}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 p-2">No chat history found</p>
          )}
        </div>
      </div>
    </aside>
  );
}
