import { PdfExporter } from "@/app/(backend)/services/pdfExporter";
import { ReportDTO } from "@/app/(backend)/dtos/report.dto";

describe("PdfExporter", () => {
  const mockData: ReportDTO = {
    title: "Weekly Report",
    content: "Isi laporan mingguan",
    createdAt: "2025-04-07"
  };

  it("should return a PDF buffer", async () => {
    const exporter = new PdfExporter();
    const buffer = await exporter.export(mockData);
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(100); // should not be empty
  });

  it("should return correct mime type", () => {
    const exporter = new PdfExporter();
    expect(exporter.getMimeType()).toBe("application/pdf");
  });

  it("should return a valid file name", () => {
    const exporter = new PdfExporter();
    const filename = exporter.getFileName();
    expect(filename).toMatch(/^report-\d+\.pdf$/);
  });
});