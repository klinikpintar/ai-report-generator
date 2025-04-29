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

jest.mock("@frontend/admin/schema/utils/api", () => ({
  fetchPlatforms: jest.fn(),
  fetchServices: jest.fn(),
  fetchSchemas: jest.fn(),
  deleteSchema: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn((key) => (key === "page" ? "1" : null)),
  })),
}));

const renderComponent = () => {
  render(
    <SchemaProvider>
      <ToastContainer />
      <SchemaTableSection />
    </SchemaProvider>
  );
};

const setup = () => {
  (fetchPlatforms as jest.Mock).mockResolvedValueOnce(mockPlatforms);
  (fetchServices as jest.Mock).mockResolvedValueOnce(mockServices);
  (fetchSchemas as jest.Mock).mockResolvedValueOnce(mockPaginatedSchemas);
  renderComponent();
};

describe("Integration between table and filter dropdowns", () => {
  beforeEach(() => {
    setup();
  });

  it("should display the filter dropdowns (platform and service)", () => {
    const platformFilter = screen.getByText(/Filter by Platform/i);
    const serviceFilter = screen.getByText(/Filter by Service/i);

    expect(platformFilter).toBeInTheDocument();
    expect(serviceFilter).toBeInTheDocument();
  });

  it("should display error message when fetching one of the filter dropdowns fails", async () => {
    // Mock the fetchPlatforms function to throw an error
    (fetchPlatforms as jest.Mock).mockRejectedValueOnce(new Error("Failed to fetch platforms"));
    renderComponent();

    const errorMessage = await screen.findByText(/Failed to load filters data/i);
    expect(errorMessage).toBeInTheDocument();
  });

  it("should refresh the table when platform filter is selected", async () => {
    (fetchPlatforms as jest.Mock).mockResolvedValueOnce(mockPlatforms);
    (fetchServices as jest.Mock).mockResolvedValueOnce(mockServices);

    const platformFilter = screen.getByText(/Filter by Platform/i);

    // Simulate selecting a filter
    await userEvent.click(platformFilter);

    // click the first option
    const firstOption = await screen.findByRole("menuitemcheckbox", {
      name: mockPlatforms[0],
    });
    await userEvent.click(firstOption);

    // Check if the table is refreshed
    await waitFor(() => {
      expect(fetchSchemas).toHaveBeenCalled();
    });
  });

  it("should refresh the table when service filter is selected", async () => {
    (fetchPlatforms as jest.Mock).mockResolvedValueOnce(mockPlatforms);
    (fetchServices as jest.Mock).mockResolvedValueOnce(mockServices);

    const serviceFilter = screen.getByText(/Filter by Service/i);

    // Simulate selecting a filter
    await userEvent.click(serviceFilter);

    // click the first option
    const firstOption = await screen.findByRole("menuitemcheckbox", {
      name: mockServices[0].name,
    });
    await userEvent.click(firstOption);

    // Check if the table is refreshed
    await waitFor(() => {
      expect(fetchSchemas).toHaveBeenCalled();
    });
  });
});

