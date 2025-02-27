import { render, screen, fireEvent } from "@testing-library/react";
import Dropdown from "../app/components/dropdown";

describe("Dropdown Component", () => {
  it("should render the dropdown button with correct text", () => {
    render(<Dropdown />);
    expect(screen.getByText("Select a Service")).toBeInTheDocument();
  });

  it("should open and close the dropdown when clicking the button", () => {
    render(<Dropdown />);
    const button = screen.getByText("Select a Service");

    fireEvent.click(button);
    expect(screen.getByText("Select All")).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.queryByText("Select All")).not.toBeInTheDocument();
  });

  it("should select and display a single service correctly", () => {
    render(<Dropdown />);
    fireEvent.click(screen.getByText("Select a Service"));

    const checkbox = screen.getByLabelText("Reservasi Keuangan");
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByText("Select a Service"));

    expect(screen.getByText("Reservasi Keuangan")).toBeInTheDocument();
  });

  it("should unselect a service when clicked again", () => {
    render(<Dropdown />);
    fireEvent.click(screen.getByText("Select a Service"));

    fireEvent.click(screen.getByLabelText("Reservasi Keuangan"));
    fireEvent.click(screen.getByText("Select a Service"));
    expect(screen.getByText("Reservasi Keuangan")).toBeInTheDocument();
    
    fireEvent.click(screen.getByText("Select a Service"));
    fireEvent.click(screen.getByLabelText("Reservasi Keuangan"));
    expect(screen.getByText("Pilih Service")).toBeInTheDocument();
  });

  it("should display 'dan X more' when multiple services are selected", () => {
    render(<Dropdown />);
    fireEvent.click(screen.getByText("Select a Service"));

    fireEvent.click(screen.getByLabelText("Reservasi Keuangan"));
    fireEvent.click(screen.getByLabelText("Laporan Keuangan"));

    expect(screen.getByText("Reservasi Keuangan dan 1 more")).toBeInTheDocument();
  });

  it("should activate 'Select All' when all services are selected one by one", () => {
    render(<Dropdown />);
    fireEvent.click(screen.getByText("Select a Service"));

    fireEvent.click(screen.getByLabelText("Reservasi Keuangan"));
    fireEvent.click(screen.getByLabelText("Reservasi Pasien"));
    fireEvent.click(screen.getByLabelText("Laporan Keuangan"));
    fireEvent.click(screen.getByLabelText("Rekam Media"));
    fireEvent.click(screen.getByLabelText("Manajemen Inventaris"));
    fireEvent.click(screen.getByLabelText("Pemesanan Online"));

    expect(screen.getByText("Select All")).toBeInTheDocument();
  });

  it("should unselect all when 'Select All' is clicked", () => {
    render(<Dropdown />);
    fireEvent.click(screen.getByText("Select a Service"));

    fireEvent.click(screen.getByLabelText("Select All"));
    fireEvent.click(screen.getByText("Select a Service"));
    expect(screen.getByText("Select All")).toBeInTheDocument();
    
    fireEvent.click(screen.getByText("Select a Service"));
    fireEvent.click(screen.getByLabelText("Select All"));
    expect(screen.getByText("Pilih Service")).toBeInTheDocument();
  });

  it("should not allow unselecting 'Select All' without selecting any other services", () => {
    render(<Dropdown />);
    fireEvent.click(screen.getByText("Select a Service"));

    fireEvent.click(screen.getByLabelText("Select All"));
    fireEvent.click(screen.getByLabelText("Select All")); 

    expect(screen.getByText("Pilih Service")).toBeInTheDocument();
  });

  it("should not show an invalid option", () => {
    render(<Dropdown />);
    fireEvent.click(screen.getByText("Select a Service"));

    expect(screen.queryByText("Invalid Option")).not.toBeInTheDocument();
  });

  it("should not change selected service text if no checkbox is clicked", () => {
    render(<Dropdown />);
    expect(screen.getByText("Pilih Service")).toBeInTheDocument();
  });

  it("should not allow multiple 'Select All' selections", () => {
    render(<Dropdown />);
    fireEvent.click(screen.getByText("Select a Service"));

    fireEvent.click(screen.getByLabelText("Select All")); 
    fireEvent.click(screen.getByLabelText("Select All")); 

    expect(screen.getByText("Pilih Service")).toBeInTheDocument();
  });

  it("should not allow selecting more than the available options", () => {
    render(<Dropdown />);
    fireEvent.click(screen.getByText("Select a Service"));

    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach((checkbox) => fireEvent.click(checkbox));

    expect(screen.getByText("Select All")).toBeInTheDocument();
  });
});
