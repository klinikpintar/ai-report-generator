import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { FilterDropdown } from "@frontend/components/FilterDropdown";
import { useState } from "react";

interface TestItem {
  id: number;
  name: string;
  value: number;
}

const testItems: TestItem[] = [
  { id: 1, name: "Item 1", value: 100 },
  { id: 2, name: "Item 2", value: 200 },
  { id: 3, name: "Item 3", value: 300 },
];

const openDropdown = async (user: UserEvent) => {
  await user.click(screen.getByText("Filter Items"));
};

const renderComponent = () => {
  const FilterDropdownWrapper = () => {
    const [selectedItems, setSelectedItems] = useState<TestItem[]>([]);
    return (
      <FilterDropdown<TestItem>
        items={testItems}
        selectedItems={selectedItems}
        buttonText="Filter Items"
        onSelectionChange={setSelectedItems}
        renderItem={(item) => item.name}
        getKey={(item) => item.id}
      />
    );
  };
  render(<FilterDropdownWrapper />);
};

describe("FilterDropdown Component", () => {
  const setup = () => {
    renderComponent();
    return {
      user: userEvent.setup(),
    };
  };

  it("should display button text", () => {
    setup();
    expect(screen.getByText("Filter Items")).toBeInTheDocument();
  });

  it("should display dropdown content when button is clicked", async () => {
    const { user } = setup();

    await openDropdown(user);

    expect(screen.getByText("Select All")).toBeInTheDocument();
    for (const item of testItems) {
      expect(screen.getByText(item.name)).toBeInTheDocument();
    }
  });

  it("should select an item when clicked", async () => {
    const { user } = setup();
    const item = testItems[0];

    await openDropdown(user);
    await user.click(screen.getByText(item.name));

    await waitFor(() => {
      expect(screen.getByText(item.name)).toBeChecked();
    });
  });

  it("should deselect an item when clicked again", async () => {
    const { user } = setup();
    const item = testItems[0];

    await openDropdown(user);
    await user.click(screen.getByText(item.name));
    await user.click(screen.getByText(item.name));

    await waitFor(() => {
      expect(screen.getByText(item.name)).not.toBeChecked();
    });
  });

  it('should select all items when "Select All" is clicked', async () => {
    const { user } = setup();

    await openDropdown(user);
    await user.click(screen.getByText("Select All"));

    await waitFor(() => {
      for (const item of testItems) {
        expect(screen.getByText(item.name)).toBeChecked();
      }
    });
  });

  it('should deselect all items when "Select All" is clicked again', async () => {
    const { user } = setup();

    await openDropdown(user);
    await user.click(screen.getByText("Select All"));
    await user.click(screen.getByText("Select All"));

    await waitFor(() => {
      for (const item of testItems) {
        expect(screen.getByText(item.name)).not.toBeChecked();
      }
    });
  });
});
