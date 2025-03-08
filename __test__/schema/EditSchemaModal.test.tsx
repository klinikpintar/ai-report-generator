import { render, screen, fireEvent } from "@testing-library/react";
import EditSchemaModal from "@/app/components/EditSchemaModal";
import Schema from "@/app/schema/page";

describe("Edit Schema Modal Test", () => {
  it("Should not appear when first rendered", () => {
    render(<EditSchemaModal isVisible={false} onClose={() => {}} />);

    expect(screen.getByText("Edit Skema Database")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
  });

  it("Should appear when user click 'Edit Skema'", () => {
    render(<Schema />);

    fireEvent.click(screen.getByText("Edit Skema"));

    expect(screen.getByText("Edit Skema Database")).toHaveAttribute(
      "aria-hidden",
      "false"
    );
  });

  it("Should call the 'handleClose' function when 'Batal' button is clicked", () => {
    const handleClose = jest.fn();
    render(<EditSchemaModal isVisible={true} onClose={handleClose} />);

    fireEvent.click(screen.getByText("Batal"));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
