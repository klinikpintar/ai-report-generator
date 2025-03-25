import { render, screen, fireEvent } from "@testing-library/react";
import CreateServiceModal from "@frontend/admin/service/components/create-service-modal";

describe("Create Service Modal Test", () => {
  it("Should not appear when first rendered", () => {
    render(<CreateServiceModal isVisible={false} onClose={() => {}} />);

    expect(
      screen.queryByText(/Daftar Service Klinik Pintar/i)
    ).not.toBeInTheDocument();
  });

  it("Should call the 'handleClose' function when 'Batal' button is clicked", () => {
    const handleClose = jest.fn();
    render(<CreateServiceModal isVisible={true} onClose={handleClose} />);

    fireEvent.click(screen.getByText("Batal"));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
