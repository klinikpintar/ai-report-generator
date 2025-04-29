import { render, screen } from "@testing-library/react";
import ManageAISection from "@frontend/admin/manage-ai/sections/description-section";
import "@testing-library/jest-dom";

describe("ManageAISection", () => {
  it("should render the header section with correct content", () => {
    render(<ManageAISection />);

    // Check that all expected texts from HeaderSection are present
    expect(screen.getByText("Konfigurasi Model AI")).toBeInTheDocument();
    expect(screen.getByText("Konfigurasi AI untuk Mendukung Analisis Data")).toBeInTheDocument();
    expect(screen.getByText("Memilih dan mengatur model AI yang digunakan dalam sistem. Pastikan model AI yang dipilih sesuai dengan kebutuhan analisis dan kompatibel dengan struktur database yang tersedia.")).toBeInTheDocument();
  });
});