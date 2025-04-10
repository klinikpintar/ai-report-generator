import { render, screen, waitFor } from "@testing-library/react";
import Dropdown from "@frontend/(chat)/components/dropdown";
import { ServiceProvider, useService } from "@frontend/(chat)/context/serviceContext";
import { Service } from "@frontend/common/types/service";
import userEvent from "@testing-library/user-event";
import { ToastContainer } from "react-toastify";

const layananList: Service[] = [
  { id: "1", name: "Reservasi", platformCode: "postgresql", createdAt: "" },
  { id: "2", name: "Keuangan", platformCode: "mysql", createdAt: "" },
  { id: "3", name: "Kesehatan", platformCode: "mongodb", createdAt: "" },
  { id: "4", name: "Inventaris", platformCode: "redis", createdAt: "" },
];

// Mocking the fetch function to return the layananList
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve(layananList),
  })
) as jest.Mock;

// Helper component untuk mengakses context di dalam test
const TestComponent = () => {
  const { selectedService, getServiceRepresentation, services } = useService();
  const isAllSelected = selectedService.length === services.length;
  return (
    <p data-testid="selected-service">{getServiceRepresentation(selectedService, isAllSelected)}</p>
  );
};

describe("Dropdown Component with Context", () => {
  const setup = () => {
    render(
      <ServiceProvider>
        <Dropdown />
        <TestComponent />
        <ToastContainer/>
      </ServiceProvider>
    );
  };

  it("renders the dropdown button with correct text", () => {
    setup();
    expect(screen.getByText("Select a Service")).toBeInTheDocument();
  });

  it("toggles the dropdown menu when clicking the button", async () => {
    setup();
    const button = screen.getByText("Select a Service");

    await userEvent.click(button);
    expect(screen.getByText("Select All")).toBeInTheDocument();

    await userEvent.click(button);
    expect(screen.queryByText("Select All")).not.toBeInTheDocument();
  });

  it("selects and displays a single service correctly", async () => {
    setup();

    await userEvent.click(screen.getByText("Select a Service"));
    await userEvent.click(screen.getByLabelText(layananList[0].name));
    await userEvent.click(screen.getByText("Select a Service"));

    expect(screen.getByTestId("selected-service")).toHaveTextContent(layananList[0].name);
  });

  it("unselects a service when clicked again", async () => {
    setup();

    await userEvent.click(screen.getByText("Select a Service"));
    await userEvent.click(screen.getByLabelText(layananList[0].name));
    await userEvent.click(screen.getByText("Select a Service"));

    expect(screen.getByTestId("selected-service")).toHaveTextContent(layananList[0].name);

    await userEvent.click(screen.getByText("Select a Service"));
    await userEvent.click(screen.getByLabelText(layananList[0].name));

    expect(screen.getByTestId("selected-service")).toHaveTextContent("Pilih Service");
  });

  it("displays 'and X more' when multiple services are selected", async () => {
    setup();

    await userEvent.click(screen.getByText("Select a Service"));
    layananList
      .slice(0, 2)
      .forEach(async (layanan) => await userEvent.click(screen.getByLabelText(layanan.name)));

    await waitFor(() => {
      expect(screen.getByTestId("selected-service")).toHaveTextContent(
        `${layananList[0].name} and 1 more`
      );
    });
  });

  it("activates 'Select All' when all services are selected", async () => {
    setup();

    await userEvent.click(screen.getByText("Select a Service"));
    layananList.forEach(
      async (layanan) => await userEvent.click(screen.getByLabelText(layanan.name))
    );
    await waitFor(() => {
      expect(screen.getByTestId("selected-service")).toHaveTextContent("Select All");
    });
  });

  it("unselects all when 'Select All' is clicked", async () => {
    setup();

    await userEvent.click(screen.getByText("Select a Service"));
    await userEvent.click(screen.getByLabelText("Select All"));
    await userEvent.click(screen.getByText("Select a Service"));

    await waitFor(() => {
      expect(screen.getByTestId("selected-service")).toHaveTextContent("Select All");
    });

    await userEvent.click(screen.getByText("Select a Service"));
    await userEvent.click(screen.getByLabelText("Select All"));

    await waitFor(() => {
      expect(screen.getByTestId("selected-service")).toHaveTextContent("Pilih Service");
    });
  });

  it("does not allow unselecting 'Select All' without selecting any other services", async () => {
    setup();

    await userEvent.click(screen.getByText("Select a Service"));
    await userEvent.click(screen.getByLabelText("Select All"));
    await userEvent.click(screen.getByLabelText("Select All"));

    expect(screen.getByTestId("selected-service")).toHaveTextContent("Pilih Service");
  });

  it("ensures no invalid options are displayed", async () => {
    setup();

    await userEvent.click(screen.getByText("Select a Service"));
    expect(screen.queryByText("Invalid Option")).not.toBeInTheDocument();
  });

  it("does not change selected service text if no checkbox is clicked", () => {
    setup();
    expect(screen.getByTestId("selected-service")).toHaveTextContent("Pilih Service");
  });

  it("shows 'Select All' when all services except 'Select All' are selected", async () => {
    setup();

    await userEvent.click(screen.getByText("Select a Service"));
    layananList.forEach(
      async (layanan) => await userEvent.click(screen.getByLabelText(layanan.name))
    );

    await waitFor(() => {
      expect(screen.getByTestId("selected-service")).toHaveTextContent("Select All");
    });
  });

  it("displays 'Nama Layanan pertama and X more' when multiple services are selected but not all", async () => {
    setup();

    await userEvent.click(screen.getByText("Select a Service"));
    layananList
      .slice(0, 3)
      .forEach(async (layanan) => await userEvent.click(screen.getByLabelText(layanan.name)));

    await waitFor(() => {
      expect(screen.getByTestId("selected-service")).toHaveTextContent(
        `${layananList[0].name} and 2 more`
      );
    });
  });

  it("allows selecting services from different platforms", async () => {
    setup();

    await userEvent.click(screen.getByText("Select a Service"));
    await userEvent.click(screen.getByLabelText("Reservasi")); // PostgreSQL
    await userEvent.click(screen.getByLabelText("Keuangan")); // MySQL
    await userEvent.click(screen.getByLabelText("Kesehatan")); // MongoDB

    expect(screen.getByTestId("selected-service")).toHaveTextContent("Reservasi and 2 more");
  });

  it("closes the dropdown when clicking outside", async () => {
    setup();

    // Klik tombol untuk membuka dropdown
    await userEvent.click(screen.getByText("Select a Service"));
    expect(screen.getByText("Select All")).toBeInTheDocument(); // Pastikan dropdown terbuka

    // Klik di luar dropdown (simulasi klik pada body)
    await userEvent.click(document.body);

    // Pastikan dropdown tertutup
    expect(screen.queryByText("Select All")).not.toBeInTheDocument();
  });

  it("should display error message when fetch fails", async () => {
    // Mock fetch untuk mengembalikan error
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error("Network error"))
    );

    setup();

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch list of services")).toBeInTheDocument();
    });
  })
});
