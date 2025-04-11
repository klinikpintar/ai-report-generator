import { UserTable } from "@frontend/admin/manage-user/components/UserTable";
import { User } from "@frontend/admin/manage-user/types/user";
import { render, screen } from "@testing-library/react";
import { adminUser, businessAnalystUser } from "@/__mocks__/user-data";
import { UserTableProvider } from "@frontend/admin/manage-user/context/UserTableContext";
import { fetchUsers } from "@frontend/admin/manage-user/utils/api";
import { ToastContainer } from "react-toastify";

const mockUsers: User[] = [adminUser, businessAnalystUser];

jest.mock("@frontend/admin/manage-user/utils/api", () => ({
  fetchUsers: jest.fn(() => Promise.resolve({ data: mockUsers, pagination: { total_pages: 1 } })),
}));

// mock the router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

describe("UserTable", () => {
  const setup = () => {
    render(
      <>
        <ToastContainer />
        <UserTableProvider>
          <UserTable />
        </UserTableProvider>
      </>
    );
  };

  beforeEach(() => {
    setup();
  });

  describe("Column header of UserTable", () => {
    it("should render Nama Lengkap column header", async () => {
      const nameHeader = await screen.findByText("Nama Lengkap");
      expect(nameHeader).toBeInTheDocument();
    });
    it("should render Email column header", async () => {
      const emailHeader = await screen.findByText("Email");
      expect(emailHeader).toBeInTheDocument();
    });
    it("should render Role column header", async () => {
      const roleHeader = await screen.findByText("Role");
      expect(roleHeader).toBeInTheDocument();
    });
    it("should render Status column header", async () => {
      const statusHeader = await screen.findByText("Status");
      expect(statusHeader).toBeInTheDocument();
    });
    it("should render Aksi column header", async () => {
      const actionHeader = await screen.findByText("Aksi");
      expect(actionHeader).toBeInTheDocument();
    });
  });

  describe("UserTable data", () => {
    // Positive test cases
    it("should render the user full name", async () => {
      const nameCell = await screen.findByText(adminUser.name);
      expect(nameCell).toBeInTheDocument();
    });
    it("should render the user email", async () => {
      const emailCell = await screen.findByText(adminUser.email);
      expect(emailCell).toBeInTheDocument();
    });
    it("should render the user role for admin", async () => {
      const roleCell = await screen.findByText("Admin");
      expect(roleCell).toBeInTheDocument();
    });
    it("should render the user role for business analyst", async () => {
      const roleCell = await screen.findByText("Business Analyst");
      expect(roleCell).toBeInTheDocument();
    });
    it("should render the user status for active user", async () => {
      const statusCell = await screen.findByText("Aktif");
      expect(statusCell).toBeInTheDocument();
    });
    it("should render the user status for inactive user", async () => {
      const statusCell = await screen.findByText("Nonaktif");
      expect(statusCell).toBeInTheDocument();
    });
    it("should render the edit button", async () => {
      const editButtons = await screen.findAllByRole("button", { name: /Edit/i });
      expect(editButtons).toHaveLength(2);
      expect(editButtons[0]).toBeInTheDocument();
    });
    it("should render the delete button", async () => {
      const deleteButtons = await screen.findAllByRole("button", { name: /Hapus/i });
      expect(deleteButtons).toHaveLength(2);
      expect(deleteButtons[0]).toBeInTheDocument();
    });

    // Negative test cases
    it("should display error message when fetching users fails", async () => {
      (fetchUsers as jest.Mock).mockRejectedValueOnce(new Error("Failed to fetch users"));
      setup();
      const errorMessage = await screen.findByText("Gagal memuat data pengguna");
      expect(errorMessage).toBeInTheDocument();
    });
  });

  describe("UserTable pagination", () => {
    it("should render pagination component", async () => {
      const prevButton = await screen.findByRole("button", { name: /Sebelumnya/i });
      const nextButton = await screen.findByRole("button", { name: /Selanjutnya/i });
      expect(prevButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
    });

    describe("UserTable pagination with URL query", () => {
      it("should activate page link 1 when query page is not set", async () => {
        const firstPageLink = await screen.findByRole("link", { name: "1" });
        expect(firstPageLink).toHaveAttribute("aria-current", "page");
      });
    });
  });
});
