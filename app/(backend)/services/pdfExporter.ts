import { IExporter } from "@/app/(backend)/interfaces/IExporter";
import { ReportDTO } from "@/app/(backend)/dtos/report.dto";
import { generateReportContent } from "@/app/(backend)/utils/generateReportContent";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";

export class PdfExporter implements IExporter {
  async export(reportData: ReportDTO): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    const imageBytes = await fs.promises.readFile("public/logo-kp.png");
    const logoImage = await pdfDoc.embedPng(imageBytes);
    const logoDims = logoImage.scale(0.15);
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;

    // Gunakan struktur konten dari shared function
    const content = generateReportContent(reportData);

    // Pecah per baris agar bisa digambar line-by-line
    const lines = content.split("\n");
    const headerHeight = 60; 
    let y = height - headerHeight - 40; // ⬅️ tambahkan jarak setelah header

    // Logo
    const logoY = height - 60;
    const logoHeight = logoDims.height;

    page.drawImage(logoImage, {
      x: 50,
      y: logoY,
      width: logoDims.width,
      height: logoHeight,
    });

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

  getFileName(createdAt: string): string {
    return `report-${createdAt}.pdf`;
  }
}