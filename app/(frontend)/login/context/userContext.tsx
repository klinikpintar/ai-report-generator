"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface UserContextProps {
  email: string;
  setEmailContext: (email: string) => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [email, setEmailContext] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) setEmailContext(storedEmail);
  }, []);

  return (
    <UserContext.Provider value={{ email, setEmailContext }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};