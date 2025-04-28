"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface SessionContextType {
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
  createNewSession: () => Promise<string>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const router = useRouter();
  
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
      router.push(`/?sessionId=${session.id}`);
      return session.id;
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  };

  return (
    <SessionContext.Provider value={{
      activeSessionId,
      setActiveSessionId,
      createNewSession,
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