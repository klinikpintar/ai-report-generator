import { FilterByRoleDropdown } from "@frontend/admin/manage-user/components/FilterByRoleDropdown";
import { UserTableProvider } from "@frontend/admin/manage-user/context/UserTableContext";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("FilterByRoleDropdown", () => {
  const setup = () => {
    render(
      <UserTableProvider>
        <FilterByRoleDropdown />
      </UserTableProvider>
    );
  };

  const openDropdown = async () => {
    const dropdownButton = await screen.findByText(/Filter by Role/i);
    await userEvent.click(dropdownButton);
  };

  beforeEach(() => {
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
});
