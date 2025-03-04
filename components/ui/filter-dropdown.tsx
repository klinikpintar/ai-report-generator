"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import type React from "react";
import { useReducer, useEffect, useState } from "react";

// Generic type for items that can be filtered
export interface Filterable {
  id: string;
  [key: string]: any;
}

type FilterAction<T extends Filterable> =
  | { type: "TOGGLE_ITEM"; payload: T }
  | { type: "TOGGLE_ALL" }
  | { type: "SET_ITEMS"; payload: T[] };

interface FilterState<T extends Filterable> {
  items: T[];
  selectedItems: T[];
}

function filterReducer<T extends Filterable>(
  state: FilterState<T>,
  action: FilterAction<T>
): FilterState<T> {
  switch (action.type) {
    case "SET_ITEMS":
      return { ...state, items: action.payload };
    case "TOGGLE_ITEM":
      const isSelected = state.selectedItems.some((item) => item.id === action.payload.id);
      return {
        ...state,
        selectedItems: isSelected
          ? state.selectedItems.filter((item) => item.id !== action.payload.id)
          : [...state.selectedItems, action.payload],
      };
    case "TOGGLE_ALL":
      const allSelected = state.selectedItems.length === state.items.length;
      return {
        ...state,
        selectedItems: allSelected ? [] : [...state.items],
      };
    default:
      return state;
  }
}

interface FilterDropdownProps<T extends Filterable> {
  items: T[];
  buttonText: string; // text to display on the button
  displayProperty: keyof T; // attribute of T to display
  onSelectionChange?: (selectedItems: T[]) => void;
  buttonClassName?: string;
  dropdownWidth?: string;
}

export function FilterDropdown<T extends Filterable>({
  items,
  buttonText,
  displayProperty,
  onSelectionChange,
  buttonClassName = "bg-[#00B0EB] hover:bg-[#00B0EB]/90",
  dropdownWidth = "w-[200px]",
}: FilterDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [state, dispatch] = useReducer(filterReducer<T>, {
    items: [],
    selectedItems: [],
  });

  useEffect(() => {
    dispatch({ type: "SET_ITEMS", payload: items });
  }, [items]);

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(state.selectedItems);
    }
  }, [state.selectedItems, onSelectionChange]);

  const allSelected = state.selectedItems.length === state.items.length && state.items.length > 0;

  const isItemSelected = (item: T) =>
    state.selectedItems.some((selected) => selected.id === item.id);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild className={dropdownWidth}>
        <Button variant="default" className={cn("flex justify-between", buttonClassName)}>
          <span>
            {buttonText} {state.selectedItems.length > 0 && `(${state.selectedItems.length})`}
          </span>
          <ChevronDown className={cn("text-white", open && "rotate-180")} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={dropdownWidth}>
        <DropdownMenuCheckboxItem
          checked={allSelected}
          onSelect={(event) => {
            event.preventDefault();
            dispatch({ type: "TOGGLE_ALL" });
          }}
        >
          Select All
        </DropdownMenuCheckboxItem>

        {state.items.map((item) => (
          <DropdownMenuCheckboxItem
            key={item.id}
            checked={isItemSelected(item)}
            onSelect={(event) => {
              event.preventDefault();
              dispatch({ type: "TOGGLE_ITEM", payload: item });
            }}
          >
            {String(item[displayProperty])}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
