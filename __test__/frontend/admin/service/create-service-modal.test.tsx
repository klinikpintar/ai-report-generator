import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateServiceModal from "@frontend/admin/service/components/create-service-modal";

const mockServices = [
  { id: "1", name: "Reservasi", db: "PostgreSQL" },
  { id: "2", name: "Keuangan", db: "MySQL" },
];

global.fetch = jest.fn();

describe("Create Service Modal Test", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should not appear when first rendered", () => {
    render(<CreateServiceModal isVisible={false} onClose={() => {}} />);

    expect(
      screen.queryByText(/Daftar Service Klinik Pintar/i)
    ).not.toBeInTheDocument();
  });

  it("Should call the 'handleClose' function when 'Batal' button is clicked", () => {
    const handleClose = jest.fn();
    render(<CreateServiceModal isVisible={true} onClose={handleClose} />);

    fireEvent.click(screen.getByText("Batal"));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("Should fetch and display services when modal is visible", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockServices,
    });

    render(<CreateServiceModal isVisible={true} onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("Reservasi")).toBeInTheDocument();
      expect(screen.getByText("Keuangan")).toBeInTheDocument();
    });
  });

  it("Should add a new service when form is submitted", async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockServices,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: "bc351f87-732d-4b53-a80c-c9f7c9c61fd9",
          name: "Kesehatan",
          platformCode: "MongoDB",
        }),
      });

    render(<CreateServiceModal isVisible={true} onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("Reservasi")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Masukkan nama service"), {
      target: { value: "Kesehatan" },
    });
    fireEvent.change(screen.getByText("Pilih Platform Service"), {
      target: { value: "MongoDB" },
    });
    fireEvent.click(screen.getByText("Tambah"));

    await waitFor(() => {
      expect(screen.getByText("Kesehatan")).toBeInTheDocument();
    });
  });

  it("Should not add a service with a duplicate name", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockServices,
    });

    render(<CreateServiceModal isVisible={true} onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("Reservasi")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Masukkan nama service"), {
      target: { value: "Reservasi" },
    });
    fireEvent.change(screen.getByText("Pilih Platform Service"), {
      target: { value: "MongoDB" },
    });
    fireEvent.click(screen.getByText("Tambah"));

    await waitFor(() => {
      expect(screen.queryAllByText("Reservasi")).toHaveLength(1);
    });
  });

  it("Should delete a service when the delete button is clicked", async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockServices,
      })
      .mockResolvedValueOnce({ ok: true });

    render(<CreateServiceModal isVisible={true} onClose={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("Reservasi")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTestId("delete-service-button")[0]);
    fireEvent.click(screen.getByText("Konfirmasi"));

    await waitFor(() => {
      expect(screen.queryByText("Reservasi")).not.toBeInTheDocument();
    });
  });
});
