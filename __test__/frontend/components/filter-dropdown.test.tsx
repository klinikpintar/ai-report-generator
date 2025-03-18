import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Filterable, FilterDropdown } from "@frontend/components/filter-dropdown";

interface TestItem extends Filterable {
  name: string;
  value: number;
}

const testItems: TestItem[] = [
  { id: 1, name: "Item 1", value: 100 },
  { id: 2, name: "Item 2", value: 200 },
  { id: 3, name: "Item 3", value: 300 },
];

const FilterDropdownWrapper = () => {
  const [selectedItems, setSelectedItems] = useState<TestItem[]>([]);

  return (
    <FilterDropdown<TestItem>
      items={testItems}
      selectedItems={selectedItems}
      buttonText="Filter Items"
      displayProperty="name"
      onSelectionChange={setSelectedItems}
    />
  );
};

describe("FilterDropdown Component", () => {
  const setup = () => {
    return {
      user: userEvent.setup(),
      ...render(<FilterDropdownWrapper />),
    };
  };

  it("should render with button text", () => {
    setup();
    expect(screen.getByText("Filter Items")).toBeInTheDocument();
  });

  it("should open dropdown when button is clicked", async () => {
    const { user } = setup();

    expect(screen.queryByText("Select All")).not.toBeInTheDocument();
    await user.click(screen.getByText("Filter Items"));

    expect(screen.getByText("Select All")).toBeInTheDocument();
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();
  });

  it("should select an item when clicked", async () => {
    const { user } = setup();

    await user.click(screen.getByText("Filter Items"));
    await user.click(screen.getByText("Item 2"));

    expect(screen.getByText("Item 2")).toBeChecked();
  });

  it("should deselect an item when clicked again", async () => {
    const { user } = setup();

    await user.click(screen.getByText("Filter Items"));
    await user.click(screen.getByText("Item 1"));
    await user.click(screen.getByText("Item 1"));

    expect(screen.getByText("Item 1")).not.toBeChecked();;
  });

  it('should select all items when "Select All" is clicked', async () => {
    const { user } = setup();

    await user.click(screen.getByText("Filter Items"));
    await user.click(screen.getByText("Select All"));

    expect(screen.getByText("Item 1")).toBeChecked();
    expect(screen.getByText("Item 2")).toBeChecked();
    expect(screen.getByText("Item 3")).toBeChecked();
  });

  it('should deselect all items when "Select All" is clicked again', async () => {
    const { user } = setup();

    await user.click(screen.getByText("Filter Items"));
    await user.click(screen.getByText("Select All"));
    await user.click(screen.getByText("Select All"));

    expect(screen.getByText("Item 1")).not.toBeChecked();;
    expect(screen.getByText("Item 2")).not.toBeChecked();;
    expect(screen.getByText("Item 3")).not.toBeChecked();;
  });

  it("should handle empty items array", async () => {
    render(
      <FilterDropdown<TestItem>
        items={[]}
        selectedItems={[]}
        buttonText="Filter Items"
        displayProperty="name"
        onSelectionChange={() => {}}
      />
    );
    const user = userEvent.setup();

    await user.click(screen.getByText("Filter Items"));

    expect(screen.getByText("Select All")).toBeInTheDocument();
    expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
  });
});
