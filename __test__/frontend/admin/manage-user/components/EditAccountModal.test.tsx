import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditAccountModal from "@frontend/admin/manage-user/components/editAccountModal";
import userEvent from "@testing-library/user-event";
import { toast } from "react-toastify";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));
const mockedToast = toast as jest.Mocked<typeof toast>;

describe('EditAccountModal', () => {
  const mockOnClose = jest.fn();
  const mockUser = {
    id: "1",
    fullName: "Jane Doe",
    email: "jane@example.com",
    status: "Aktif",
    role: "Admin"
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should be hidden when not visible", () => {
    render(<EditAccountModal isVisible={false} onClose={mockOnClose} user={mockUser} />);
    expect(screen.getByText("Edit Akun Pengguna")).toHaveAttribute("aria-hidden", "true");
  });

  it("should render correctly when visible", () => {
    render(<EditAccountModal isVisible={true} onClose={mockOnClose} user={mockUser} />);
    expect(screen.getByText("Edit Akun Pengguna")).toBeVisible();
    expect(screen.getByDisplayValue("Jane Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("jane@example.com")).toBeInTheDocument();
  });

  it("should call onClose and clear form on Batal", async () => {
    render(<EditAccountModal isVisible={true} onClose={mockOnClose} user={mockUser} />);

    await userEvent.clear(screen.getByLabelText("Nama Lengkap"));
    await userEvent.type(screen.getByLabelText("Nama Lengkap"), "Updated Name");

    await userEvent.click(screen.getByText("Batal"));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("should show validation error if role/status is not selected", async () => {
    render(<EditAccountModal isVisible={true} onClose={mockOnClose} user={{ ...mockUser, role: "", status: "" }} />);
    await userEvent.clear(screen.getByLabelText("Nama Lengkap"));
    await userEvent.clear(screen.getByLabelText("Email"));
    await userEvent.click(screen.getByText("Simpan"));

    await waitFor(() => {
      expect(screen.getByText("Status akun harus dipilih")).toBeInTheDocument();
      expect(screen.getByText("Role harus dipilih")).toBeInTheDocument();
    });
  });

  it("should submit form with valid data", async () => {
    mockedAxios.put.mockResolvedValueOnce({ data: { success: true } });

    render(<EditAccountModal isVisible={true} onClose={mockOnClose} user={mockUser} />);

    await userEvent.clear(screen.getByLabelText("Nama Lengkap"));
    await userEvent.type(screen.getByLabelText("Nama Lengkap"), "Updated Name");

    await userEvent.click(screen.getByLabelText("Aktif"));
    await userEvent.click(screen.getByLabelText("Admin"));

    await userEvent.click(screen.getByText("Simpan"));

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(`/api/users/${mockUser.id}`, {
        name: "Updated Name",
        email: mockUser.email,
        status: "Aktif",
        role: "Admin"
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("should show error toast on API error", async () => {
    const errorMessage = "Update failed";
    mockedAxios.put.mockRejectedValueOnce({
      response: {
        data: {
          message: errorMessage
        }
      }
    });

    render(<EditAccountModal isVisible={true} onClose={mockOnClose} user={mockUser} />);

    await userEvent.click(screen.getByText("Simpan"));

    await waitFor(() => {
      expect(mockedToast.error).toHaveBeenCalledWith(
        `Update failed: ${errorMessage}`,
        expect.any(Object)
      );
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  it("should show success toast on success", async () => {
    mockedAxios.put.mockResolvedValueOnce({ data: { success: true } });

    render(<EditAccountModal isVisible={true} onClose={mockOnClose} user={mockUser} />);

    await userEvent.click(screen.getByText("Simpan"));

    await waitFor(() => {
      expect(mockedToast.success).toHaveBeenCalledWith(
        "User successfully updated",
        expect.any(Object)
      );
    });
  });
});
