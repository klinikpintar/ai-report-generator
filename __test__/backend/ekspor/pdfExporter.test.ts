import { POST } from "@/app/(backend)/api/ekspor/pdf/route";
import { NextRequest } from "next/server";
import { ReportDTO } from "@/app/(backend)/dtos/report.dto";

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

  it("should return 401 if token is missing", async () => {
    const req = createMockRequest({ reportData: validData }, false, false);
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.message).toBe("Missing token");
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