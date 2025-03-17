import { render, screen, fireEvent } from "@testing-library/react";
import Bantuan from "@frontend/(chat)/components/bantuan";
import "@testing-library/jest-dom";

describe("Bantuan Component", () => {
  it("renders the help button and icon", () => {
    render(<Bantuan />);
    
    // Pastikan tombol Bantuan ada
    expect(screen.getByText("Bantuan")).toBeInTheDocument();

    // Pastikan ikon Bantuan ada
    expect(screen.getByRole("img", { name: /help icon/i })).toBeInTheDocument();
  });

  it("opens the modal when the help button is clicked", () => {
    render(<Bantuan />);
    
    // Klik tombol Bantuan
    fireEvent.click(screen.getByText("Bantuan"));

    // Pastikan modal muncul
    expect(
      screen.getByText("Cara Menggunakan AI Report Generator")
    ).toBeInTheDocument();
  });

  it("closes the modal when clicking outside", () => {
    render(<Bantuan />);

    // Klik tombol untuk membuka modal
    fireEvent.click(screen.getByText("Bantuan"));

    // Pastikan modal muncul
    expect(screen.getByText("Cara Menggunakan AI Report Generator")).toBeInTheDocument();

    // Simulasi klik di luar modal
    fireEvent.mouseDown(document.body);

    // Pastikan modal hilang
    expect(
      screen.queryByText("Cara Menggunakan AI Report Generator")
    ).not.toBeInTheDocument();
  });
});