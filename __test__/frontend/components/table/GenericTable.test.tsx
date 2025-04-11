import { render, screen } from "@testing-library/react";
import { GenericTable, type GenericTableProps } from "@frontend/components/table";

// Define a test data type
interface TestItem {
  id: number;
  name: string;
  description: string;
}

// Mock data for testing
const mockData: TestItem[] = [
  { id: 1, name: "Item 1", description: "Description 1" },
  { id: 2, name: "Item 2", description: "Description 2" },
  { id: 3, name: "Item 3", description: "Description 3" },
];

// Default test props
const createDefaultProps = (
  overrides: Partial<GenericTableProps<TestItem>> = {}
): GenericTableProps<TestItem> => ({
  columns: [
    {
      key: "name",
      header: "Name",
      renderCell: (item) => item.name,
    },
    {
      key: "description",
      header: "Description",
      renderCell: (item) => item.description,
    },
    {
      key: "actions",
      header: "Actions",
      renderCell: () => <button>Edit</button>,
      width: "100px",
    },
  ],
  data: mockData,
  isLoading: false,
  keyExtractor: (item) => item.id,
  ...overrides,
});

describe("GenericTable Component", () => {
  it("should render the table columns correctly", () => {
    render(<GenericTable {...createDefaultProps()} />);

    // Check that all column headers are rendered
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("should render the table data correctly", () => {
    render(<GenericTable {...createDefaultProps()} />);

    // Check that all data cells are rendered
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Description 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Description 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();
    expect(screen.getByText("Description 3")).toBeInTheDocument();

    // Check that action buttons are rendered for each row
    const editButtons = screen.getAllByText("Edit");
    expect(editButtons).toHaveLength(3);
  });

  it("should render loading message when isLoading is true", () => {
    render(
      <GenericTable
        {...createDefaultProps({
          isLoading: true,
          data: [],
        })}
      />
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should render empty message when data is empty and not loading", () => {
    render(
      <GenericTable
        {...createDefaultProps({
          isLoading: false,
          data: [],
        })}
      />
    );

    expect(screen.getByText("No data found")).toBeInTheDocument();
  });

  it("should render custom loading message when provided", () => {
    render(
      <GenericTable
        {...createDefaultProps({
          isLoading: true,
          data: [],
          loadingMessage: "Custom loading message",
        })}
      />
    );

    expect(screen.getByText("Custom loading message")).toBeInTheDocument();
  });

  it("should render custom empty message when provided", () => {
    render(
      <GenericTable
        {...createDefaultProps({
          isLoading: false,
          data: [],
          emptyMessage: "Custom empty message",
        })}
      />
    );

    expect(screen.getByText("Custom empty message")).toBeInTheDocument();
  });

  it("should apply column width styles correctly", () => {
    render(<GenericTable {...createDefaultProps()} />);

    // Get the table headers
    const headers = screen.getAllByRole("columnheader");

    // Check that the width style is applied to the actions column
    expect(headers[2]).toHaveStyle({ width: "100px" });
  });

  it("should handle complex cell renderers correctly", () => {
    const complexProps = createDefaultProps({
      columns: [
        {
          key: "complex",
          header: "Complex Cell",
          renderCell: (item) => (
            <div data-testid={`complex-${item.id}`}>
              <span className="name">{item.name}</span>
              <span className="description">{item.description}</span>
            </div>
          ),
        },
      ],
    });

    render(<GenericTable {...complexProps} />);

    // Check that complex cell renderers work correctly
    expect(screen.getByTestId("complex-1")).toBeInTheDocument();
    expect(screen.getByTestId("complex-2")).toBeInTheDocument();
    expect(screen.getByTestId("complex-3")).toBeInTheDocument();
  });

  it("should handle large datasets efficiently", () => {
    // Create a large dataset
    const largeData = Array.from({ length: 100 }, (_, index) => ({
      id: index + 1,
      name: `Item ${index + 1}`,
      description: `Description ${index + 1}`,
    }));

    render(
      <GenericTable
        {...createDefaultProps({
          data: largeData,
        })}
      />
    );

    // Check that the first and last items are rendered
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 100")).toBeInTheDocument();

    // Check that all rows are rendered
    const rows = screen.getAllByRole("row");
    // +1 for the header row
    expect(rows).toHaveLength(101);
  });
});
