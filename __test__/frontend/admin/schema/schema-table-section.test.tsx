import "@testing-library/jest-dom";
import { render, screen, waitFor, within } from "@testing-library/react";
import { SchemaTableSection } from "@frontend/admin/schema/sections";
import { fetchPlatforms, fetchServices, fetchSchemas } from "@frontend/admin/schema/utils/api";
import { dummyPlatforms, dummySchemas, dummyServices } from "@frontend/admin/schema/constant";
import userEvent from "@testing-library/user-event";
import { ToastContainer } from "react-toastify";

jest.mock("@frontend/admin/schema/utils/api", () => ({
  fetchPlatforms: jest.fn(),
  fetchServices: jest.fn(),
  fetchSchemas: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  ...jest.requireActual("next/navigation"),
  useSearchParams: jest.fn(() => ({
    get: jest.fn().mockReturnValue("1"),
  })),
}));

const useSearchParams = jest.requireMock("next/navigation").useSearchParams;

describe("Schema Table Section", () => {
  it("should render dropdown filter by services", async () => {
    render(<SchemaTableSection />);
    const filterByServiceDropdown = screen.getByText(/filter by services/i);
    expect(filterByServiceDropdown).toBeInTheDocument();
  });

  it("should render dropdown filter by platforms", async () => {
    render(<SchemaTableSection />);
    const filterByPlatformDropdown = screen.getByText(/filter by platforms/i);
    expect(filterByPlatformDropdown).toBeInTheDocument();
  });

  it("should render message in schema table while loading", async () => {
    render(<SchemaTableSection />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should render empty message in schema table when it is empty", async () => {
    (fetchSchemas as jest.Mock).mockResolvedValue([]);
    (fetchServices as jest.Mock).mockResolvedValue([]);
    (fetchPlatforms as jest.Mock).mockResolvedValue([]);
    render(<SchemaTableSection />);

    const emptyMessage = await screen.findByText(/tidak ada skema/i);
    expect(emptyMessage).toBeInTheDocument();
  });

  it("should render error message when one fetch fails", async () => {
    (fetchSchemas as jest.Mock).mockRejectedValue(new Error("Failed to fetch schemas"));
    (fetchServices as jest.Mock).mockResolvedValue([]);
    (fetchPlatforms as jest.Mock).mockResolvedValue([]);

    render(
      <>
        <SchemaTableSection />
        <ToastContainer />
      </>
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to load initial data/i)).toBeInTheDocument();
    });
  });

  it("should render the schema table with the selected service", async () => {
    (fetchServices as jest.Mock).mockResolvedValue(dummyServices);
    (fetchSchemas as jest.Mock).mockResolvedValue(dummySchemas);
    (fetchPlatforms as jest.Mock).mockResolvedValue(dummyPlatforms);

    render(<SchemaTableSection />);
    await screen.findByTestId("schema-table");

    const serviceDropdownTrigger = screen.getByText(/filter by services/i);
    await userEvent.click(serviceDropdownTrigger);

    // User select the first service
    const dropdownMenu = screen.getByTestId("service-filter-dropdown");
    const serviceOption = within(dropdownMenu).getByText(dummyServices[0].name);
    (fetchSchemas as jest.Mock).mockResolvedValue([dummySchemas[0]]);
    await userEvent.click(serviceOption);

    expect(fetchSchemas).toHaveBeenCalledWith(
      expect.objectContaining({ serviceIds: [dummyServices[0].id] })
    );
  });

  it("should render the schema table with the selected platform", async () => {
    (fetchPlatforms as jest.Mock).mockResolvedValue(dummyPlatforms);
    (fetchSchemas as jest.Mock).mockResolvedValue(dummySchemas);
    (fetchServices as jest.Mock).mockResolvedValue(dummyServices);

    render(<SchemaTableSection />);

    await screen.findByTestId("schema-table");

    const platformDropdownTrigger = screen.getByText(/filter by platforms/i);
    await userEvent.click(platformDropdownTrigger);

    // User select the first platform
    const dropdownMenu = screen.getByTestId("platform-filter-dropdown");
    const platformOption = within(dropdownMenu).getByText(dummyPlatforms[0].name);
    (fetchSchemas as jest.Mock).mockResolvedValue([dummySchemas[0]]);
    await userEvent.click(platformOption);

    expect(fetchSchemas).toHaveBeenCalledWith(
      expect.objectContaining({ platformCodes: [dummyPlatforms[0].id] })
    );
  });

  it("should render error when request to fetch filtered schemas fails", async () => {
    (fetchPlatforms as jest.Mock).mockResolvedValue(dummyPlatforms);
    (fetchServices as jest.Mock).mockResolvedValue(dummyServices);
    (fetchSchemas as jest.Mock).mockResolvedValue(dummySchemas);

    render(
      <>
        <SchemaTableSection />
        <ToastContainer />
      </>
    );
    await screen.findByTestId("schema-table");

    const serviceDropdownTrigger = screen.getByText(/filter by services/i);
    await userEvent.click(serviceDropdownTrigger);

    const dropdownMenu = screen.getByTestId("service-filter-dropdown");

    const serviceOption = within(dropdownMenu).getByText(dummyServices[0].name);
    (fetchSchemas as jest.Mock).mockRejectedValue(new Error("Failed to fetch filtered schemas"));
    await userEvent.click(serviceOption);

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch filtered schemas/i)).toBeInTheDocument();
    });
  });

  it("should handle missing or invalid page query param", async () => {
    jest.mocked(useSearchParams).mockReturnValue({
      get: jest.fn().mockReturnValue(undefined),
    });

    render(<SchemaTableSection />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should open upload schema modal when click button Tambah Skema", async () => {
    render(<SchemaTableSection />);

    const addSchemaButton = screen.getByText(/tambah skema/i);
    await userEvent.click(addSchemaButton);

    await screen.findByText(/form upload skema database/i);
  });

  // should close upload schema modal when click button Batal
  it("should close upload schema modal when click button Batal", async () => {
    render(<SchemaTableSection />);

    const addSchemaButton = screen.getByText(/tambah skema/i);
    await userEvent.click(addSchemaButton);

    const cancelButton = screen.getByText(/batal/i);
    await userEvent.click(cancelButton);

    expect(screen.queryByText(/form upload skema database/i)).not.toBeInTheDocument();
  });
});
