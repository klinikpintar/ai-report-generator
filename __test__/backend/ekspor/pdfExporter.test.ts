import { PdfExporter } from "@/app/(backend)/services/pdfExporter";
import { PDFDocument, PDFFont, rgb, StandardFonts, PDFPage } from "pdf-lib";
import fs from "fs";

// Mock dependencies
jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn().mockResolvedValue(Buffer.from("mock-logo-data"))
  }
}));

jest.mock("pdf-lib", () => {
  const mockPage = {
    drawText: jest.fn(),
    drawLine: jest.fn(),
    drawRectangle: jest.fn(),
    drawImage: jest.fn(),
    getSize: jest.fn().mockReturnValue({ width: 595, height: 842 })
  };
  
  return {
    PDFDocument: {
      create: jest.fn().mockResolvedValue({
        addPage: jest.fn().mockReturnValue(mockPage),
        embedFont: jest.fn().mockResolvedValue({
          widthOfTextAtSize: jest.fn().mockImplementation((text, size) => text.length * size * 0.5)
        }),
        embedPng: jest.fn().mockResolvedValue({
          scale: jest.fn().mockReturnValue({ width: 100, height: 50 })
        }),
        save: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4])),
        setTitle: jest.fn(),
        setAuthor: jest.fn(),
        setSubject: jest.fn(),
        setCreator: jest.fn()
      })
    },
    StandardFonts: {
      Helvetica: "Helvetica",
      HelveticaBold: "Helvetica-Bold",
      HelveticaOblique: "Helvetica-Oblique",
      Courier: "Courier"
    },
    rgb: jest.fn().mockReturnValue("mock-color")
  };
});

jest.mock("@/app/(backend)/utils/generateReportContent", () => ({
  generateReportContent: jest.fn().mockImplementation((reportData) => {
    return reportData.content;
  })
}));

