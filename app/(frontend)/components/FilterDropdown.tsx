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

interface FilterDropdownProps<T> {
  items: T[];
  selectedItems: T[];
  buttonText: string;
  onSelectionChange: (items: T[]) => void;
  renderItem: (item: T) => React.ReactNode;
  getKey: (item: T) => string | number;
  buttonClassName?: string;
  dropdownWidth?: string;
}

export function FilterDropdown<T>({
  items,
  selectedItems,
  buttonText,
  onSelectionChange,
  getKey,
  renderItem,
  buttonClassName = "bg-blue-6 hover:bg-blue-6/90",
  dropdownWidth = "w-[200px]",
}: Readonly<FilterDropdownProps<T>>) {
  const [open, setOpen] = useState(false);

  const isItemSelected = (item: T) =>
    selectedItems.some((selected) => getKey(selected) === getKey(item));

  const handleSelectItem = (item: T) => (event: Event) => {
    event.preventDefault();
    const newSelectedItems = isItemSelected(item)
      ? selectedItems.filter((selected) => getKey(selected) !== getKey(item))
      : [...selectedItems, item];
    onSelectionChange(newSelectedItems);
  };

  const isAllSelected = selectedItems.length === items.length && items.length > 0;

  const handleSelectAll = (event: Event) => {
    onSelectionChange(selectedItems.length === items.length ? [] : [...items]);
    event.preventDefault();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild className={dropdownWidth}>
        <Button variant="default" className={cn("flex justify-between", buttonClassName)}>
          <span>{buttonText}</span>
          <ChevronDown className={cn("text-white", open && "rotate-180")} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={dropdownWidth}>
        <DropdownMenuCheckboxItem checked={isAllSelected} onSelect={handleSelectAll}>
          Select All
        </DropdownMenuCheckboxItem>
        {items.map((item) => (
          <DropdownMenuCheckboxItem
            key={getKey(item)}
            checked={isItemSelected(item)}
            onSelect={handleSelectItem(item)}
          >
            {renderItem(item)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
