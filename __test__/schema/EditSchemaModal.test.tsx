import { render, screen, fireEvent } from "@testing-library/react";
import EditSchemaModal from "@/app/components/EditSchemaModal";
import Schema from "@/app/schema/page";

describe("Modal Component", () => {
  test("modal tidak muncul saat pertama kali dirender", () => {
    render(<EditSchemaModal isVisible={false} onClose={() => {}} />);

    expect(screen.queryByText("Edit Skema Database")).not.toBeInTheDocument();
  });

  test("modal muncul saat klik 'Edit Skema'", () => {
    render(<Schema />);

    fireEvent.click(screen.getByText("Edit Skema"));

    expect(screen.getByText("Edit Skema Database")).toBeInTheDocument();
  });

  test("memanggil fungsi onClose saat tombol 'Batal' diklik", () => {
    const handleClose = jest.fn();
    render(<EditSchemaModal isVisible={true} onClose={handleClose} />);

    fireEvent.click(screen.getByText("Batal"));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
