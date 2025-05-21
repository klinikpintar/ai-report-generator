import { PdfExporter } from "@/app/(backend)/services/pdfExporter";
import fs from "fs";
import puppeteer from "puppeteer";


jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn().mockResolvedValue(Buffer.from("mock-logo-data"))
  }
}));

jest.mock("puppeteer", () => {
  const mockPage = {
    setContent: jest.fn().mockResolvedValue(undefined),
    evaluate: jest.fn().mockResolvedValue(undefined),
    pdf: jest.fn().mockResolvedValue(Buffer.from("mock-pdf-data")),
  };
  
  const mockBrowser = {
    newPage: jest.fn().mockResolvedValue(mockPage),
    close: jest.fn().mockResolvedValue(undefined),
  };
  
  return {
    launch: jest.fn().mockResolvedValue(mockBrowser)
  };
});

const mockRender = jest.fn().mockReturnValue("<p>Rendered HTML</p>");
const mockUse = jest.fn().mockReturnThis();
const mockEscapeHtml = jest.fn().mockImplementation(text => `escaped-${text}`);

const mockMarkdownItInstance = {
  render: mockRender,
  use: mockUse,
  renderer: {
    rules: {}
  },
  utils: {
    escapeHtml: mockEscapeHtml
  }
};

// Mock the constructor itself
jest.mock("markdown-it", () => {
  return jest.fn().mockImplementation(() => mockMarkdownItInstance);
});

jest.mock("markdown-it-highlightjs", () => {
  return jest.fn();
});

// Mock console.error to avoid cluttering test output
console.error = jest.fn();

describe("PdfExporter", () => {
  let exporter: PdfExporter;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let reportData: any;

  beforeEach(() => {
    exporter = new PdfExporter();
    reportData = {
      title: "Test Report",
      content: "# Test Content\nThis is a test.",
      createdAt: "2023-01-01T00:00:00.000Z"
    };
    jest.clearAllMocks();
  });
  
  describe("Core Methods", () => {
    it("should return the correct MIME type", () => {
      expect(exporter.getMimeType()).toBe("application/pdf");
    });

    it("should sanitize the file name properly", () => {
      expect(exporter.getFileName("Test: File?")).toBe("Klinik Pintar Laporan - Test- File-");
      expect(exporter.getFileName('Test/\\?%*:|"<> Characters')).toBe('Klinik Pintar Laporan - Test---------- Characters');
    });
    
    it("should successfully export a PDF", async () => {
      const result = await exporter.export(reportData);
      
      // Verify Buffer return
      expect(Buffer.isBuffer(result)).toBeTruthy();
      
      // Verify puppeteer was used
      expect(puppeteer.launch).toHaveBeenCalledWith({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      // Verify markdown was rendered
      expect(mockRender).toHaveBeenCalledWith(reportData.content);
      
      // Verify puppeteer page methods were called
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      expect(page.setContent).toHaveBeenCalled();
      expect(page.evaluate).toHaveBeenCalled();
      expect(page.pdf).toHaveBeenCalledWith({
        format: 'A4',
        margin: {
          top: '25mm',
          right: '25mm',
          bottom: '25mm',
          left: '25mm'
        },
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: expect.any(String),
        printBackground: true
      });
      
      // Verify browser was closed
      expect(browser.close).toHaveBeenCalled();
    });
  });
  

  
  describe("ImageUtils", () => {
    it("should convert image to base64", async () => {
      await exporter.export(reportData);
      
      // Verify the file is read
      expect(fs.promises.readFile).toHaveBeenCalled();
    });
    
    it("should handle image loading errors", async () => {
      // Mock readFile to throw an error
      (fs.promises.readFile as jest.Mock).mockRejectedValueOnce(new Error("File not found"));
      
      const result = await exporter.export(reportData);
      
      // Should still generate PDF despite logo error
      expect(Buffer.isBuffer(result)).toBeTruthy();
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe("PdfGenerator", () => {
    it("should handle Puppeteer errors gracefully", async () => {
      // Mock puppeteer to throw an error
      (puppeteer.launch as jest.Mock).mockRejectedValueOnce(new Error("Puppeteer error"));
      
      await expect(exporter.export(reportData)).rejects.toThrow(/Failed to export report/);
      expect(console.error).toHaveBeenCalled();
    });
    
    
    it("should close browser even if PDF generation fails", async () => {
      const mockBrowser = await puppeteer.launch();
      const mockPage = await mockBrowser.newPage();
      
      // Make page.pdf throw an error
      (mockPage.pdf as jest.Mock).mockRejectedValueOnce(new Error("PDF generation failed"));
      
      await expect(exporter.export(reportData)).rejects.toThrow();
      
      // Should still close the browser
      expect(mockBrowser.close).toHaveBeenCalled();
    });
  });
});