describe("Integration between action button and modal", () => {
  beforeEach(() => {
    setup();
  });

  it("should display the add button", () => {
    const addButton = screen.getByRole("button", { name: /Tambah Skema/i });
    expect(addButton).toBeInTheDocument();
  });
  it("should display Add Modal when Add button is clicked", async () => {
    // Simulate clicking the Add button
    const addButton = screen.getByRole("button", { name: /Tambah Skema/i });
    await userEvent.click(addButton);

    // Check if the modal is displayed
    const addModal = screen.getByText(/Form Upload Skema Database/i);
    expect(addModal).toBeInTheDocument();
  });
  it("should close Add Modal when cancel button is clicked", async () => {
    // Simulate clicking the Add button
    const addButton = screen.getByRole("button", { name: /Tambah Skema/i });
    await userEvent.click(addButton);

    // Simulate clicking the cancel button
    const cancelButton = screen.getByText(/Batal/i);
    await userEvent.click(cancelButton);

    // Check if the modal is closed
    await waitFor(() => {
      expect(screen.queryByText(/Form Upload Skema Database/i)).not.toBeInTheDocument();
    });
  });

  it("should display the edit button", async () => {
    await waitFor(() => {
      const editButton = screen.getAllByRole("button", { name: /Edit/i })[0];
      expect(editButton).toBeInTheDocument();
    });
  });
  it("should display Edit Schema Modal when edit button", async () => {
    // Simulate clicking the Edit button

    const editButton = await screen.findAllByRole("button", { name: /Edit/i });
    await userEvent.click(editButton[0]);

    // Check if the modal is displayed
    const editModal = await screen.findByText(/Edit Skema Database/i);
    expect(editModal).toBeInTheDocument();
  });
  it("should close Edit Schema Modal when cancel button is clicked", async () => {
    // Simulate clicking the Edit button
    const editButton = await screen.findAllByRole("button", { name: /Edit/i });
    await userEvent.click(editButton[0]);

    // Simulate clicking the cancel button
    const cancelButton = screen.getByText(/Batal/i);
    await userEvent.click(cancelButton);

    // Check if the modal is closed
    await waitFor(() => {
      expect(screen.queryByText(/Edit Skema Database/i)).not.toBeInTheDocument();
    });
  });

  it("should display the delete button", async () => {
    await waitFor(() => {
      const deleteButton = screen.getAllByRole("button", { name: /Hapus/i })[0];
      expect(deleteButton).toBeInTheDocument();
    });
  });
  it("should display Confirmation Dialog when delete button is clicked", async () => {
    // Simulate clicking the Delete button
    const deleteButton = await screen.findAllByRole("button", { name: /Hapus/i });
    await userEvent.click(deleteButton[0]);

    // Check if the modal is displayed
    const confirmationDialog = await screen.findByText(
      /Apakah Anda yakin ingin menghapus skema ini/i
    );
    expect(confirmationDialog).toBeInTheDocument();
  });
  it("should close Confirmation Dialog when cancel button is clicked", async () => {
    // Simulate clicking the Delete button
    const deleteButton = await screen.findAllByRole("button", { name: /Hapus/i });
    await userEvent.click(deleteButton[0]);

    // Simulate clicking the cancel button
    const cancelButton = screen.getByRole("button", { name: /Batal/i });
    await userEvent.click(cancelButton);

    // Check if the modal is closed
    await waitFor(() => {
      expect(
        screen.queryByText(/Apakah Anda yakin ingin menghapus skema ini/i)
      ).not.toBeInTheDocument();
    });
  });
  it("should call delete function when delete button is clicked", async () => {
    (deleteSchema as jest.Mock).mockResolvedValueOnce({ ok: true });
    // Simulate clicking the Delete button
    const deleteButton = await screen.findAllByRole("button", { name: /Hapus/i });
    await userEvent.click(deleteButton[0]);

    // Simulate clicking the confirm button
    const confirmButton = screen.getByRole("button", { name: /Konfirmasi/i });
    await userEvent.click(confirmButton);

    // Check if the delete function is called
    expect(deleteSchema).toHaveBeenCalled();
    // Check if the success toast is displayed
    const successToast = await screen.findByText(/Skema berhasil dihapus/i);
    expect(successToast).toBeInTheDocument();
  });
  it("should not call delete function when delete button is clicked and response is not ok", async () => {
    (deleteSchema as jest.Mock).mockResolvedValueOnce({ ok: false });
    // Simulate clicking the Delete button
    const deleteButton = await screen.findAllByRole("button", { name: /Hapus/i });
    await userEvent.click(deleteButton[0]);

    // Simulate clicking the confirm button
    const confirmButton = screen.getByRole("button", { name: /Konfirmasi/i });
    await userEvent.click(confirmButton);

    // Check if the delete function is called
    expect(deleteSchema).toHaveBeenCalled();
    // Check if the error toast is displayed
    const errorToast = await screen.findByText(/Gagal menghapus skema/i);
    expect(errorToast).toBeInTheDocument();
  });

  it("should display the view button", async () => {
    await waitFor(() => {
      const viewButton = screen.getAllByRole("button", { name: /File/i })[0];
      expect(viewButton).toBeInTheDocument();
    });
  });
  it("should display View Schema Modal when view button is clicked", async () => {
    // Simulate clicking the View button
    const viewButton = await screen.findAllByRole("button", { name: /File/i });
    await userEvent.click(viewButton[0]);

    // Check if the modal is displayed
    const viewModal = await screen.findByText(`Skema ${mockPaginatedSchemas.data[0].name}`);
    expect(viewModal).toBeInTheDocument();
  });
});
