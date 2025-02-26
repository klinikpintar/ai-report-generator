import { render, screen, fireEvent } from "@testing-library/react";
import AddSchemaModal from "@/app/components/AddSchemaModal";
import Schema from "@/app/schema/page";

describe("Modal Component", () => {
  test("modal tidak muncul saat pertama kali dirender", () => {
    render(<AddSchemaModal isVisible={false} onClose={() => {}} />);

    expect(
      screen.queryByText("Form Upload Skema Database")
    ).not.toBeInTheDocument();
  });

  test("modal muncul saat klik 'Tambah Skema'", () => {
    render(<Schema />);

    fireEvent.click(screen.getByText("Tambah Skema"));

    expect(screen.getByText("Form Upload Skema Database")).toBeInTheDocument();
  });

  test("memanggil fungsi onClose saat tombol 'Batal' diklik", () => {
    const handleClose = jest.fn();
    render(<AddSchemaModal isVisible={true} onClose={handleClose} />);

    fireEvent.click(screen.getByText("Batal"));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test("memanggil fungsi onClose saat klik di luar modal", () => {
    const handleClose = jest.fn();
    render(<AddSchemaModal isVisible={true} onClose={handleClose} />);

    fireEvent.click(screen.getByTestId("wrapper"));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
