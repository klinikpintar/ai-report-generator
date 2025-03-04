import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterDropdown, type Filterable } from "@/components/ui/filter-dropdown";

// Mock data for testing
interface TestItem extends Filterable {
  name: string;
  value: number;
}

const testItems: TestItem[] = [
  { id: "1", name: "Item 1", value: 100 },
  { id: "2", name: "Item 2", value: 200 },
  { id: "3", name: "Item 3", value: 300 },
];

describe("FilterDropdown Component", () => {
  // Helper function to setup the component with default props
  const setup = (props = {}) => {
    const defaultProps = {
      items: testItems,
      buttonText: "Filter Items",
      displayProperty: "name" as keyof TestItem,
      onSelectionChange: jest.fn(), // Mock function
    };

    return {
      user: userEvent.setup(),
      onSelectionChange: defaultProps.onSelectionChange,
      ...render(<FilterDropdown<TestItem> {...defaultProps} {...props} />),
    };
  };

  it("should renders with button text", () => {
    setup();
    expect(screen.getByText("Filter Items")).toBeInTheDocument();
  });

  it("should opens dropdown when button is clicked", async () => {
    const { user } = setup();

    expect(screen.queryByText("Select All")).not.toBeInTheDocument();

    await user.click(screen.getByText("Filter Items"));

    expect(screen.getByText("Select All")).toBeInTheDocument();
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();
  });

  it("should selects an item when clicked", async () => {
    const { user, onSelectionChange } = setup();

    await user.click(screen.getByText("Filter Items"));
    await user.click(screen.getByText("Item 2"));

    expect(onSelectionChange).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: "2", name: "Item 2" })])
    );
  });

  it("shold deselects an item when clicked again", async () => {
    const { user, onSelectionChange } = setup();

    await user.click(screen.getByText("Filter Items"));

    await user.click(screen.getByText("Item 1"));
    await user.click(screen.getByText("Item 1"));

    // Verify it was deselected
    expect(onSelectionChange).toHaveBeenLastCalledWith([]);
  });

  it('should selects all items when "Select All" is clicked', async () => {
    const { user, onSelectionChange } = setup();

    await user.click(screen.getByText("Filter Items"));
    await user.click(screen.getByText("Select All"));

    // Verify all items were selected
    expect(onSelectionChange).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: "1" }),
        expect.objectContaining({ id: "2" }),
        expect.objectContaining({ id: "3" }),
      ])
    );
  });

  it('should deselects all items when "Select All" is clicked after all items are selected', async () => {
    const { user, onSelectionChange } = setup();

    await user.click(screen.getByText("Filter Items"));

    await user.click(screen.getByText("Select All"));
    await user.click(screen.getByText("Select All"));

    // Verify all items were deselected
    expect(onSelectionChange).toHaveBeenLastCalledWith([]);
  });

  // Test edge case - empty items array
  it("should handles empty items array", async () => {
    const { user } = setup({ items: [] });

    // Open dropdown
    await user.click(screen.getByText("Filter Items"));

    // Only "Select All" should be visible, no items
    expect(screen.getByText("Select All")).toBeInTheDocument();
    expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
  });


});
