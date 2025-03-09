import "@testing-library/jest-dom";
import { render, screen, waitFor, within } from "@testing-library/react";
import { SchemaTableSection } from "@/modules/schema/sections";
import { fetchPlatforms, fetchServices, fetchSchemas } from "@/modules/schema/utils/api";
import { dummyPlatforms, dummySchemas, dummyServices } from "@/modules/schema/constant";
import userEvent from "@testing-library/user-event";

jest.mock("@/modules/schema/utils/api", () => ({
  fetchPlatforms: jest.fn(),
  fetchServices: jest.fn(),
  fetchSchemas: jest.fn(),
}));

describe("Schema Table Section", () => {
  it("should render loading state", () => {
    render(<SchemaTableSection />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("should render the schema table when fetches resolve", async () => {
    (fetchPlatforms as jest.Mock).mockResolvedValue(dummyPlatforms);
    (fetchServices as jest.Mock).mockResolvedValue(dummyServices);
    (fetchSchemas as jest.Mock).mockResolvedValue(dummySchemas);

    render(<SchemaTableSection />);
    await screen.findByTestId("schema-table");
  });

  it("should render error when one of the fetches fails", async () => {
    (fetchPlatforms as jest.Mock).mockRejectedValue(new Error("Failed to fetch platforms"));
    (fetchServices as jest.Mock).mockResolvedValue(dummyServices);
    (fetchSchemas as jest.Mock).mockResolvedValue(dummySchemas);

    render(<SchemaTableSection />);
    await screen.findByText(/failed to load initial data/i);
  });

  // when select service, it should render the schema table with the selected service
  it("should render the schema table with the selected service", async () => {
    (fetchPlatforms as jest.Mock).mockResolvedValue(dummyPlatforms);
    (fetchServices as jest.Mock).mockResolvedValue(dummyServices);
    (fetchSchemas as jest.Mock).mockResolvedValue(dummySchemas);

    render(<SchemaTableSection />);
    await screen.findByTestId("schema-table");

    const serviceDropdownTrigger = screen.getByText(/filter by services/i);
    await userEvent.click(serviceDropdownTrigger);

    const dropdownMenu = screen.getByTestId("service-filter-dropdown");

    const serviceOption = within(dropdownMenu).getByText(dummyServices[0].name);
    // Only fetch schemas with the selected service (first service for this test)
    (fetchSchemas as jest.Mock).mockResolvedValue([dummySchemas[0]]);
    await userEvent.click(serviceOption);

    expect(fetchSchemas).toHaveBeenCalledWith(
      expect.objectContaining({ serviceIds: [dummyServices[0].id] })
    );

    const table = screen.getByTestId("schema-table");
    const allRows = within(table).getAllByRole("row");
    const dataRows = allRows.slice(1);

    expect(dataRows).toHaveLength(1);
    expect(dataRows[0]).toHaveTextContent(dummySchemas[0].name);
    expect(dataRows[0]).toHaveTextContent(dummySchemas[0].service.name);
  });

  // when select platform, it should render the schema table with the selected platform
  it("should render the schema table with the selected platform", async () => {
    (fetchPlatforms as jest.Mock).mockResolvedValue(dummyPlatforms);
    (fetchServices as jest.Mock).mockResolvedValue(dummyServices);
    (fetchSchemas as jest.Mock).mockResolvedValue(dummySchemas);

    render(<SchemaTableSection />);

    await screen.findByTestId("schema-table");

    const platformDropdownTrigger = screen.getByText(/filter by platforms/i);
    await userEvent.click(platformDropdownTrigger);

    const dropdownMenu = screen.getByTestId("platform-filter-dropdown");

    const platformOption = within(dropdownMenu).getByText(dummyPlatforms[0].name);
    // Only fetch schemas with the selected platform (first platform for this test)
    (fetchSchemas as jest.Mock).mockResolvedValue([dummySchemas[0]]);
    await userEvent.click(platformOption);

    expect(fetchSchemas).toHaveBeenCalledWith(
      expect.objectContaining({ platformCodes: [dummyPlatforms[0].id] })
    );

    const table = screen.getByTestId("schema-table");
    const allRows = within(table).getAllByRole("row");
    const dataRows = allRows.slice(1);

    expect(dataRows).toHaveLength(1);
    expect(dataRows[0]).toHaveTextContent(dummySchemas[0].name);
    expect(dataRows[0]).toHaveTextContent(dummySchemas[0].service.name);
  });

  it("should render error when request to fetch filtered schemas fails", async () => {
    (fetchPlatforms as jest.Mock).mockResolvedValue(dummyPlatforms);
    (fetchServices as jest.Mock).mockResolvedValue(dummyServices);
    (fetchSchemas as jest.Mock).mockResolvedValue(dummySchemas);

    render(<SchemaTableSection />);
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
});
