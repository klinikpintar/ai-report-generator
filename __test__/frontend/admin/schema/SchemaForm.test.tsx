import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SchemaForm from "@frontend/admin/schema/components/SchemaForm";
import userEvent from "@testing-library/user-event";

const mockFormData = {
  name: "Test Schema",
  description: "Test Description",
  schemaText: "",
  serviceId: "",
  fileName: "dummy.sql",
};

describe("SchemaForm", () => {
  const handleChange = jest.fn();
  const handleSubmit = jest.fn((e) => e.preventDefault());
  const handleFileChange = jest.fn();
  const onClose = jest.fn();
  const clearForm = jest.fn();
  const fileInputRef = { current: null };

  const setup = (showFileInput = false) => {
    render(
      <SchemaForm
        showFileInput={showFileInput}
        fileInputRef={fileInputRef}
        formData={mockFormData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleFileChange={handleFileChange}
        onClose={onClose}
        clearForm={clearForm}
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve([{ id: "1", name: "Service 1", platformCode: "P1" }]),
      })
    ) as jest.Mock;
  });

  it("✅ should render all inputs correctly", async () => {
    setup();

    expect(await screen.findByLabelText(/Nama Skema/i)).toBeInTheDocument();
    expect(
      await screen.findByLabelText(/Deskripsi Skema/i)
    ).toBeInTheDocument();
    expect(await screen.findByRole("combobox")).toBeInTheDocument(); // <= Ini diperbaiki
  });

  it("✅ should call handleChange when inputs are changed", async () => {
    setup();

    const nameInput = await screen.findByLabelText(/Nama Skema/i);
    await userEvent.type(nameInput, "New Name");

    expect(handleChange).toHaveBeenCalled();
  });

  it("✅ should call handleSubmit when Simpan button is clicked", async () => {
    setup();

    const saveButton = await screen.findByRole("button", { name: /Simpan/i });
    await userEvent.click(saveButton);

    expect(handleSubmit).toHaveBeenCalled();
  });

  it("✅ should call handleFileChange when a file is uploaded", async () => {
    setup(true); // show file input

    const uploadInput = await screen.findByLabelText(
      /Upload File Skema di sini/i
    );
    const file = new File(["dummy"], "dummy.sql", { type: "text/sql" });

    await userEvent.upload(uploadInput, file);

    expect(handleFileChange).toHaveBeenCalled();
  });

  it("✅ should display uploaded file name if fileName exists", async () => {
    setup(true);

    expect(await screen.findByText(/dummy.sql/i)).toBeInTheDocument();
  });

  it("✅ should call onClose and clearForm when Batal button clicked", async () => {
    setup();

    const cancelButton = await screen.findByRole("button", { name: /Batal/i });
    await userEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
    expect(clearForm).toHaveBeenCalled();
  });

  it("✅ should fetch services and populate select options", async () => {
    setup();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/service");
      expect(screen.getByText(/Service 1/i)).toBeInTheDocument();
    });
  });
});
