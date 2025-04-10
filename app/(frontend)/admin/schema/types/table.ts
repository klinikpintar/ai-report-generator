

export interface FilterOption<T> {
  items: T[];
  selectedItems: T[];
  onSelectionChange: (items: T[]) => void;
  buttonText: string;
  displayProperty: keyof T;
  testId?: string;
}

export interface TableActionProps<T> {
  item: T;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  editLabel?: string;
  deleteLabel?: string;
  viewLabel?: string;
}
