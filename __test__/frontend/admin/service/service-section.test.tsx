import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { ServiceSection } from "@frontend/admin/service/sections/service-section";
import userEvent from "@testing-library/user-event";

describe("Service Management Test", () => {
  it("Should have header text", () => {
    render(<ServiceSection />);

    const heading = screen.getByText(/Manajemen Service Klinik Pintar/i);

    expect(heading).toBeInTheDocument();
  });

  it("Should have service management button", () => {
    render(<ServiceSection />);

    const heading = screen.getByText(/Kelola Service Sekarang/i);

    expect(heading).toBeInTheDocument();
  });

  it("should open create service modal when click button Kelola Service Sekarang", async () => {
    render(<ServiceSection />);

    const kelolaServiceButton = screen.getByText(/kelola service sekarang/i);
    await userEvent.click(kelolaServiceButton);

    expect(
      screen.getByText(/Daftar Service Klinik Pintar/i)
    ).toBeInTheDocument();
  });

  it("should close create service modal when click button Batal", async () => {
    render(<ServiceSection />);

    const kelolaServiceButton = screen.getByText(/kelola service sekarang/i);
    await userEvent.click(kelolaServiceButton);

    const cancelButton = screen.getByText(/batal/i);
    await userEvent.click(cancelButton);

    await waitFor(
      () =>
        expect(
          screen.queryByText(/Daftar Service Klinik Pintar/i)
        ).not.toBeInTheDocument(),
      {
        timeout: 400,
      }
    );
  });
});
