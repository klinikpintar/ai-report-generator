import { FilterByRoleDropdown } from "@frontend/admin/manage-user/components/FilterByRoleDropdown";
import { UserTableProvider } from "@frontend/admin/manage-user/context/UserTableContext";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();

describe("FilterByRoleDropdown", () => {
  const setup = () => {
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    render(
      <UserTableProvider>
        <FilterByRoleDropdown />
      </UserTableProvider>
    );
  };

  const openDropdown = async () => {
    const dropdownButtons = await screen.findAllByText(/Filter by Role/i);
    await userEvent.click(dropdownButtons[0]);
  };
  

  beforeEach(() => {
    mockPush.mockClear();
    window.history.pushState({}, "", "/admin/manage-user");
    setup();
  });

  it("should display the 'Filter by Role' dropdown button", async () => {
    const dropdownButton = await screen.findByText(/Filter by Role/i);
    expect(dropdownButton).toBeInTheDocument();
  });

  it("should display the Select All choice after user click dropdown button", async () => {
    await openDropdown();
    const selectAllChoice = await screen.findByText(/Select All/i);
    expect(selectAllChoice).toBeInTheDocument();
  });

  it("should display the Admin choice after user click dropdown button", async () => {
    await openDropdown();
    const adminChoice = await screen.findByText(/Admin/i);
    expect(adminChoice).toBeInTheDocument();
  });

  it("should display the Business Analyst choice after user click dropdown button", async () => {
    await openDropdown();
    const businessAnalystChoice = await screen.findByText(/Business Analyst/i);
    expect(businessAnalystChoice).toBeInTheDocument();
  });

  it("should update URL when a role is selected", async () => {
    await openDropdown();
    const analystOption = await screen.findByText(/Business Analyst/i);
    await userEvent.click(analystOption);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin/manage-user?role=BUSINESS_ANALYST");
    });
  });

  it("should initialize filter from URL", async () => {
    // Setup URL with role
    window.history.pushState({}, "", "/admin/manage-user?role=BUSINESS_ANALYST");
    setup();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin/manage-user?role=BUSINESS_ANALYST");
    });
  });

  it("should remove role from URL when role is deselected", async () => {
    window.history.pushState({}, "", "/admin/manage-user?role=BUSINESS_ANALYST");
    setup();
  
    await openDropdown();
  
    const analystOption = await screen.findByText(/Business Analyst/i);
    await userEvent.click(analystOption);
    await userEvent.click(analystOption);
  
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/admin/manage-user?");
    });
  });

  it("should return null and not set filter when role in URL is invalid", async () => {
    window.history.pushState({}, "", "/admin/manage-user?role=INVALID_ROLE");
    setup();
  
    await waitFor(() => {
      // Karena invalid, maka router.push tidak akan dipanggil ulang
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
  
});
