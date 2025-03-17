import { render, screen, fireEvent } from "@testing-library/react";
import AddSchemaModal from "@/app/components/AddSchemaModal";

describe("Add Schema Modal Test", () => {
  it("Should not appear when first rendered", () => {
    render(<AddSchemaModal isVisible={false} onClose={() => {}} />);

    expect(screen.getByText("Form Upload Skema Database")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
  });

  it("Should call the 'handleClose' function when 'Batal' button is clicked", () => {
    const handleClose = jest.fn();
    render(<AddSchemaModal isVisible={true} onClose={handleClose} />);

    fireEvent.click(screen.getByText("Batal"));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