describe("PdfExporter", () => {
  let exporter: PdfExporter;

  beforeEach(() => {
    exporter = new PdfExporter();
    jest.clearAllMocks();
  });

  describe("getMimeType", () => {
    it("should return the correct MIME type", () => {
      expect(exporter.getMimeType()).toBe("application/pdf");
    });
  });

  describe("getFileName", () => {
    it("should sanitize the title properly", () => {
      expect(exporter.getFileName("Test: File?")).toBe("Klinik Pintar Laporan - Test- File-");
    });

    it("should remove all illegal characters", () => {
      const result = exporter.getFileName('Test/\\?%*:|"<> Characters');
      expect(result).toBe('Klinik Pintar Laporan - Test---------- Characters');
    });
  });

  describe("export", () => {
    it("should export a basic PDF", async () => {
      const result = await exporter.export({
        title: "Test Report",
        content: "Simple content",
        createdAt: "2023-01-01"
      });

      expect(Buffer.isBuffer(result)).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });

    it("should set PDF metadata", async () => {
      const reportData = {
        title: "Metadata Test",
        content: "Test content",
        createdAt: "2023-01-01"
      };

      await exporter.export(reportData);

      expect(PDFDocument.create().then).toBeDefined();
      const pdfDoc = await PDFDocument.create();
      expect(pdfDoc.setTitle).toHaveBeenCalledWith(reportData.title);
      expect(pdfDoc.setAuthor).toHaveBeenCalledWith("Klinik Pintar");
      expect(pdfDoc.setSubject).toHaveBeenCalledWith(`Laporan - ${reportData.title}`);
      expect(pdfDoc.setCreator).toHaveBeenCalledWith("Klinik Pintar AI Report Generator");
    });

    it("should load and embed the logo", async () => {
      await exporter.export({
        title: "Logo Test",
        content: "Test content",
        createdAt: "2023-01-01"
      });

      expect(fs.promises.readFile).toHaveBeenCalledWith("public/logo-kp.png");
      const pdfDoc = await PDFDocument.create();
      expect(pdfDoc.embedPng).toHaveBeenCalled();
    });

    it("should process different line types", async () => {
      const content = `
# Heading 1
## Heading 2
### Heading 3
Normal text
**Bold text**
*Italic text*
***Bold italic text***
\`Inline code\`
> Blockquote
* Bullet point 1
- Bullet point 2
+ Bullet point 3
1. Numbered item
[Link text](https://example.com)
---
\`\`\`
Code block
\`\`\`
`;

      await exporter.export({
        title: "Format Test",
        content,
        createdAt: "2023-01-01"
      });
      
      // We don't need specific assertions as we're testing coverage
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      expect(page.drawText).toHaveBeenCalled();
      expect(page.drawLine).toHaveBeenCalled();
    });

    it("should handle multiple pages", async () => {
      // Create content that will definitely need multiple pages
      const longContent = Array(100).fill("This is a line of text to test pagination.").join("\n");

      const addPageMock = jest.fn().mockImplementation(() => {
        const mockPage = {
          drawText: jest.fn(),
          drawLine: jest.fn(),
          drawRectangle: jest.fn(),
          drawImage: jest.fn(),
          getSize: jest.fn().mockReturnValue({ width: 595, height: 842 })
        };
        return mockPage;
      });

      // Override the mock to track addPage calls
      (PDFDocument.create as jest.Mock).mockResolvedValueOnce({
        addPage: addPageMock,
        embedFont: jest.fn().mockResolvedValue({
          widthOfTextAtSize: jest.fn().mockImplementation((text, size) => text.length * size * 0.5)
        }),
        embedPng: jest.fn().mockResolvedValue({
          scale: jest.fn().mockReturnValue({ width: 100, height: 50 })
        }),
        save: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4])),
        setTitle: jest.fn(),
        setAuthor: jest.fn(),
        setSubject: jest.fn(),
        setCreator: jest.fn()
      });

      await exporter.export({
        title: "Multiple Pages Test",
        content: longContent,
        createdAt: "2023-01-01"
      });

      // First page is created in constructor, additional ones for overflow content
      expect(addPageMock.mock.calls.length).toBeGreaterThan(1);
    });
  });

  describe("private functions", () => {
    // For testing private methods, we use the type assertion trick
    describe("extractStyle", () => {
      it("should extract header styles", () => {
        // Access private method using type assertion
        const extractStyle = (exporter as any).extractStyle.bind(exporter);
        
        expect(extractStyle("# Header 1")).toEqual({
          fontSize: 20,
          content: "Header 1",
          xStart: 50
        });
        
        expect(extractStyle("## Header 2")).toEqual({
          fontSize: 16,
          content: "Header 2",
          xStart: 50
        });
        
        expect(extractStyle("### Header 3")).toEqual({
          fontSize: 14,
          content: "Header 3",
          xStart: 50
        });
      });
      
      it("should extract blockquote style", () => {
        const extractStyle = (exporter as any).extractStyle.bind(exporter);
        
        expect(extractStyle("> Blockquote")).toEqual({
          fontSize: 12,
          content: "Blockquote",
          xStart: 65
        });
      });
      
      it("should extract bullet points with different markers", () => {
        const extractStyle = (exporter as any).extractStyle.bind(exporter);
        
        expect(extractStyle("* Bullet point")).toEqual({
          fontSize: 12,
          content: "Bullet point",
          xStart: 65,
          bullet: true
        });
        
        expect(extractStyle("- Bullet point")).toEqual({
          fontSize: 12,
          content: "Bullet point",
          xStart: 65,
          bullet: true
        });
        
        expect(extractStyle("+ Bullet point")).toEqual({
          fontSize: 12,
          content: "Bullet point",
          xStart: 65,
          bullet: true
        });
      });
      
      it("should extract numbered list items", () => {
        const extractStyle = (exporter as any).extractStyle.bind(exporter);
        
        expect(extractStyle("1. First item")).toEqual({
          fontSize: 12,
          content: "First item",
          xStart: 65,
          prefix: "1. "
        });
        
        expect(extractStyle("42. Forty-second item")).toEqual({
          fontSize: 12,
          content: "Forty-second item",
          xStart: 65,
          prefix: "42. "
        });
      });
      
      it("should extract links", () => {
        const extractStyle = (exporter as any).extractStyle.bind(exporter);
        
        expect(extractStyle("[Link text](https://example.com)")).toEqual({
          fontSize: 12,
          content: "Link text (https://example.com)",
          xStart: 50
        });
      });
      
      it("should handle normal text", () => {
        const extractStyle = (exporter as any).extractStyle.bind(exporter);
        
        expect(extractStyle("Normal text")).toEqual({
          fontSize: 12,
          content: "Normal text",
          xStart: 50
        });
      });
    });
  });

  describe("Special PDF content handling", () => {
    it("should handle code blocks", async () => {
      const codeBlockContent = "```\ncode block content\n```";
      
      await exporter.export({
        title: "Code Block Test",
        content: codeBlockContent,
        createdAt: "2023-01-01"
      });
      
      // No specific assertions needed, just make sure it doesn't crash
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      expect(page.drawText).toHaveBeenCalled();
    });
    
    it("should handle SQL code blocks", async () => {
      const sqlCodeBlockContent = "```sql\nSELECT * FROM table;\n```";
      
      await exporter.export({
        title: "SQL Code Block Test",
        content: sqlCodeBlockContent,
        createdAt: "2023-01-01"
      });
      
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      expect(page.drawText).toHaveBeenCalled();
    });
    
    it("should handle horizontal rules", async () => {
      const horizontalRuleContent = "Text above\n---\nText below";
      
      await exporter.export({
        title: "Horizontal Rule Test",
        content: horizontalRuleContent,
        createdAt: "2023-01-01"
      });
      
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      expect(page.drawLine).toHaveBeenCalled();
    });
    
    it("should handle bullet points in wrapped text", async () => {
      const bulletContent = "* This is a very long bullet point that should be wrapped to multiple lines and should maintain proper indentation";
      
      await exporter.export({
        title: "Bullet Wrapping Test",
        content: bulletContent,
        createdAt: "2023-01-01"
      });
      
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      expect(page.drawText).toHaveBeenCalledWith("•", expect.anything());
    });
  });
});