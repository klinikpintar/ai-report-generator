"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ServiceContextType {
  selectedService: string;
  setSelectedService: (service: string) => void;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceProvider = ({ children }: { children: ReactNode }) => {
  const [selectedService, setSelectedService] = useState<string>("Pilih Service"); // Default Service

  return (
    <ServiceContext.Provider value={{ selectedService, setSelectedService }}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useService = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error("useService must be used within a ServiceProvider");
  }
  return context;
};