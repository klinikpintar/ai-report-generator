import { render, screen, fireEvent } from "@testing-library/react";
import Dropdown from "@frontend/(chat)/components/dropdown";
import { ServiceProvider, useService } from "@frontend/(chat)/context/serviceContext";

// Helper component untuk mengakses context di dalam test
const TestComponent = () => {
  const { selectedService } = useService();
  return <p data-testid="selected-service">{selectedService}</p>;
};

describe("Dropdown Component with Context", () => {
  const layananList = ["Reservasi", "Keuangan", "Kesehatan", "Inventaris"];

  const setup = () => {
    render(
      <ServiceProvider>
        <Dropdown />
        <TestComponent />
      </ServiceProvider>
    );
  };

  it("renders the dropdown button with correct text", () => {
    setup();
    expect(screen.getByText("Select a Service")).toBeInTheDocument();
  });

  it("toggles the dropdown menu when clicking the button", () => {
    setup();
    const button = screen.getByText("Select a Service");

    fireEvent.click(button);
    expect(screen.getByText("Select All")).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.queryByText("Select All")).not.toBeInTheDocument();
  });

  it("selects and displays a single service correctly", () => {
    setup();

    fireEvent.click(screen.getByText("Select a Service"));
    fireEvent.click(screen.getByLabelText(layananList[0]));
    fireEvent.click(screen.getByText("Select a Service"));

    expect(screen.getByTestId("selected-service")).toHaveTextContent(layananList[0]);
  });

  it("unselects a service when clicked again", () => {
    setup();

    fireEvent.click(screen.getByText("Select a Service"));
    fireEvent.click(screen.getByLabelText(layananList[0]));
    fireEvent.click(screen.getByText("Select a Service"));

    expect(screen.getByTestId("selected-service")).toHaveTextContent(layananList[0]);

    fireEvent.click(screen.getByText("Select a Service"));
    fireEvent.click(screen.getByLabelText(layananList[0]));

    expect(screen.getByTestId("selected-service")).toHaveTextContent("Pilih Service");
  });

  it("displays 'and X more' when multiple services are selected", () => {
    setup();

    fireEvent.click(screen.getByText("Select a Service"));
    layananList.slice(0, 2).forEach((layanan) => fireEvent.click(screen.getByLabelText(layanan)));

    expect(screen.getByTestId("selected-service")).toHaveTextContent(`${layananList[0]} and 1 more`);
  });

  it("activates 'Select All' when all services are selected", () => {
    setup();

    fireEvent.click(screen.getByText("Select a Service"));
    layananList.forEach((layanan) => fireEvent.click(screen.getByLabelText(layanan)));

    expect(screen.getByTestId("selected-service")).toHaveTextContent("Select All");
  });

  it("unselects all when 'Select All' is clicked", () => {
    setup();

    fireEvent.click(screen.getByText("Select a Service"));
    fireEvent.click(screen.getByLabelText("Select All"));
    fireEvent.click(screen.getByText("Select a Service"));

    expect(screen.getByTestId("selected-service")).toHaveTextContent("Select All");

    fireEvent.click(screen.getByText("Select a Service"));
    fireEvent.click(screen.getByLabelText("Select All"));

    expect(screen.getByTestId("selected-service")).toHaveTextContent("Pilih Service");
  });

  it("does not allow unselecting 'Select All' without selecting any other services", () => {
    setup();

    fireEvent.click(screen.getByText("Select a Service"));
    fireEvent.click(screen.getByLabelText("Select All"));
    fireEvent.click(screen.getByLabelText("Select All"));

    expect(screen.getByTestId("selected-service")).toHaveTextContent("Pilih Service");
  });

  it("ensures no invalid options are displayed", () => {
    setup();

    fireEvent.click(screen.getByText("Select a Service"));
    expect(screen.queryByText("Invalid Option")).not.toBeInTheDocument();
  });

  it("does not change selected service text if no checkbox is clicked", () => {
    setup();
    expect(screen.getByTestId("selected-service")).toHaveTextContent("Pilih Service");
  });

  it("shows 'Select All' when all services except 'Select All' are selected", () => {
    setup();

    fireEvent.click(screen.getByText("Select a Service"));
    layananList.forEach((layanan) => fireEvent.click(screen.getByLabelText(layanan)));

    expect(screen.getByTestId("selected-service")).toHaveTextContent("Select All");
  });

  it("displays 'Nama Layanan pertama and X more' when multiple services are selected but not all", () => {
    setup();

    fireEvent.click(screen.getByText("Select a Service"));
    layananList.slice(0, 3).forEach((layanan) => fireEvent.click(screen.getByLabelText(layanan)));

    expect(screen.getByTestId("selected-service")).toHaveTextContent(`${layananList[0]} and 2 more`);
  });

  it("allows selecting services from different platforms", () => {
    setup();

    fireEvent.click(screen.getByText("Select a Service"));
    fireEvent.click(screen.getByLabelText("Reservasi")); // PostgreSQL
    fireEvent.click(screen.getByLabelText("Keuangan")); // MySQL
    fireEvent.click(screen.getByLabelText("Kesehatan")); // MongoDB

    expect(screen.getByTestId("selected-service")).toHaveTextContent("Reservasi and 2 more");
  });

  it("closes the dropdown when clicking outside", () => {
    setup();
    
    // Klik tombol untuk membuka dropdown
    fireEvent.click(screen.getByText("Select a Service"));
    expect(screen.getByText("Select All")).toBeInTheDocument(); // Pastikan dropdown terbuka
  
    // Klik di luar dropdown (simulasi klik pada body)
    fireEvent.mouseDown(document.body);
    
    // Pastikan dropdown tertutup
    expect(screen.queryByText("Select All")).not.toBeInTheDocument();
  });
  
});