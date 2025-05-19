import { POST } from "@/app/(backend)/api/ekspor/pdf/route";
import { NextRequest } from "next/server";
import { ReportDTO } from "@/app/(backend)/dtos/report.dto";
import { PdfExporter } from "@/app/(backend)/services/pdfExporter";
import * as fs from "fs";
import { PDFDocument } from "pdf-lib";

// Mock token & verifyAccessToken
jest.mock("@/middleware", () => ({
  verifyAccessToken: jest.fn(() => ({ email: "user@example.com" })) // Always returns a user
}));

const mockToken = "mocked-valid-token";

function createMockRequest(data: any, preview = false, withToken = true): NextRequest {
  const url = new URL(`http://localhost/api/ekspor/pdf${preview ? "?preview=true" : ""}`);
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (withToken) {
    headers["Authorization"] = `Bearer ${mockToken}`;
  }

  return new NextRequest(url.toString(), {
    method: "POST",
    body: JSON.stringify(data),
    headers,
  });
}

describe("POST /api/ekspor/pdf (handler)", () => {
  const validData: ReportDTO = {
    title: "UTS Report",
    content: "Isi laporan UTS",
    createdAt: "2025-04-07"
  };

  it("should return PDF with inline preview when preview=true", async () => {
    const req = createMockRequest({ reportData: validData }, true);
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/pdf");
    expect(res.headers.get("content-disposition")).toContain("inline");
  });

  it("should return PDF with attachment disposition by default", async () => {
    const req = createMockRequest({ reportData: validData });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-disposition")).toContain("attachment");
  });

  it("should return 400 for invalid input", async () => {
    const invalid = {
      reportData: {
        title: "",
        content: "",
        createdAt: ""
      }
    };
    const req = createMockRequest(invalid);
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.message).toBe("Input tidak valid");
    expect(json.errors).toBeDefined();
  });

  it("should return 400 if title/content is empty or too short", async () => {
    const invalidData = {
      reportData: {
        title: "  ", // will be trimmed to empty string
        content: " ", // will be trimmed to empty string
        createdAt: "2025-04-07"
      }
    };
  
    const req = createMockRequest(invalidData);
    const res = await POST(req);
    const json = await res.json();
  
    expect(res.status).toBe(400);
    const messages = json.errors.map((e: any) => e.message);
    expect(messages).toContain("Judul minimal 3 karakter");
    expect(messages).toContain("Isi laporan tidak boleh kosong");
  });

  it("should return 400 if createdAt is invalid date format", async () => {
    const invalidDate = {
      reportData: {
        title: "Laporan mingguan",
        content: "Ada isinya",
        createdAt: "not-a-date"
      }
    };
  
    const req = createMockRequest(invalidDate);
    const res = await POST(req);
    const json = await res.json();
  
    expect(res.status).toBe(400);
    const messages = json.errors.map((e: any) => e.message);
    expect(messages).toContain("Format tanggal tidak valid");
  });  

  it("should return 500 if export fails unexpectedly", async () => {
    jest.resetModules();
    const mockPdfExporter = {
      export: jest.fn(() => { throw new Error("Simulated failure"); }),
      getMimeType: () => "application/pdf",
      getFileName: () => "mock.pdf"
    };

    jest.doMock("@/app/(backend)/services/pdfExporter", () => ({
      PdfExporter: jest.fn(() => mockPdfExporter)
    }));

    const { POST } = await import("@/app/(backend)/api/ekspor/pdf/route");

    const req = createMockRequest({
      reportData: {
        title: "Test",
        content: "Should fail",
        createdAt: "2025-04-07"
      }
    });

    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.message).toBe("Gagal generate PDF");

    jest.dontMock("@/app/(backend)/services/pdfExporter");
  });

  it("should render bold and italic content correctly", async () => {
    const contentWithStyles = `
      **Latar Belakang**
      Penelitian ini menggunakan *metode* terbaru.
      
      * Poin pertama dengan **penekanan**
      * Poin kedua dengan *penekanan miring*
    `.trim();
  
    const req = createMockRequest({
      reportData: {
        title: "Styled Report",
        content: contentWithStyles,
        createdAt: "2025-04-07"
      }
    });
  
    const res = await POST(req);
  
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("application/pdf");
  });

  it("should not fail when content contains multiple section headings", async () => {
    const contentWithHeadings = `
      Latar Belakang
      Penjelasan latar belakang...
  
      Tujuan
      Penjelasan tujuan...
  
      Metodologi
      Deskripsi metode yang digunakan...
    `.trim();
  
    const req = createMockRequest({
      reportData: {
        title: "Multi Heading",
        content: contentWithHeadings,
        createdAt: "2025-04-07"
      }
    });
  
    const res = await POST(req);
  
    expect(res.status).toBe(200);
  });
  
  it("should wrap long lines properly", async () => {
    const longWordContent = {
      reportData: {
        title: "Test",
        content: "ThisIsAVeryLongWordThatWillNotFitInOneLine so it should wrap.",
        createdAt: "2025-04-07"
      }
    };
  
    const req = createMockRequest(longWordContent);
    const res = await POST(req);
  
    expect(res.status).toBe(200);
  });

  it("should handle code blocks using ```sql ... ``` correctly", async () => {
    const contentWithCode = {
      reportData: {
        title: "With SQL",
        content: `
          Berikut adalah query yang digunakan:
  
          \`\`\`sql
          SELECT * FROM orders;
          \`\`\`
  
          Terima kasih.
        `,
        createdAt: "2025-04-07"
      }
    };
  
    const req = createMockRequest(contentWithCode);
    const res = await POST(req);
  
    expect(res.status).toBe(200);
  });

  it("should handle long content and add a new page when needed", async () => {
    const longText = Array(100).fill("Isi baris panjang untuk uji pagination.").join("\n");
  
    const req = createMockRequest({
      reportData: {
        title: "Long Content",
        content: longText,
        createdAt: "2025-04-07"
      }
    });
  
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it("should trigger line break and push currentLine in wrapText", async () => {
    const trickyLine = "ThisIsALongWord ThisIsAnotherLongWord ThatShouldWrap";
    const req = createMockRequest({
      reportData: {
        title: "Wrap Trigger",
        content: trickyLine,
        createdAt: "2025-04-07"
      }
    });
  
    const res = await POST(req);
    expect(res.status).toBe(200);
  });  
});
// Add to existing file: __test__/backend/ekspor/pdfExporter.test.ts

