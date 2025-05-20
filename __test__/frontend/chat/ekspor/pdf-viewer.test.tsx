import { render, screen, waitFor, act } from "@testing-library/react";
import PDFViewer from "@/app/(frontend)/(chat)/components/ekspor/pdf-viewer";
import "@testing-library/jest-dom";

// Mock fetch
global.fetch = jest.fn();
global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();

describe("PDFViewer", () => {
  const validReportData = JSON.stringify({
    title: "Test Report",
    content: "Test content",
    createdAt: "2023-01-01"
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful PDF generation
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      blob: jest.fn().mockResolvedValue(new Blob(["pdf content"], { type: "application/pdf" }))
    });
    
    // Mock URL.createObjectURL
    (global.URL.createObjectURL as jest.Mock).mockReturnValue("blob:mock-pdf-url");

    // Reset document title before each test
    document.title = "Original Title";
  });
  
  it("renders loading state initially", () => {
    render(<PDFViewer reportData={validReportData} />);
    expect(screen.getByText(/Loading PDF/i)).toBeInTheDocument();
  });
  
  it("renders PDF iframe after successful fetch", async () => {
    render(<PDFViewer reportData={validReportData} />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading PDF/i)).not.toBeInTheDocument();
    });
    
    const iframe = screen.getByTitle("Test Report");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("src", "blob:mock-pdf-url");
  });
  
  it("renders error message when report data parsing fails", async () => {
    const invalidReportData = "invalid-json";
    
    // Consider: in your code, you should capture the console.error
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    render(<PDFViewer reportData={invalidReportData} />);
    
    await waitFor(() => {
      expect(screen.queryByText(/Loading PDF/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Failed to load PDF/i)).toBeInTheDocument();
    });
    
    // Restore console.error
    console.error = originalConsoleError;
  });
  
  it("sets document title from report data", async () => {
    render(<PDFViewer reportData={validReportData} />);
    
    await waitFor(() => {
      expect(document.title).toBe("Test Report - Klinik Pintar");
    });
  });
});