/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ExportModal from "@/app/(frontend)/(chat)/components/ekspor/modal";
import "@testing-library/jest-dom";

const openMock = jest.fn();
Object.defineProperty(window, "open", {
  value: openMock,
  writable: true,
});

describe("ExportModal", () => {
  const mockOnClose = jest.fn();
  const defaultProps = {
    isVisible: true,
    onClose: mockOnClose,
    content: "Ini adalah isi laporan",
    title: "Judul Laporan",
  };

  beforeEach(() => {
    mockOnClose.mockClear();
    localStorage.clear();
    openMock.mockClear(); // ✅ pakai openMock, bukan window.open langsung
  });

  it("should render format options and buttons", () => {
    render(<ExportModal {...defaultProps} />);

    expect(screen.getByText("Markdown")).toBeInTheDocument();
    expect(screen.getByText("PDF")).toBeInTheDocument();
    expect(screen.getByText("Batal")).toBeInTheDocument();
    expect(screen.getByText("Download")).toBeInTheDocument();
  });

  it("should show error message if no format selected on download", async () => {
    render(<ExportModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Download"));

    expect(
      await screen.findByText("Silakan pilih format laporan terlebih dahulu")
    ).toBeInTheDocument();
  });

  it("should update selected format when radio clicked", () => {
    render(<ExportModal {...defaultProps} />);

    fireEvent.click(screen.getByLabelText("PDF"));
    expect(screen.getByLabelText("PDF")).toBeChecked();

    fireEvent.click(screen.getByLabelText("Markdown"));
    expect(screen.getByLabelText("Markdown")).toBeChecked();
  });

  it("should handle pdf download successfully", async () => {
    const mockBlob = new Blob(["PDF"]);
    const mockUrl = "/pdf-viewer?reportData=some-data";
    global.URL.createObjectURL = jest.fn(() => mockUrl);
    
    localStorage.setItem("access_token", "mock_token");

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    });

    render(<ExportModal {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("PDF"));
    fireEvent.click(screen.getByText("Preview"));

    await waitFor(() => {
      expect(openMock).toHaveBeenCalled();
      expect(openMock.mock.calls[0][0]).toContain("/pdf-viewer");
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("should handle API error response properly", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: "Gagal ekspor" }),
    });

    localStorage.setItem("access_token", "mock_token");

    render(<ExportModal {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("Markdown"));
    fireEvent.click(screen.getByText("Download"));

    expect(await screen.findByText("Gagal ekspor")).toBeInTheDocument();
  });

  it("should reset state when modal is closed", () => {
    render(<ExportModal {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("Markdown"));
    fireEvent.click(screen.getByText("Batal"));

    expect(mockOnClose).toHaveBeenCalled();
    expect(
      screen.queryByText("Silakan pilih format laporan terlebih dahulu")
    ).not.toBeInTheDocument();
  });

  it("should reset state when modal is closed", () => {
    render(<ExportModal {...defaultProps} />);
    fireEvent.click(screen.getByLabelText("Markdown")); // set selectedFormat
    fireEvent.click(screen.getByText("Download")); // tidak pilih format, munculkan error
    fireEvent.click(screen.getByText("Batal")); // trigger onClose

    // ✅ tambahkan assertion untuk memastikan state direset
    expect(mockOnClose).toHaveBeenCalled();

    // Error message hilang
    expect(
      screen.queryByText("Silakan pilih format laporan terlebih dahulu")
    ).not.toBeInTheDocument();

    // Radio tidak terpilih lagi
    expect(screen.getByLabelText("Markdown")).not.toBeChecked();
    expect(screen.getByLabelText("PDF")).not.toBeChecked();
  });
  
  it("should trigger download when format is markdown", async () => {
  const mockBlob = new Blob(["Markdown content"]);
  const mockUrl = "blob:mock-url";
  const clickSpy = jest.fn();
  const revokeMock = jest.fn();

  const originalCreateElement = document.createElement;

  // Mock revokeObjectURL
  Object.defineProperty(URL, "revokeObjectURL", {
    value: revokeMock,
    writable: true,
  });

  global.URL.createObjectURL = jest.fn(() => mockUrl);

  // Mock <a> element
  document.createElement = jest.fn((tagName: string) => {
    if (tagName === "a") {
      return {
        href: "",
        download: "",
        click: clickSpy,
      } as unknown as HTMLAnchorElement;
    }
    return originalCreateElement.call(document, tagName);
  });

  localStorage.setItem("access_token", "mock_token");

  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: true,
    blob: () => Promise.resolve(mockBlob),
  });

  render(
    <ExportModal
      isVisible={true}
      onClose={jest.fn()}
      content="Isi laporan"
      title="Judul"
    />
  );

  fireEvent.click(screen.getByLabelText("Markdown"));
  fireEvent.click(screen.getByText("Download"));

  await waitFor(() => {
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeMock).toHaveBeenCalledWith(mockUrl);
  });

  // Restore original createElement
  document.createElement = originalCreateElement;
});

});