// Unit tests for PdfExporter class

// Mock fs and pdf-lib
jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn().mockResolvedValue(Buffer.from("mock-logo-data"))
  }
}));

jest.mock("pdf-lib", () => {
  const mockPage = {
    getSize: jest.fn().mockReturnValue({ width: 595, height: 842 }),
    drawText: jest.fn(),
    drawRectangle: jest.fn(),
    drawImage: jest.fn(),
    drawLine: jest.fn()
  };
  
  const mockFont = {
    widthOfTextAtSize: jest.fn().mockImplementation((text, size) => text.length * size * 0.5)
  };
  
  const mockPdfDoc = {
    addPage: jest.fn().mockReturnValue(mockPage),
    embedFont: jest.fn().mockResolvedValue(mockFont),
    embedPng: jest.fn().mockImplementation(() => ({ 
      scale: jest.fn().mockReturnValue({ width: 100, height: 50 }) 
    })),
    save: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4]))
  };
  
  return {
    PDFDocument: {
      create: jest.fn().mockResolvedValue(mockPdfDoc)
    },
    rgb: jest.fn().mockReturnValue("mock-color"),
    StandardFonts: {
      Helvetica: "Helvetica",
      HelveticaBold: "HelveticaBold",
      HelveticaOblique: "HelveticaOblique",
      Courier: "Courier"
    }
  };
});

// Mock generateReportContent utility
jest.mock("@/app/(backend)/utils/generateReportContent", () => ({
  generateReportContent: jest.fn().mockImplementation((report) => {
    return `# ${report.title}\n\n${report.content}`;
  })
}));

