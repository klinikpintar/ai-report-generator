"use client";

import { Service } from "@frontend/common/types/service";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo, // Import useMemo
  useCallback, // Import useCallback
} from "react";

interface ServiceContextType {
  selectedService: Service[];
  setSelectedService: (service: Service[]) => void;
  services: Service[];
  setServices: (services: Service[]) => void;
  getServiceRepresentation: (services: Service[], isAllSelected: boolean) => string;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceProvider = ({ children }: { children: ReactNode }) => {
  const [services, setServices] = useState<Service[]>([]); 
  const [selectedService, setSelectedService] = useState<Service[]>([]);

  const getServiceRepresentation = useCallback(
    (currentServices: Service[], isAllSelected: boolean) => {
      if (currentServices.length === 0) return "Pilih Service";
      if (currentServices.length === 1) return currentServices[0].name;
      if (isAllSelected)
        return "Select All";
      else return `${currentServices[0].name} and ${currentServices.length - 1} more`;
    },
    []
  );

  // Memoize the context value
  const contextValue = useMemo(
    () => ({
      selectedService,
      setSelectedService,
      services,
      setServices,
      getServiceRepresentation,
    }),
    [selectedService, services, getServiceRepresentation]
  );

  return <ServiceContext.Provider value={contextValue}>{children}</ServiceContext.Provider>;
};

export const useService = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error("useService must be used within a ServiceProvider");
  }
  return context;
};
