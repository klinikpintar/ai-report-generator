import { render, screen, fireEvent } from "@testing-library/react";
import Dropdown from "../app/components/dropdown";
import { ServiceProvider, useService } from "../app/context/serviceContext";

// Helper component untuk mengakses context di dalam test
const TestComponent = () => {
  const { selectedService } = useService();
  return <p data-testid="selected-service">{selectedService}</p>;
};

describe("Dropdown Component with Context", () => {
  it("should render the dropdown button with correct text", () => {
    render(
      <ServiceProvider>
        <Dropdown />
      </ServiceProvider>
    );
    expect(screen.getByText("Select a Service")).toBeInTheDocument();
  });

  it("should open and close the dropdown when clicking the button", () => {
    render(
      <ServiceProvider>
        <Dropdown />
      </ServiceProvider>
    );
    const button = screen.getByText("Select a Service");

    fireEvent.click(button);
    expect(screen.getByText("Select All")).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.queryByText("Select All")).not.toBeInTheDocument();
  });

  it("should select and display a single service correctly", () => {
    render(
      <ServiceProvider>
        <Dropdown />
        <TestComponent />
      </ServiceProvider>
    );

    fireEvent.click(screen.getByText("Select a Service"));
    fireEvent.click(screen.getByLabelText("Reservasi Keuangan"));
    fireEvent.click(screen.getByText("Select a Service"));

    expect(screen.getByTestId("selected-service")).toHaveTextContent("Reservasi Keuangan");
  });

  it("should unselect a service when clicked again", () => {
    render(
      <ServiceProvider>
        <Dropdown />
        <TestComponent />
      </ServiceProvider>
    );

    fireEvent.click(screen.getByText("Select a Service"));
    fireEvent.click(screen.getByLabelText("Reservasi Keuangan"));
    fireEvent.click(screen.getByText("Select a Service"));
    expect(screen.getByTestId("selected-service")).toHaveTextContent("Reservasi Keuangan");

    fireEvent.click(screen.getByText("Select a Service"));
    fireEvent.click(screen.getByLabelText("Reservasi Keuangan"));
    expect(screen.getByTestId("selected-service")).toHaveTextContent("Pilih Service");
  });

  it("should display 'dan X more' when multiple services are selected", () => {
    render(
      <ServiceProvider>
        <Dropdown />
        <TestComponent />
      </ServiceProvider>
    );

    fireEvent.click(screen.getByText("Select a Service"));
    fireEvent.click(screen.getByLabelText("Reservasi Keuangan"));
    fireEvent.click(screen.getByLabelText("Laporan Keuangan"));

    expect(screen.getByTestId("selected-service")).toHaveTextContent("Reservasi Keuangan dan 1 more");
  });

  it("should activate 'Select All' when all services are selected one by one", () => {
    render(
      <ServiceProvider>
        <Dropdown />
        <TestComponent />
      </ServiceProvider>
    );

    fireEvent.click(screen.getByText("Select a Service"));
    fireEvent.click(screen.getByLabelText("Reservasi Keuangan"));
    fireEvent.click(screen.getByLabelText("Reservasi Pasien"));
    fireEvent.click(screen.getByLabelText("Laporan Keuangan"));
    fireEvent.click(screen.getByLabelText("Rekam Media"));
    fireEvent.click(screen.getByLabelText("Manajemen Inventaris"));
    fireEvent.click(screen.getByLabelText("Pemesanan Online"));

    expect(screen.getByTestId("selected-service")).toHaveTextContent("Select All");
  });

  it("should unselect all when 'Select All' is clicked", () => {
    render(
      <ServiceProvider>
        <Dropdown />
        <TestComponent />
      </ServiceProvider>
    );

    fireEvent.click(screen.getByText("Select a Service"));
    fireEvent.click(screen.getByLabelText("Select All"));
    fireEvent.click(screen.getByText("Select a Service"));
    expect(screen.getByTestId("selected-service")).toHaveTextContent("Select All");

    fireEvent.click(screen.getByText("Select a Service"));
    fireEvent.click(screen.getByLabelText("Select All"));
    expect(screen.getByTestId("selected-service")).toHaveTextContent("Pilih Service");
  });

  it("should not allow unselecting 'Select All' without selecting any other services", () => {
    render(
      <ServiceProvider>
        <Dropdown />
        <TestComponent />
      </ServiceProvider>
    );

    fireEvent.click(screen.getByText("Select a Service"));
    fireEvent.click(screen.getByLabelText("Select All"));
    fireEvent.click(screen.getByLabelText("Select All"));

    expect(screen.getByTestId("selected-service")).toHaveTextContent("Pilih Service");
  });

  it("should not show an invalid option", () => {
    render(
      <ServiceProvider>
        <Dropdown />
      </ServiceProvider>
    );
    fireEvent.click(screen.getByText("Select a Service"));

    expect(screen.queryByText("Invalid Option")).not.toBeInTheDocument();
  });

  it("should not change selected service text if no checkbox is clicked", () => {
    render(
      <ServiceProvider>
        <Dropdown />
        <TestComponent />
      </ServiceProvider>
    );
    expect(screen.getByTestId("selected-service")).toHaveTextContent("Pilih Service");
  });

  it("should not allow multiple 'Select All' selections", () => {
    render(
      <ServiceProvider>
        <Dropdown />
        <TestComponent />
      </ServiceProvider>
    );

    fireEvent.click(screen.getByText("Select a Service"));
    fireEvent.click(screen.getByLabelText("Select All"));
    fireEvent.click(screen.getByLabelText("Select All"));

    expect(screen.getByTestId("selected-service")).toHaveTextContent("Pilih Service");
  });

  it("should display 'Select All' when all services except 'Select All' are selected", () => {
    render(
      <ServiceProvider>
        <Dropdown />
        <TestComponent />
      </ServiceProvider>
    );

    fireEvent.click(screen.getByText("Select a Service"));
    fireEvent.click(screen.getByLabelText("Reservasi Keuangan"));
    fireEvent.click(screen.getByLabelText("Reservasi Pasien"));
    fireEvent.click(screen.getByLabelText("Laporan Keuangan"));
    fireEvent.click(screen.getByLabelText("Rekam Media"));
    fireEvent.click(screen.getByLabelText("Manajemen Inventaris"));
    fireEvent.click(screen.getByLabelText("Pemesanan Online"));
    
    expect(screen.getByTestId("selected-service")).toHaveTextContent("Select All");
  });

  it("should display 'Nama Layanan pertama dan X more' when multiple services are selected but not all", () => {
    render(
      <ServiceProvider>
        <Dropdown />
        <TestComponent />
      </ServiceProvider>
    );

    fireEvent.click(screen.getByText("Select a Service"));
    fireEvent.click(screen.getByLabelText("Reservasi Keuangan"));
    fireEvent.click(screen.getByLabelText("Laporan Keuangan"));
    fireEvent.click(screen.getByLabelText("Rekam Media"));
    
    expect(screen.getByTestId("selected-service")).toHaveTextContent("Reservasi Keuangan dan 2 more");
  });
  
});