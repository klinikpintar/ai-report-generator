import { POST } from "@/app/(backend)/api/ekspor/pdf/route";
import { NextRequest } from "next/server";
import { ReportDTO } from "@/app/(backend)/dtos/report.dto";

function createMockRequest(data: any, preview = false): NextRequest {
  const url = new URL(`http://localhost/api/ekspor/pdf${preview ? "?preview=true" : ""}`);
  return new NextRequest(url.toString(), {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
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

  it("should return 500 if export fails unexpectedly", async () => {
    jest.resetModules(); // pastikan fresh
    const mockPdfExporter = {
      export: jest.fn(() => { throw new Error("Simulated failure"); }),
      getMimeType: () => "application/pdf",
      getFileName: () => "mock.pdf"
    };
  
    jest.doMock("@/app/(backend)/services/pdfExporter", () => ({
      PdfExporter: jest.fn(() => mockPdfExporter)
    }));
  
    const { POST } = await import("@/app/(backend)/api/ekspor/pdf/route"); // import ulang setelah mock
  
    const req = new NextRequest("http://localhost/api/ekspor/pdf", {
      method: "POST",
      body: JSON.stringify({
        reportData: {
          title: "Test",
          content: "Should fail",
          createdAt: "2025-04-07"
        }
      }),
      headers: { "Content-Type": "application/json" }
    });
  
    const res = await POST(req);
    const json = await res.json();
  
    expect(res.status).toBe(500);
    expect(json.message).toBe("Gagal mengekspor laporan");
  
    jest.dontMock("@/app/(backend)/services/pdfExporter"); // restore default
  });   
});