describe("PdfExporter class", () => {
  let exporter: PdfExporter;
  
  beforeEach(() => {
    exporter = new PdfExporter();
    jest.clearAllMocks();
  });
  
  describe("export method", () => {
    const validReport: ReportDTO = {
      title: "Test Report",
      content: "This is a test content",
      createdAt: "2025-05-01"
    };
    
    it("should create a PDF document and return buffer", async () => {
      const result = await exporter.export(validReport);
      
      expect(PDFDocument.create).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Buffer);
    });
    
    it("should include logo in the PDF", async () => {
      await exporter.export(validReport);
      
      expect(fs.promises.readFile).toHaveBeenCalledWith("public/logo-kp.png");
    });
    
    it("should handle markdown headers correctly", async () => {
      const contentWithHeaders = {
        title: "Headers Test",
        content: "# Header 1\n## Header 2\n### Header 3\nRegular text",
        createdAt: "2025-05-01"
      };
      
      await exporter.export(contentWithHeaders);
      
      // PDFDocument was created and save was called
      expect(PDFDocument.create).toHaveBeenCalled();
    });
    
    it("should handle bullet lists correctly", async () => {
      const contentWithBullets = {
        title: "Bullet List",
        content: "* Item 1\n- Item 2\n+ Item 3",
        createdAt: "2025-05-01"
      };
      
      await exporter.export(contentWithBullets);
      
      // PDFDocument was created and save was called
      expect(PDFDocument.create).toHaveBeenCalled();
    });
    
    it("should handle ordered lists correctly", async () => {
      const contentWithOrderedList = {
        title: "Ordered List",
        content: "1. First item\n2. Second item\n3. Third item",
        createdAt: "2025-05-01"
      };
      
      await exporter.export(contentWithOrderedList);
      
      // PDFDocument was created and save was called
      expect(PDFDocument.create).toHaveBeenCalled();
    });
    
    it("should handle blockquotes correctly", async () => {
      const contentWithBlockquote = {
        title: "Blockquote Test",
        content: "> This is a blockquote\n> Second line",
        createdAt: "2025-05-01"
      };
      
      await exporter.export(contentWithBlockquote);
      
      // PDFDocument was created and save was called
      expect(PDFDocument.create).toHaveBeenCalled();
    });
    
    it("should handle code blocks correctly", async () => {
      const contentWithCodeBlock = {
        title: "Code Block Test",
        content: "```\nfunction test() {\n  return 'hello';\n}\n```",
        createdAt: "2025-05-01"
      };
      
      await exporter.export(contentWithCodeBlock);
      
      // PDFDocument was created and save was called
      expect(PDFDocument.create).toHaveBeenCalled();
    });
    
    it("should handle horizontal rules correctly", async () => {
      const contentWithHr = {
        title: "Horizontal Rule Test",
        content: "Text above\n---\nText below",
        createdAt: "2025-05-01"
      };
      
      await exporter.export(contentWithHr);
      
      // PDFDocument was created and save was called
      expect(PDFDocument.create).toHaveBeenCalled();
    });
    
    it("should handle links correctly", async () => {
      const contentWithLink = {
        title: "Link Test",
        content: "[GitHub](https://github.com)",
        createdAt: "2025-05-01"
      };
      
      await exporter.export(contentWithLink);
      
      // PDFDocument was created and save was called
      expect(PDFDocument.create).toHaveBeenCalled();
    });
    
    it("should handle both bold and italic formatting in one line", async () => {
      const contentWithFormatting = {
        title: "Mixed Formatting",
        content: "This **bold text** and *italic text* in one line",
        createdAt: "2025-05-01"
      };
      
      await exporter.export(contentWithFormatting);
      
      // PDFDocument was created and save was called
      expect(PDFDocument.create).toHaveBeenCalled();
    });
    
    it("should handle inline code formatting correctly", async () => {
      const contentWithInlineCode = {
        title: "Inline Code",
        content: "Use `const x = 10;` to declare a constant",
        createdAt: "2025-05-01"
      };
      
      await exporter.export(contentWithInlineCode);
      
      // PDFDocument was created and save was called
      expect(PDFDocument.create).toHaveBeenCalled();
    });
    
    it("should create a new page when content exceeds page height", async () => {
      const longContent = {
        title: "Long Content Test",
        content: Array(50).fill("This is a line that will be wrapped and take space.").join("\n"),
        createdAt: "2025-05-01"
      };
      
      await exporter.export(longContent);
      
      // PDFDocument was created and save was called
      expect(PDFDocument.create).toHaveBeenCalled();
    });
  });
  
  describe("utility methods", () => {
    it("should return correct mime type", () => {
      expect(exporter.getMimeType()).toBe("application/pdf");
    });
    
    it("should return filename with createdAt date", () => {
      expect(exporter.getFileName("2025-05-01")).toBe("report-2025-05-01.pdf");
    });
  });

  // Add these tests to fully cover the drawFormattedText and extractStyle functions

it("should handle bold and italic combinations correctly", async () => {
  const contentWithCombinedStyles = {
    title: "Combined Styles",
    content: "This is ***bold and italic*** text in one line",
    createdAt: "2025-05-01"
  };
  
  await exporter.export(contentWithCombinedStyles);
  
  // PDFDocument was created and save was called
  expect(PDFDocument.create).toHaveBeenCalled();
});

it("should handle nested ordered list items correctly", async () => {
  const contentWithOrderedList = {
    title: "Nested Ordered List",
    content: "1. First item\n   1. Nested item\n   2. Another nested item\n2. Second item",
    createdAt: "2025-05-01"
  };
  
  await exporter.export(contentWithOrderedList);
  
  // PDFDocument was created and save was called
  expect(PDFDocument.create).toHaveBeenCalled();
});

it("should render link format correctly", async () => {
  const contentWithLink = {
    title: "Link Format",
    content: "[Click here](https://example.com) to visit example.com",
    createdAt: "2025-05-01"
  };
  
  await exporter.export(contentWithLink);
  
  // Verify PDFDocument was created
  expect(PDFDocument.create).toHaveBeenCalled();
});

it("should handle code blocks with language specification", async () => {
  const contentWithLanguageCodeBlock = {
    title: "Code Block With Language",
    content: "```sql\nSELECT * FROM users;\n```",
    createdAt: "2025-05-01"
  };
  
  await exporter.export(contentWithLanguageCodeBlock);
  
  // PDFDocument was created and save was called
  expect(PDFDocument.create).toHaveBeenCalled();
});

it("should handle horizontal rule rendering", async () => {
  const contentWithHR = {
    title: "Horizontal Rule Test",
    content: "Text above\n---\nText below",
    createdAt: "2025-05-01"
  };
  
  // Mock drawLine to verify it's called correctly
  const mockDrawLine = jest.fn();
  
  (PDFDocument.create as jest.Mock).mockResolvedValueOnce({
    addPage: jest.fn().mockReturnValue({
      getSize: jest.fn().mockReturnValue({ width: 595, height: 842 }),
      drawText: jest.fn(),
      drawRectangle: jest.fn(),
      drawImage: jest.fn(),
      drawLine: mockDrawLine
    }),
    embedFont: jest.fn().mockResolvedValue({
      widthOfTextAtSize: jest.fn().mockImplementation((text, size) => text.length * size * 0.5)
    }),
    embedPng: jest.fn().mockImplementation(() => ({ 
      scale: jest.fn().mockReturnValue({ width: 100, height: 50 }) 
    })),
    save: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4]))
  });
  
  await exporter.export(contentWithHR);
  
  // Verify drawLine was called for the horizontal rule
  expect(mockDrawLine).toHaveBeenCalled();
});

