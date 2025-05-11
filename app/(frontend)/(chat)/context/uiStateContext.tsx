"use client";

import { createContext, useContext } from "react";

interface UIStateContextType {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
  showProfileDropdown: boolean;
  setShowProfileDropdown: (value: boolean) => void;
}

export const UIStateContext = createContext<UIStateContextType>({
  isSidebarOpen: false,
  setIsSidebarOpen: () => {},
  showProfileDropdown: false,
  setShowProfileDropdown: () => {},
});

export const useUIState = () => useContext(UIStateContext);