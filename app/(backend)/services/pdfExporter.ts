import { IExporter } from "@/app/(backend)/interfaces/IExporter";
import { ReportDTO } from "@/app/(backend)/dtos/report.dto";
import { generateReportContent } from "@/app/(backend)/utils/generateReportContent";
import { PDFDocument, PDFFont, rgb, StandardFonts, PDFPage } from "pdf-lib";
import fs from "fs";

function wrapText(text: string, maxWidth: number, font: PDFFont, size: number): string[] {
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

interface TextDrawOptions {
  xStart: number;
  y: number;
  fontSize: number;
  page: PDFPage;
  fonts: {
    regular: PDFFont;
    bold: PDFFont;
    italic: PDFFont;
    mono: PDFFont;
  };
}

function drawFormattedText(line: string, options: TextDrawOptions) {
  const { xStart, y, fontSize, page, fonts } = options;
  const parts = line.split(/(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*|`.*?`)/);
  let x = xStart;

  for (const part of parts) {
    let text = part;
    let usedFont = fonts.regular;
    let isInlineCode = false;

    if (/^\*\*\*.*\*\*\*$/.test(text)) {
      text = text.slice(3, -3);
      usedFont = fonts.bold;
    } else if (/^\*\*.*\*\*$/.test(text)) {
      text = text.slice(2, -2);
      usedFont = fonts.bold;
    } else if (/^\*.*\*$/.test(text)) {
      text = text.slice(1, -1);
      usedFont = fonts.italic;
    } else if (/^`.*`$/.test(text)) {
      text = text.slice(1, -1);
      usedFont = fonts.mono;
      isInlineCode = true;
    }

    const textWidth = usedFont.widthOfTextAtSize(text, fontSize);
    const textHeight = fontSize + 2;

    if (isInlineCode) {
      page.drawRectangle({ x: x - 2, y: y - 2, width: textWidth + 4, height: textHeight, color: rgb(0.9, 0.9, 0.9) });
    }

    page.drawText(text, { x, y, font: usedFont, size: fontSize, color: rgb(0, 0, 0) });
    x += textWidth;
  }
}

export class PdfExporter implements IExporter {
  async export(reportData: ReportDTO): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    // 🧠 Tambahan dari branch 303: custom PDF metadata
    pdfDoc.setTitle(reportData.title);
    pdfDoc.setAuthor("Klinik Pintar");
    pdfDoc.setSubject(`Laporan - ${reportData.title}`);
    pdfDoc.setCreator("Klinik Pintar AI Report Generator");

    const logoImage = await this.embedLogo(pdfDoc);
    const fonts = await this.loadFonts(pdfDoc);

    const fontSize = 12;
    const headerHeight = 60;
    let y = height - headerHeight - 40;
    const content = generateReportContent(reportData);

    page.drawImage(logoImage.image, { x: 50, y: height - 60, width: logoImage.width, height: logoImage.height });

    let inCodeBlock = false;
    let codeBlockType = '';
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Handle code block start/end markers with optional ID
      if (trimmed.startsWith("```")) {
        if (!inCodeBlock) {
          // Starting a code block - extract type but remove ID if present
          const codeBlockMatch = trimmed.match(/^```(\w+)(?:\s+id=[\w\d]+)?$/);
          if (codeBlockMatch) {
            codeBlockType = codeBlockMatch[1]; // Store the code block type (sql, js, etc.)
          } else {
            codeBlockType = '';
          }
          inCodeBlock = true;
        } else {
          // Ending a code block
          inCodeBlock = false;
          codeBlockType = '';
        }
        continue;
      }

      if (trimmed === "---") {
        page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.5, 0.5, 0.5) });
        y -= fontSize + 6;
        continue;
      }

      const styleInfo = this.extractStyle(trimmed);

      // If we're in a code block and this line has an ID, remove it before rendering
      let contentToRender = styleInfo.content;
      if (inCodeBlock && codeBlockType === 'sql') {
        // Check for ID pattern and remove it
        const idMatch = contentToRender.match(/^(\s*sql\s+id=[\w\d]+\s*)/i);
        if (idMatch) {
          contentToRender = contentToRender.slice(idMatch[0].length);
        }
      }

      const wrappedLines = wrapText(contentToRender, width - styleInfo.xStart - 50, fonts.regular, styleInfo.fontSize);

      for (const wrappedLine of wrappedLines) {
        if (y < 50) {
          page = pdfDoc.addPage([width, height]);
          y = height - 80;
        }

        if (inCodeBlock) {
          const codeLines = wrapText(wrappedLine, width - 100, fonts.mono, fontSize);
          for (const codeLine of codeLines) {
            page.drawText(codeLine, { x: 50, y, font: fonts.mono, size: fontSize, color: rgb(0, 0, 0) });
            y -= fontSize + 4;
          }
        } else {
          if (styleInfo.bullet && wrappedLine === wrappedLines[0]) {
            page.drawText("•", { x: 50, y, font: fonts.regular, size: fontSize, color: rgb(0, 0, 0) });
          }
          drawFormattedText(wrappedLine, { xStart: styleInfo.xStart, y, fontSize: styleInfo.fontSize, page, fonts });
          y -= styleInfo.fontSize + 6;
        }
      }

      if (["# ", "## ", ""].some(prefix => trimmed.startsWith(prefix))) y -= 4;
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  private async embedLogo(pdfDoc: PDFDocument) {
    const imageBytes = await fs.promises.readFile("public/logo-kp.png");
    const image = await pdfDoc.embedPng(imageBytes);
    const scaled = image.scale(0.15);
    return { image, width: scaled.width, height: scaled.height };
  }

  private async loadFonts(pdfDoc: PDFDocument) {
    return {
      regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
      bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
      italic: await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
      mono: await pdfDoc.embedFont(StandardFonts.Courier),
    };
  }

  private extractStyle(line: string) {
    const fontSize = 12;
    const trimmed = line.trim();

    if (trimmed.startsWith("# ")) {
      return { fontSize: 20, content: trimmed.slice(2), xStart: 50 };
    }

    if (trimmed.startsWith("## ")) {
      return { fontSize: 16, content: trimmed.slice(3), xStart: 50 };
    }

    if (trimmed.startsWith("### ")) {
      return { fontSize: 14, content: trimmed.slice(4), xStart: 50 };
    }

    if (trimmed.startsWith("> ")) {
      return { fontSize, content: trimmed.slice(2), xStart: 65 };
    }

    if (/^[-*+]\s/.test(trimmed)) {
      return { fontSize, content: trimmed.slice(2), xStart: 65, bullet: true };
    }

    const orderedMatch = /^(\d+)\.\s/.exec(trimmed);
    if (orderedMatch) {
      const number = orderedMatch[1];
      return {
        fontSize,
        content: trimmed.slice(orderedMatch[0].length),
        xStart: 65,
        prefix: `${number}. `,
      };
    }

    const linkMatch = /^\[(.*?)\]\((.*?)\)$/.exec(trimmed);
    if (linkMatch) {
      const text = linkMatch[1];
      const url = linkMatch[2];
      return { fontSize, content: `${text} (${url})`, xStart: 50 };
    }

    return { fontSize, content: trimmed, xStart: 50 };
  }

  getMimeType(): string {
    return "application/pdf";
  }

  getFileName(title: string): string {
    const sanitized = title.replace(/[/\\?%*:|"<>]/g, '-');
    return `Klinik Pintar Laporan - ${sanitized}`;
  }
}