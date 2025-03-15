// components/ui/filter-dropdown/index.tsx
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
import { useState } from "react";

export interface Filterable {
  id: number;
}

interface FilterDropdownProps<T extends Filterable> {
  items: T[];
  selectedItems: T[];
  onSelectionChange: (items: T[]) => void;
  buttonText: string;
  displayProperty: keyof T;
  buttonClassName?: string;
  dropdownWidth?: string;
  contentTestid?: string;
}

export function FilterDropdown<T extends Filterable>({
  items,
  selectedItems,
  onSelectionChange,
  buttonText,
  displayProperty,
  buttonClassName = "bg-[#00B0EB] hover:bg-[#00B0EB]/90",
  dropdownWidth = "w-[200px]",
  contentTestid,
}: FilterDropdownProps<T>) {
  const [open, setOpen] = useState(false);

  const handleSelectAll = (event: Event) => {
    onSelectionChange(selectedItems.length === items.length ? [] : [...items]);
    event.preventDefault();
  };

  const handleSelectItem = (item: T) => (event: Event) => {
    event.preventDefault();
    const isSelected = selectedItems.some((selected) => selected.id === item.id);
    const newSelectedItems = isSelected
      ? selectedItems.filter((selected) => selected.id !== item.id)
      : [...selectedItems, item];
    onSelectionChange(newSelectedItems);
  };

  const allSelected = selectedItems.length === items.length && items.length > 0;

  const isItemSelected = (item: T) => selectedItems.some((selected) => selected.id === item.id);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild className={dropdownWidth}>
        <Button variant="default" className={cn("flex justify-between", buttonClassName)}>
          <span>
            {buttonText} {selectedItems.length > 0 && `(${selectedItems.length})`}
          </span>
          <ChevronDown className={cn("text-white", open && "rotate-180")} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent data-testid={contentTestid} className={dropdownWidth}>
        <DropdownMenuCheckboxItem
          checked={allSelected}
          onSelect={handleSelectAll}
        >
          Select All
        </DropdownMenuCheckboxItem>

        {items.map((item) => (
          <DropdownMenuCheckboxItem
            key={item.id}
            checked={isItemSelected(item)}
            onSelect={handleSelectItem(item)}
          >
            {String(item[displayProperty])}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
