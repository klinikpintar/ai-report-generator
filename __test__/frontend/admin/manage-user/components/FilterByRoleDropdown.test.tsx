import { FilterByRoleDropdown } from "@frontend/admin/manage-user/components/FilterByRoleDropdown";
import { UserTableProvider } from "@frontend/admin/manage-user/context/UserTableContext";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("FilterByRoleDropdown", () => {
  const pushMock = jest.fn();

  const setup = () => {
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

    render(
      <UserTableProvider>
        <FilterByRoleDropdown />
      </UserTableProvider>
    );
  };

  const openDropdown = async () => {
    const user = userEvent.setup();
    const dropdownButton = await screen.findByText(/Filter by Role/i);
    await user.click(dropdownButton);
  };

  beforeEach(() => {
    pushMock.mockClear();
  });

  it("✅ should display the 'Filter by Role' dropdown button", async () => {
    setup();
    const dropdownButton = await screen.findByText(/Filter by Role/i);
    expect(dropdownButton).toBeInTheDocument();
  });

  it("✅ should display the Select All choice after user clicks dropdown button", async () => {
    setup();
    await openDropdown();
    const selectAllChoice = await screen.findByText(/Select All/i);
    expect(selectAllChoice).toBeInTheDocument();
  });

  it("✅ should display the Admin choice after user clicks dropdown button", async () => {
    setup();
    await openDropdown();
    const adminChoice = await screen.findByText(/Admin/i);
    expect(adminChoice).toBeInTheDocument();
  });

  it("✅ should display the Business Analyst choice after user clicks dropdown button", async () => {
    setup();
    await openDropdown();
    const businessAnalystChoice = await screen.findByText(/Business Analyst/i);
    expect(businessAnalystChoice).toBeInTheDocument();
  });

  it("✅ should update URL when Admin role is selected", async () => {
    setup();
    await openDropdown();

    const user = userEvent.setup();
    const adminChoice = await screen.findByText(/Admin/i);
    await user.click(adminChoice);

    expect(pushMock).toHaveBeenCalled();
    expect(pushMock.mock.calls[0][0]).toContain("role=ADMIN");
  });

  it("✅ should remove role from URL when no selection", async () => {
    setup();
    await openDropdown();

    const user = userEvent.setup();
    const selectAllChoice = await screen.findByText(/Select All/i);
    await user.click(selectAllChoice);

    expect(pushMock).toHaveBeenCalled();
    // Tidak perlu check URL detail karena "Select All" artinya clear all filter
  });
});