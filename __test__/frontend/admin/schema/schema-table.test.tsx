import { SchemaTable } from "@frontend/admin/schema/components";
import { Schema } from "@frontend/admin/schema/types";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastContainer } from "react-toastify";
import { deleteSchema } from "@frontend/admin/schema/utils/api";

jest.mock("@frontend/admin/schema/utils/api", () => ({
  deleteSchema: jest.fn(),
}));

// Mock data for testing
const mockSchemas: Schema[] = [
  {
    id: 1,
    name: "Schema A",
    description: "Schema A description",
    schemaText: "Schema A text",
    createdAt: new Date(),
    modifiedAt: new Date(),
    service: {
      id: 1,
      name: "Service A",
      createdAt: new Date(),
      modifiedAt: new Date(),
      platform: {
        id: 1,
        name: "Platform A",
        img_url: "https://via.placeholder.com/150",
        createdAt: new Date(),
        modifiedAt: new Date(),
      },
    },
  },
  {
    id: 2,
    name: "Schema B",
    description: "Schema B description",
    schemaText: "Schema B text",
    createdAt: new Date(),
    modifiedAt: new Date(),
    service: {
      id: 2,
      name: "Service B",
      createdAt: new Date(),
      modifiedAt: new Date(),
      platform: {
        id: 2,
        name: "Platform B",
        img_url: "https://via.placeholder.com/150",
        createdAt: new Date(),
        modifiedAt: new Date(),
      },
    },
  },
];

describe("SchemaTable Component", () => {
  it("should render the table columns correctly", () => {
    render(<SchemaTable schemas={mockSchemas} />);
    const schemaTable = screen.getByTestId("schema-table");
    const headerRow = within(schemaTable).getAllByRole("row")[0];

    expect(within(headerRow).getByText("Nama Skema")).toBeInTheDocument();
    expect(within(headerRow).getByText("Platform")).toBeInTheDocument();
    expect(within(headerRow).getByText("Service")).toBeInTheDocument();
    expect(within(headerRow).getAllByText("File")[0]).toBeInTheDocument();
    expect(within(headerRow).getByText("Aksi")).toBeInTheDocument();
  });

  it("should render the table data correctly", () => {
    render(<SchemaTable schemas={mockSchemas} />);

    expect(screen.getByText("Schema A")).toBeInTheDocument();
    expect(screen.getByText("Platform A")).toBeInTheDocument();
    expect(screen.getByText("Service A")).toBeInTheDocument();

    expect(screen.getByText("Schema B")).toBeInTheDocument();
    expect(screen.getByText("Platform B")).toBeInTheDocument();
    expect(screen.getByText("Service B")).toBeInTheDocument();
  });

  it("should render pagination correctly", () => {
    const currentPage = 2;
    const lastPage = 5;
    render(<SchemaTable schemas={mockSchemas} currentPage={currentPage} lastPage={lastPage} />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  // Negative test case
  it("should handle empty schemas array gracefully", () => {
    render(<SchemaTable schemas={[]} />);

    expect(screen.getByText(/tidak ada skema yang ditemukan/i)).toBeInTheDocument();
  });

  // Edge case
  it("should render pagination ellipsis correctly for large page numbers", () => {
    const currentPage = 5;
    const lastPage = 10;
    render(<SchemaTable schemas={mockSchemas} currentPage={currentPage} lastPage={lastPage} />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getAllByText("...")[0]).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getAllByText("...")[1]).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("should render pagination correctly for the first page", () => {
    const currentPage = 1;
    const lastPage = 10;
    render(<SchemaTable schemas={mockSchemas} currentPage={currentPage} lastPage={lastPage} />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("...")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("should render pagination correctly for the last page", () => {
    const currentPage = 19;
    const lastPage = 10;
    render(<SchemaTable schemas={mockSchemas} currentPage={currentPage} lastPage={lastPage} />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("...")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("should render pagination next and previous buttons correctly", () => {
    const currentPage = 2;
    const lastPage = 5;
    render(<SchemaTable schemas={mockSchemas} currentPage={currentPage} lastPage={lastPage} />);

    expect(screen.getByText(/sebelumnya/i)).toBeInTheDocument();
    expect(screen.getByText(/selanjutnya/i)).toBeInTheDocument();
  });

  it("should open edit schema modal when edit button is clicked", async () => {
    render(<SchemaTable schemas={mockSchemas} />);
    const editButton = screen.getAllByText(/Edit/i)[0];

    await userEvent.click(editButton);
    expect(screen.getByText(/Edit Skema Database/i)).toBeInTheDocument();
  });

  it("should close edit schema modal when close button is clicked", async () => {
    render(<SchemaTable schemas={mockSchemas} />);
    const editButton = screen.getAllByText(/Edit/i)[0];

    await userEvent.click(editButton);
    const closeButton = screen.getByText(/Batal/i);

    await userEvent.click(closeButton);
    expect(screen.queryByText(/Edit Skema Database/i)).not.toBeInTheDocument();
  });

  it("should open confirmation dialog when delete button is clicked", async () => {
    render(<SchemaTable schemas={mockSchemas} />);
    const deleteButton = screen.getAllByText(/Hapus/i)[0];

    await userEvent.click(deleteButton);
    expect(screen.getByText(/Apakah Anda yakin ingin menghapus skema ini?/i)).toBeInTheDocument();
  });

  it("should close confirmation dialog when cancel button is clicked", async () => {
    render(<SchemaTable schemas={mockSchemas} />);
    const deleteButton = screen.getAllByText(/Hapus/i)[0];

    await userEvent.click(deleteButton);
    const cancelButton = screen.getByText(/Batal/i);

    await userEvent.click(cancelButton);
    expect(screen.queryByText(/Apakah Anda yakin ingin menghapus skema ini?/i)).not.toBeInTheDocument();
  });

  it("should render success message when schema is deleted", async () => {
    (deleteSchema as jest.Mock).mockResolvedValueOnce({ ok: true });

    render(
      <>
        <SchemaTable schemas={mockSchemas} />
        <ToastContainer />
      </>
    );
    const deleteButton = screen.getAllByText(/Hapus/i)[0];

    await userEvent.click(deleteButton);
    const confirmButton = screen.getByText(/Konfirmasi/i);

    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/Skema berhasil dihapus/i)).toBeInTheDocument();
    });
  });

  it("should render error message when schema deletion fails", async () => {
    (deleteSchema as jest.Mock).mockResolvedValueOnce({ ok: false });
    render(
      <>
        <SchemaTable schemas={mockSchemas} />
        <ToastContainer />
      </>
    );
    const deleteButton = screen.getAllByText(/Hapus/i)[0];

    await userEvent.click(deleteButton);
    const confirmButton = screen.getByText(/Konfirmasi/i);

    await userEvent.click(confirmButton);

    expect(screen.getByText(/Gagal menghapus skema/i)).toBeInTheDocument();
  });
});
