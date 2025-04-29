import { IExporter } from "@/app/(backend)/interfaces/IExporter";
import { ReportDTO } from "@/app/(backend)/dtos/report.dto";
import { generateReportContent } from "@/app/(backend)/utils/generateReportContent";
import { PDFDocument, PDFFont, rgb, StandardFonts, PDFPage } from "pdf-lib";
import fs from "fs";

interface FormattedTextOptions {
  page: PDFPage;
  fonts: {
    normal: PDFFont;
    bold: PDFFont;
    italic: PDFFont;
  };
  fontSize: number;
}

function wrapText(text: string, maxWidth: number, font: PDFFont, size: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const textWidth = font.widthOfTextAtSize(testLine, size);

    if (textWidth < maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}

function drawFormattedText(line: string, xStart: number, y: number, options: FormattedTextOptions) {
  const { page, fonts, fontSize } = options;
  const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/);
  let x = xStart;

  for (const part of parts) {
    let text = part;
    let usedFont = fonts.normal;

    if (text.startsWith("**") && text.endsWith("**")) {
      text = text.slice(2, -2);
      usedFont = fonts.bold;
    } else if (text.startsWith("*") && text.endsWith("*")) {
      text = text.slice(1, -1);
      usedFont = fonts.italic;
    }

    page.drawText(text, {
      x,
      y,
      font: usedFont,
      size: fontSize,
      color: rgb(0, 0, 0),
    });

    x += usedFont.widthOfTextAtSize(text, fontSize);
  }
}

export class PdfExporter implements IExporter {
  async export(reportData: ReportDTO): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const fonts = await this.embedFonts(pdfDoc);
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontSize = 12;
    const headerHeight = 60;
    let y = height - headerHeight - 40;

    await this.drawLogo(pdfDoc, page, width, height);

    const content = generateReportContent(reportData);
    const lines = content.split("\n");

    let inCodeBlock = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (this.isCodeBlockStart(trimmed)) {
        inCodeBlock = true;
        continue;
      }

      if (this.isCodeBlockEnd(trimmed)) {
        inCodeBlock = false;
        continue;
      }

      const { isBullet, contentLine } = this.processLine(trimmed, line);
      const wrappedLines = wrapText(contentLine, width - 100 - (isBullet ? 10 : 0), fonts.normal, fontSize);

      for (const wrappedLine of wrappedLines) {
        if (y < 50) {
          page = pdfDoc.addPage([width, height]);
          y = height - 80;
        }

        if (inCodeBlock) {
          this.drawCodeLine(page, wrappedLine, fonts.mono, fontSize, y);
        } else if (isBullet && wrappedLine === wrappedLines[0]) {
          this.drawBullet(page, fonts.normal, fontSize, y);
          drawFormattedText(wrappedLine, 65, y, { page, fonts, fontSize });
        } else {
          drawFormattedText(wrappedLine, 50, y, { page, fonts, fontSize });
        }

        y -= fontSize + 6;
      }
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

  private async embedFonts(pdfDoc: PDFDocument) {
    const normal = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const italic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const mono = await pdfDoc.embedFont(StandardFonts.Courier);
    return { normal, bold, italic, mono };
  }

  private async drawLogo(pdfDoc: PDFDocument, page: PDFPage, width: number, height: number) {
    const imageBytes = await fs.promises.readFile("public/logo-kp.png");
    const logoImage = await pdfDoc.embedPng(imageBytes);
    const logoDims = logoImage.scale(0.15);

    const logoY = height - 60;
    page.drawImage(logoImage, {
      x: 50,
      y: logoY,
      width: logoDims.width,
      height: logoDims.height,
    });
  }

  private isCodeBlockStart(trimmedLine: string) {
    return trimmedLine === "```sql";
  }

  private isCodeBlockEnd(trimmedLine: string) {
    return trimmedLine === "```";
  }

  private processLine(trimmed: string, original: string) {
    const isBullet = trimmed.startsWith("* ");
    const contentLine = isBullet ? trimmed.slice(1).trimStart() : original;
    return { isBullet, contentLine };
  }

  private drawCodeLine(page: PDFPage, text: string, font: PDFFont, size: number, y: number) {
    page.drawText(text, {
      x: 50,
      y,
      font,
      size,
      color: rgb(0, 0, 0),
    });
  }

  private drawBullet(page: PDFPage, font: PDFFont, size: number, y: number) {
    page.drawText("•", {
      x: 50,
      y,
      font,
      size,
      color: rgb(0, 0, 0),
    });
  }
}