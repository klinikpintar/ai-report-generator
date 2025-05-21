import { IExporter } from "@/app/(backend)/interfaces/IExporter";
import { ReportDTO } from "@/app/(backend)/dtos/report.dto";
import path from "path";
import fs from "fs";
import puppeteer, { Browser, PDFOptions } from "puppeteer";
import MarkdownIt from "markdown-it";
import MarkdownItHighlight from "markdown-it-highlightjs";

/**
 * Konfigurasi untuk styling PDF
 */
const PDF_CONFIG = {
  format: 'A4',
  margins: {
    top: '25mm',
    right: '25mm',
    bottom: '25mm',
    left: '25mm'
  },
  fonts: {
    family: 'Inter, sans-serif',
    sizes: {
      normal: 11,
      h1: 24,
      h2: 20,
      h3: 18,
      small: 10
    }
  },
  colors: {
    text: '#333',
    lightText: '#666',
    link: '#0366d6',
    codeBackground: '#f5f7f9',
    codeText: '#444',
    codeBorder: '#e8eef2',
    blockCodeBackground: '#f8f9fa',
    blockCodeBorder: '#e9ecef',
    hr: '#ddd',
    blockquoteBorder: '#ddd',
    // Syntax highlighting colors
    syntax: {
      base: '#444444',
      keyword: '#4b69c6',
      function: '#2a9292',
      number: '#3b8a63',
      string: '#b46b54',
      comment: '#699a45',
      operator: '#777777',
      variable: '#7c5295'
    }
  }
};

/**
 * Kelas utilitas untuk mengonversi gambar ke format Base64
 */
class ImageUtils {
  /**
   * Membaca file gambar dan mengonversinya ke format base64 data URL
   */
  static async getBase64Image(filePath: string): Promise<string> {
    try {
      const data = await fs.promises.readFile(filePath);
      const base64 = data.toString('base64');
      const mimeType = 'image/png';
      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      console.error(`Error loading image from ${filePath}:`, error);
      return 'data:image/png;base64,';
    }
  }
}

/**
 * Kelas untuk menangani konversi Markdown ke HTML
 */
class MarkdownRenderer {
  private md: MarkdownIt;

  constructor() {
    this.md = new MarkdownIt({
      html: true,
      linkify: false,
      typographer: true
    });

    this.configureInlineCodeRenderer();
    this.configureSyntaxHighlighting();
  }

  /**
   * Konfigurasi untuk renderer inline code
   */
  private configureInlineCodeRenderer(): void {
    const originalInlineRenderer = this.md.renderer.rules.code_inline;
    this.md.renderer.rules.code_inline = (tokens, idx, options, env, slf) => {
      const token = tokens[idx];
      token.attrJoin('class', 'inline-code');
      return originalInlineRenderer
        ? originalInlineRenderer(tokens, idx, options, env, slf)
        : `<code class="inline-code">${this.md.utils.escapeHtml(token.content)}</code>`;
    };
  }

  /**
   * Konfigurasi untuk syntax highlighting
   */
  private configureSyntaxHighlighting(): void {
    this.md.use(MarkdownItHighlight, { inline: true });
  }

  /**
   * Render markdown menjadi HTML
   */
  render(markdown: string): string {
    return this.md.render(markdown);
  }
}

/**
 * Kelas untuk menghasilkan CSS styles
 */
