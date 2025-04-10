"use client";

import { Service } from "@frontend/common/types/service";
import { createContext, useContext, useState, ReactNode } from "react";

interface ServiceContextType {
  selectedService: Service[];
  setSelectedService: (service: Service[]) => void;
  services: Service[];
  setServices: (services: Service[]) => void;
  getServiceRepresentation: (services: Service[], isAllSelected:boolean) => string;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceProvider = ({ children }: { children: ReactNode }) => {
  const [services, setServices] = useState<Service[]>([]); // Array of Services
  const [selectedService, setSelectedService] = useState<Service[]>([]); // Default Service
  const getServiceRepresentation = (services: Service[], isAllSelected: boolean) => {
    if (services.length === 0) return "Pilih Service";
    if (services.length === 1) return services[0].name;
    if (isAllSelected) return "Select All";
    else return `${services[0].name} and ${services.length - 1} more`;
  };

  return (
    <ServiceContext.Provider
      value={{
        selectedService,
        setSelectedService,
        services,
        setServices,
        getServiceRepresentation,
      }}
    >
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