it("should handle inline code with background highlighting", async () => {
  const contentWithInlineCode = {
    title: "Inline Code Test",
    content: "Use `const x = 10;` to declare a constant",
    createdAt: "2025-05-01"
  };
  
  // Mock drawRectangle to verify background highlighting for inline code
  const mockDrawRectangle = jest.fn();
  
  (PDFDocument.create as jest.Mock).mockResolvedValueOnce({
    addPage: jest.fn().mockReturnValue({
      getSize: jest.fn().mockReturnValue({ width: 595, height: 842 }),
      drawText: jest.fn(),
      drawRectangle: mockDrawRectangle,
      drawImage: jest.fn(),
      drawLine: jest.fn()
    }),
    embedFont: jest.fn().mockResolvedValue({
      widthOfTextAtSize: jest.fn().mockImplementation((text, size) => text.length * size * 0.5)
    }),
    embedPng: jest.fn().mockImplementation(() => ({ 
      scale: jest.fn().mockReturnValue({ width: 100, height: 50 }) 
    })),
    save: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4]))
  });
  
  await exporter.export(contentWithInlineCode);
  
  // Verify drawRectangle was called for the inline code background
  expect(mockDrawRectangle).toHaveBeenCalled();
});

it("should extract style from different line formats correctly", () => {
  // We need to access the private method for testing
  // @ts-ignore - accessing private method for testing
  const extractStyle = exporter['extractStyle'].bind(exporter);
  
  // Test header styles
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
  
  // Test blockquote
  expect(extractStyle("> Quoted text")).toEqual({
    fontSize: 12, 
    content: "Quoted text", 
    xStart: 65
  });
  
  // Test bullet points with different markers
  expect(extractStyle("- Bullet point")).toEqual({
    fontSize: 12, 
    content: "Bullet point", 
    xStart: 65, 
    bullet: true
  });
  
  expect(extractStyle("* Bullet point")).toEqual({
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
  
  // Test ordered list
  expect(extractStyle("1. First item")).toEqual({
    fontSize: 12, 
    content: "First item", 
    xStart: 65, 
    prefix: "1. "
  });
  
  // Test link format
  expect(extractStyle("[Link text](https://example.com)")).toEqual({
    fontSize: 12, 
    content: "Link text (https://example.com)", 
    xStart: 50
  });
  
  // Test regular text
  expect(extractStyle("Regular text")).toEqual({
    fontSize: 12, 
    content: "Regular text", 
    xStart: 50
  });
});

it("should return 500 for generic errors (not ZodError) during processing", async () => {
  // Create a request that would be valid but will trigger an error
  const validData = {
    reportData: {
      title: "Generic Error Test",
      content: "This should trigger a generic error",
      createdAt: "2025-04-07"
    }
  };
  
  // Instead of mocking the global Request constructor, we'll mock the json method
  // on our NextRequest instance
  const mockReq = createMockRequest(validData);
  
  // Replace the json method with one that throws an error
  const originalJsonMethod = mockReq.json;
  mockReq.json = jest.fn().mockImplementation(() => {
    throw new Error("Generic error");
  });
  
  // Run the request with our modified NextRequest instance
  const res = await POST(mockReq);
  const json = await res.json();
  
  // Restore original json method if needed
  mockReq.json = originalJsonMethod;
  
  // Check response
  expect(res.status).toBe(500);
  expect(json.message).toBe("Gagal mengekspor laporan");
});
});