class StyleGenerator {
  /**
   * Menghasilkan CSS untuk dokumen PDF
   */
  generateStyles(): string {
    const cfg = PDF_CONFIG;

    return `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      
      body {
        font-family: ${cfg.fonts.family};
        margin: 0;
        color: ${cfg.colors.text};
        line-height: 1.5;
        padding-bottom: 40px;
      }
      
      .report-container {
        max-width: 100%;
        margin: 0 auto;
      }
      
      .logo {
        max-width: 130px;
        margin-bottom: 20px;
      }
      
      h1 {
        font-size: ${cfg.fonts.sizes.h1}px;
        font-weight: 700;
        margin-top: 16px;
        margin-bottom: 16px;
      }
      
      h2 {
        font-size: ${cfg.fonts.sizes.h2}px;
        font-weight: 700;
        margin-top: 12px;
        margin-bottom: 12px;
      }
      
      h3 {
        font-size: ${cfg.fonts.sizes.h3}px;
        font-weight: 700;
        margin-top: 8px;
        margin-bottom: 8px;
      }
      
      p {
        margin-top: 8px;
        margin-bottom: 8px;
      }
      
      ul, ol {
        padding-left: 20px;
        margin-top: 8px;
        margin-bottom: 8px;
      }
      
      li {
        margin-top: 4px;
        margin-bottom: 4px;
      }
      
      /* Standardize all inline code with same style */
      code, code.inline-code, .inline-code {
        background-color: ${cfg.colors.codeBackground};
        padding: 2px 4px;
        border-radius: 4px;
        font-family: 'Courier New', Courier, monospace;
        font-size: 0.9em;
        color: ${cfg.colors.codeText} !important;
        text-decoration: none !important;
        border: 1px solid ${cfg.colors.codeBorder};
      }
      
      /* Override any link styling inside code */
      a code, code a, a .inline-code, .inline-code a {
        color: ${cfg.colors.codeText} !important;
        text-decoration: none !important;
      }
      
      pre {
        background-color: ${cfg.colors.blockCodeBackground};
        color: ${cfg.colors.codeText};
        padding: 16px;
        border-radius: 8px;
        overflow-x: auto;
        margin-top: 8px;
        margin-bottom: 8px;
        border: 1px solid ${cfg.colors.blockCodeBorder};
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      }
      
      pre code {
        background-color: transparent;
        padding: 0;
        color: ${cfg.colors.codeText};
        font-family: 'Courier New', Courier, monospace;
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow-wrap: break-word;
        border: none;
      }
      
      blockquote {
        border-left: 4px solid ${cfg.colors.blockquoteBorder};
        padding-left: 16px;
        margin-left: 0;
        margin-top: 8px;
        margin-bottom: 8px;
        color: ${cfg.colors.lightText};
      }
      
      hr {
        border: 0;
        height: 1px;
        background: ${cfg.colors.hr};
        margin: 24px 0;
      }
      
      /* Syntax highlighting colors */
      .hljs {
        background: transparent;
        color: ${cfg.colors.syntax.base};
      }
      
      .hljs-keyword, .language-sql .hljs-keyword {
        color: ${cfg.colors.syntax.keyword};
        font-weight: 600;
      }
      
      .hljs-built_in, .hljs-type, .language-sql .hljs-built_in {
        color: ${cfg.colors.syntax.function};
      }
      
      .hljs-number, .hljs-class, .language-sql .hljs-number {
        color: ${cfg.colors.syntax.number};
      }
      
      .hljs-string, .hljs-meta-string {
        color: ${cfg.colors.syntax.string};
      }
      
      .hljs-comment, .hljs-quote {
        color: ${cfg.colors.syntax.comment};
      }
      
      .hljs-operator, .language-sql .hljs-operator {
        color: ${cfg.colors.syntax.operator};
      }
      
      .hljs-variable, .hljs-template-variable, .language-sql .hljs-variable {
        color: ${cfg.colors.syntax.variable};
      }
      
      /* Link styling */
      a:not(code) {
        color: ${cfg.colors.link};
        text-decoration: none;
      }
      
      a:hover:not(code) {
        text-decoration: underline;
      }
      
      .footer {
        margin-top: 40px;
        text-align: right;
        font-size: 12px;
        color: ${cfg.colors.lightText};
      }
    `;
  }
}

/**
 * Kelas untuk menghasilkan HTML
 */
class HtmlGenerator {
  private styleGenerator: StyleGenerator;

  constructor() {
    this.styleGenerator = new StyleGenerator();
  }

