import { SchemaProvider } from "@frontend/admin/schema/context/SchemaContext";
import { SchemaTableSection } from "@frontend/admin/schema/sections";
import { mockPaginatedSchemas, mockPlatforms, mockServices } from "@/__mocks__/schema-data";
import { render, screen, waitFor } from "@testing-library/react";
import {
  deleteSchema,
  fetchPlatforms,
  fetchServices,
  fetchSchemas,
} from "@frontend/admin/schema/utils/api";
import userEvent from "@testing-library/user-event";
import { ToastContainer } from "react-toastify";

// Mock the components to reduce test complexity
jest.mock("@frontend/admin/schema/components", () => ({
  SchemaFilters: () => <div data-testid="schema-filters">Filters Component</div>,
  SchemaTable: ({ onEditSchema, onDeleteSchema, onViewSchema }: { 
    onEditSchema: (schema: any) => void, 
    onDeleteSchema: (schema: any) => void, 
    onViewSchema: (schema: any) => void 
  }) => (
    <div data-testid="schema-table">
      <button onClick={() => onEditSchema(mockPaginatedSchemas.data[0])}>Edit</button>
      <button onClick={() => onDeleteSchema(mockPaginatedSchemas.data[0])}>Hapus</button>
      <button onClick={() => onViewSchema(mockPaginatedSchemas.data[0])}>File</button>
      Table Component
    </div>
  ),
}));

// Mock the API calls
jest.mock("@frontend/admin/schema/utils/api", () => ({
  fetchPlatforms: jest.fn().mockResolvedValue([]),
  fetchServices: jest.fn().mockResolvedValue([]),
  fetchSchemas: jest.fn().mockResolvedValue({ data: [], pagination: { total_pages: 1 } }),
  deleteSchema: jest.fn().mockResolvedValue({ ok: true }),
}));

// Mock the context for better performance
jest.mock("@frontend/admin/schema/context/SchemaContext", () => ({
  SchemaProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useSchemaContext: () => ({
    state: {
      data: mockPaginatedSchemas.data,
      isLoading: false,
      error: null,
      pagination: { currentPage: 1, lastPage: 1 },
      filters: {
        platform: { all: mockPlatforms, selected: mockPlatforms },
        service: { all: mockServices, selected: mockServices },
      },
    },
    dispatch: jest.fn(),
  }),
}));

// Mock the router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn((key) => (key === "page" ? "1" : null)),
  })),
}));

// Mock the hooks
jest.mock("@frontend/admin/schema/hooks", () => ({
  useSchemaActions: () => ({
    handleDeleteSchema: jest.fn().mockResolvedValue(true),
  }),
}));

jest.mock("@frontend/admin/schema/hooks/useRefreshSchema", () => ({
  useRefreshSchema: () => ({
    refreshSchemas: jest.fn(),
  }),
}));

// Mock event bus to prevent memory leaks
jest.mock("@frontend/common/utils/event-bus", () => ({
  eventBus: {
    subscribe: jest.fn(() => jest.fn()),
    publish: jest.fn(),
  },
  EVENTS: {
    SERVICE_UPDATED: "service_updated",
  },
}));

describe("SchemaTableSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the component with filters and table", () => {
    render(
      <SchemaProvider>
        <ToastContainer />
        <SchemaTableSection />
      </SchemaProvider>
    );

    expect(screen.getByTestId("schema-filters")).toBeInTheDocument();
    expect(screen.getByTestId("schema-table")).toBeInTheDocument();
    expect(screen.getByText("Tambah Skema")).toBeInTheDocument();
  });

  test("opens and closes add modal", async () => {
    render(
      <SchemaProvider>
        <ToastContainer />
        <SchemaTableSection />
      </SchemaProvider>
    );
    
    const user = userEvent.setup();
    
    // Open modal
    await user.click(screen.getByText("Tambah Skema"));
    expect(screen.getByText("Form Upload Skema Database")).toBeInTheDocument();
    
    // Close modal
    await user.click(screen.getByText("Batal"));
    await waitFor(() => {
      expect(screen.queryByText("Form Upload Skema Database")).not.toBeInTheDocument();
    });
  });

  test("opens and closes edit modal", async () => {
    render(
      <SchemaProvider>
        <ToastContainer />
        <SchemaTableSection />
      </SchemaProvider>
    );
    
    const user = userEvent.setup();
    
    // Open edit modal
    await user.click(screen.getByText("Edit"));
    expect(screen.getByText("Edit Skema Database")).toBeInTheDocument();
    
    // Close modal
    await user.click(screen.getByText("Batal"));
    await waitFor(() => {
      expect(screen.queryByText("Edit Skema Database")).not.toBeInTheDocument();
    });
  });

  test("opens and closes delete confirmation dialog", async () => {
    render(
      <SchemaProvider>
        <ToastContainer />
        <SchemaTableSection />
      </SchemaProvider>
    );
    
    const user = userEvent.setup();
    
    // Open delete dialog
    await user.click(screen.getByText("Hapus"));
    expect(screen.getByText("Apakah Anda yakin ingin menghapus skema ini?")).toBeInTheDocument();
    
    // Close dialog
    await user.click(screen.getByText("Batal"));
    await waitFor(() => {
      expect(screen.queryByText("Apakah Anda yakin ingin menghapus skema ini?")).not.toBeInTheDocument();
    });
  });
});