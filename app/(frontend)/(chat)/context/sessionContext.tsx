"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface SessionContextType {
  activeSessionId: string | null; // Change sessionId to activeSessionId to match what you use
  isNewSession: boolean;
  setActiveSessionId: (sessionId: string) => void;
  createNewSession: () => Promise<string>;
  refreshSessions: () => void;
  shouldRefresh: boolean;
  setShouldRefresh: (value: boolean) => void; // Add this to control refresh state
  refreshTrigger: number; // Add this if you need it
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isNewSession, setIsNewSession] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [shouldRefresh, setShouldRefresh] = useState(false);
  
  const createNewSession = async (): Promise<string> => {
    try {
      const response = await fetch("/api/chat-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat" }),
      });
      
      if (!response.ok) throw new Error("Failed to create session");
      
      const { session } = await response.json();
      setActiveSessionId(session.id);
      setIsNewSession(true); // Mark this as a new session
      return session.id;
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  };

  const refreshSessions = useCallback(() => {
    setShouldRefresh(true); // Set shouldRefresh to true
    setRefreshTrigger(prev => prev + 1);
    setIsNewSession(false);
  }, []);

  return (
    <SessionContext.Provider value={{
      activeSessionId,
      setActiveSessionId,
      createNewSession,
      refreshSessions,
      isNewSession,
      shouldRefresh,
      setShouldRefresh, // Expose this so components can reset it
      refreshTrigger, // Expose it if needed
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}