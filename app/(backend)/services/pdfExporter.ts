import { IExporter } from "@/app/(backend)/interfaces/IExporter";
import { ReportDTO } from "@/app/(backend)/dtos/report.dto";
import { generateReportContent } from "@/app/(backend)/utils/generateReportContent";
import { PDFDocument, PDFFont, rgb, StandardFonts, PDFPage } from "pdf-lib";
import fs from "fs";

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

// 🔧 Fungsi untuk menggambar teks dengan inline bold (**...**)
function drawFormattedText(
  line: string,
  xStart: number,
  y: number,
  fontSize: number,
  page: PDFPage,
  font: PDFFont,
  fontBold: PDFFont,
  fontItalic: PDFFont
) {
  // Match urutan **bold**, *italic*, dan plain teks
  const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/);
  let x = xStart;

  for (const part of parts) {
    let text = part;
    let usedFont = font;

    if (text.startsWith("**") && text.endsWith("**")) {
      text = text.slice(2, -2);
      usedFont = fontBold;
    } else if (text.startsWith("*") && text.endsWith("*")) {
      text = text.slice(1, -1);
      usedFont = fontItalic;
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
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    const imageBytes = await fs.promises.readFile("public/logo-kp.png");
    const logoImage = await pdfDoc.embedPng(imageBytes);
    const logoDims = logoImage.scale(0.15);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);
    const fontSize = 12;

    const content = generateReportContent(reportData);
    const lines = content.split("\n");
    const headerHeight = 60;
    let y = height - headerHeight - 40;

    const logoY = height - 60;
    page.drawImage(logoImage, {
      x: 50,
      y: logoY,
      width: logoDims.width,
      height: logoDims.height,
    });

    let inCodeBlock = false;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed === "```sql") {
        inCodeBlock = true;
        continue;
      }

      if (trimmed === "```") {
        inCodeBlock = false;
        continue;
      }

      const isBullet = trimmed.startsWith("* ");
      const bulletOffset = isBullet ? 10 : 0;
      const contentLine = isBullet ? trimmed.slice(1).trimStart() : line;

      const wrappedLines = wrapText(contentLine, width - 100 - bulletOffset, font, fontSize);

      for (const wrappedLine of wrappedLines) {
        if (y < 50) {
          page = pdfDoc.addPage([width, height]);
          y = height - 80;
        }

        if (inCodeBlock) {
          page.drawText(wrappedLine, {
            x: 50,
            y,
            font: fontMono,
            size: fontSize,
            color: rgb(0, 0, 0),
          });
        } else {
          if (isBullet && wrappedLine === wrappedLines[0]) {
            page.drawText("•", {
              x: 50,
              y,
              font,
              size: fontSize,
              color: rgb(0, 0, 0),
            });
            drawFormattedText(wrappedLine, 65, y, fontSize, page, font, fontBold, fontItalic);

          } else {
            drawFormattedText(wrappedLine, 50, y, fontSize, page, font, fontBold, fontItalic);
          }
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

  getFileName(title: string): string {
    const sanitized = title.replace(/[/\\?%*:|"<>]/g, '-');
    return `Klinik Pintar Laporan - ${sanitized}.pdf`;
  }
}