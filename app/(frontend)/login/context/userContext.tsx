"use client";

import { createContext, useContext, useState, useEffect, useMemo } from "react";

interface UserContextProps {
  email: string;
  name: string;
  setEmailContext: (email: string) => void;
  setNameContext: (name: string) => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    const storedName = localStorage.getItem("userName");
    if (storedEmail) setEmail(storedEmail);
    if (storedName) setName(storedName);
  }, []);

  // Menggunakan useMemo untuk mencegah re-render yang tidak perlu
  const contextValue = useMemo(
    () => ({
      email,
      name,
      setEmailContext: setEmail,  // Alias untuk setEmail
      setNameContext: setName     // Alias untuk setName
    }),
    [email, name]
  );

  return (
    <UserContext.Provider value={contextValue}>
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