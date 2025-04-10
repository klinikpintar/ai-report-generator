import { UserTable } from "@frontend/admin/manage-user/components/UserTable";
import { User } from "@frontend/admin/manage-user/types/user";
import { render, screen } from "@testing-library/react";

const adminUser: User = {
  id: "1d305868-e285-44df-8fb4-9e24ad73f0a1",
  email: "maya@gmail.com",
  name: "Maya",
  role: "ADMIN",
  isActive: true,
};

const businessAnalystUser: User = {
  id: "2d305868-e285-44df-8fb4-9e24ad73f0a2",
  email: "rudi@gmail.com",
  name: "Rudi",
  role: "BUSINESS_ANALYST",
  isActive: false,
};

describe("UserTable", () => {
  const setup = () => {
    const users: User[] = [adminUser, businessAnalystUser];
    render(<UserTable users={users} />);
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

  describe("UserTable rows", () => {
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
  });
});
