"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface UserContextProps {
  email: string;
  name: string;
  setEmailContext: (email: string) => void;
  setNameContext: (name: string) => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [email, setEmailContext] = useState("");
  const [name, setNameContext] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    const storedName = localStorage.getItem("userName");
    if (storedEmail) setEmailContext(storedEmail);
    if (storedName) setNameContext(storedName);
  }, []);

  return (
    <UserContext.Provider value={{ email, name, setEmailContext, setNameContext }}>
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