import { IExporter } from "@/app/(backend)/interfaces/IExporter";
import { ReportDTO } from "@/app/(backend)/dtos/report.dto";
import { generateReportContent } from "@/app/(backend)/utils/generateReportContent";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export class PdfExporter implements IExporter {
  async export(reportData: ReportDTO): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;

    // Gunakan struktur konten dari shared function
    const content = generateReportContent(reportData);

    // Pecah per baris agar bisa digambar line-by-line
    const lines = content.split("\n");
    let y = height - 50;

    for (const line of lines) {
      page.drawText(line, {
        x: 50,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
        maxWidth: width - 100
      });
      y -= fontSize + 6; // jarak antar baris
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  getMimeType(): string {
    return "application/pdf";
  }

  getFileName(): string {
    return `report-${Date.now()}.pdf`;
  }
}