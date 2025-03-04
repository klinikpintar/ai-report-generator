"use client";

import type React from "react";

// Generic type for items that can be filtered
export interface Filterable {
  id: string;
  [key: string]: any;
}

interface FilterDropdownProps<T extends Filterable> {
  items: T[];
  buttonText: string; // text to display on the button
  displayProperty: keyof T; // attribute of T to display
  onSelectionChange?: (selectedItems: T[]) => void;
}

export function FilterDropdown<T extends Filterable>({
  items,
  buttonText,
  displayProperty,
  onSelectionChange,
}: FilterDropdownProps<T>) {
  return <div></div>;
}
