import { SchemaTable } from "@frontend/admin/schema/components";
import { Schema } from "@frontend/admin/schema/types";
import { render, screen } from "@testing-library/react";

const mockSchema: Schema = {
  id: 1,
  name: "Pasien Portal V1",
  description: "Test Description",
  schemaText: "Test Schema Text",
  service: {
    id: 1,
    name: "patient",
    platform: {
      id: 1,
      name: "PostgreSQL",
      color: "#000000",
    },
  },
};

jest.mock("@frontend/admin/schema/hooks", () => ({
  useSchemaTable: jest.fn(() => ({
    schemas: [mockSchema],
    isLoading: false,
    currentPage: 1,
    lastPage: 1,
    handlePageChange: jest.fn(),
  })),
}));

describe("SchemaTable", () => {
  const setup = (
    onEditSchema = jest.fn(),
    onDeleteSchema = jest.fn(),
    onViewSchema = jest.fn()
  ) => {
    render(
      <SchemaTable
        onEditSchema={onEditSchema}
        onDeleteSchema={onDeleteSchema}
        onViewSchema={onViewSchema}
      />
    );
    return { onEditSchema, onDeleteSchema, onViewSchema };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should display column title of schema name", () => {
    setup();
    expect(screen.getByText("Nama Skema")).toBeInTheDocument();
  });
  it("should display column data of schema name", () => {
    setup();
    expect(screen.getByText(mockSchema.name)).toBeInTheDocument();
  });

  it("should display column title of platform", () => {
    setup();
    expect(screen.getByText("Platform")).toBeInTheDocument();
  });
  it("should display column data of platform", () => {
    setup();
    expect(screen.getByText(mockSchema.service?.platform?.name || "")).toBeInTheDocument();
  });

  it("should display column title of service", () => {
    setup();
    expect(screen.getByText("Service")).toBeInTheDocument();
  });
  it("should display column data of service", () => {
    setup();
    expect(screen.getByText(mockSchema.service?.name || "")).toBeInTheDocument();
  });

  it("should display column title of file view", () => {
    setup();
    expect(screen.getAllByText("File")[0]).toBeInTheDocument();
  });
  it("should display button of file view", () => {
    setup();
    const fileButton = screen.getByRole("button", { name: /File/i });
    expect(fileButton).toBeInTheDocument();
  });
  it("should call onViewSchema when file view button is clicked", () => {
    const { onViewSchema } = setup();
    const fileButton = screen.getByRole("button", { name: /File/i });
    fileButton.click();
    expect(onViewSchema).toHaveBeenCalledWith(mockSchema);
  });

  it("should display column title of actions", () => {
    setup();
    expect(screen.getByText("Aksi")).toBeInTheDocument();
  });
  it("should display button of delete schema", () => {
    setup();
    const deleteButton = screen.getByRole("button", { name: /Hapus/i });
    expect(deleteButton).toBeInTheDocument();
  });
  it("should call onDeleteSchema when delete schema button is clicked", () => {
    const { onDeleteSchema } = setup();
    const deleteButton = screen.getByRole("button", { name: /Hapus/i });
    deleteButton.click();
    expect(onDeleteSchema).toHaveBeenCalledWith(mockSchema);
  });
  it("should display button of edit schema", () => {
    setup();
    const editButton = screen.getByRole("button", { name: /Edit/i });
    expect(editButton).toBeInTheDocument();
  });
  it("should call onEditSchema when edit schema button is clicked", () => {
    const { onEditSchema } = setup();
    const editButton = screen.getByRole("button", { name: /Edit/i });
    editButton.click();
    expect(onEditSchema).toHaveBeenCalledWith(mockSchema);
  });

  it("should pagination button", () => {
    setup();
    const paginationButton = screen.getByRole("button", { name: /Sebelumnya/i });
    expect(paginationButton).toBeInTheDocument();
  });
});