  /**
   * Menghasilkan HTML dari konten markdown yang telah dirender
   */
  async generateHtml(reportData: ReportDTO, renderedContent: string): Promise<string> {
    try {
      // Load logo
      const logoPath = path.resolve("public/logo-kp.png");
      const logoBase64 = await ImageUtils.getBase64Image(logoPath);

      // Format tanggal
      const createdDate = new Date(reportData.createdAt).toLocaleDateString();

      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>${reportData.title}</title>
            <style>${this.styleGenerator.generateStyles()}</style>
          </head>
          <body>
            <div class="report-container">
              <img src="${logoBase64}" class="logo" alt="Klinik Pintar Logo" />
              <div class="report-content">
                ${renderedContent}
              </div>
              <div class="footer">
                Generated on ${createdDate} by Klinik Pintar AI Report Generator
              </div>
            </div>
          </body>
        </html>
      `;
    } catch (error) {
      console.error("Error generating HTML:", error);
      throw new Error("Failed to generate HTML for report");
    }
  }

  /**
   * Menghasilkan template footer untuk halaman PDF
   */
  generateFooterTemplate(): string {
    return `
      <div style="width: 100%; font-size: 10px; color: #666; padding: 0 25mm; display: flex; justify-content: center;">
        <div>Halaman <span class="pageNumber"></span> dari <span class="totalPages"></span></div>
      </div>
    `;
  }
}

/**
 * Kelas untuk menghasilkan PDF
 */
class PdfGenerator {
  /**
   * Menghasilkan PDF dari HTML
   */
  async generatePdf(html: string, footerTemplate: string): Promise<Buffer> {
    let browser: Browser | null = null;

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();

      // Render HTML content
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Menambahkan handler JavaScript untuk menyeragamkan tampilan inline code
      await page.evaluate(this.inlineCodeConsistencyScript);

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: PDF_CONFIG.format as PDFOptions['format'],
        margin: PDF_CONFIG.margins,
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate: footerTemplate,
        printBackground: true
      });

      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error("Failed to generate PDF");
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Script untuk membuat tampilan inline code konsisten
   */
  private inlineCodeConsistencyScript(): void {
    const allInlineCode = document.querySelectorAll('code:not(pre code)');
    allInlineCode.forEach(element => {
      element.classList.add('inline-code');

      if (element.parentElement && element.parentElement.tagName === 'A') {
        element.parentElement.style.color = '#444';
        element.parentElement.style.textDecoration = 'none';
      }
    });
  }
}

/**
 * Kelas utama untuk mengekspor laporan ke PDF
 */
export class PdfExporter implements IExporter {
  private markdownRenderer: MarkdownRenderer;
  private htmlGenerator: HtmlGenerator;
  private pdfGenerator: PdfGenerator;

  constructor() {
    this.markdownRenderer = new MarkdownRenderer();
    this.htmlGenerator = new HtmlGenerator();
    this.pdfGenerator = new PdfGenerator();
  }

  /**
   * Mengekspor laporan ke format PDF
   */
  async export(reportData: ReportDTO): Promise<Buffer> {
    try {
      // 1. Render markdown menjadi HTML
      const renderedContent = this.markdownRenderer.render(reportData.content);

      // 2. Hasilkan HTML lengkap dengan styling
      const html = await this.htmlGenerator.generateHtml(reportData, renderedContent);

      // 3. Hasilkan template footer dengan nomor halaman
      const footerTemplate = this.htmlGenerator.generateFooterTemplate();

      // 4. Hasilkan PDF dari HTML
      return await this.pdfGenerator.generatePdf(html, footerTemplate);
    } catch (error) {
      console.error("Error exporting report to PDF:", error);
      throw new Error(`Failed to export report: ${(error as Error).message}`);
    }
  }

  /**
   * Mengembalikan MIME type untuk PDF
   */
  getMimeType(): string {
    return "application/pdf";
  }

  /**
   * Menghasilkan nama file berdasarkan judul laporan
   */
  getFileName(title: string): string {
    const sanitized = title.replace(/[/\\?%*:|"<>]/g, '-');
    return `Klinik Pintar Laporan - ${sanitized}`;
  }
}