import { IExporter } from "@/app/(backend)/interfaces/IExporter";
import { ReportDTO } from "@/app/(backend)/dtos/report.dto";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export class PdfExporter implements IExporter {
  async export(reportData: ReportDTO): Promise<Buffer> {
    const { title, content, createdAt } = reportData;
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;

    page.drawText(`${title}\nCreated at: ${createdAt}\n\n${content}`, {
      x: 50,
      y: height - 50,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
      maxWidth: width - 100
    });

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