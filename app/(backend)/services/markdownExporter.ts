import { IExporter } from "@/app/(backend)/interfaces/IExporter";
import { ReportDTO } from "@/app/(backend)/dtos/report.dto";
import { generateReportContent } from "@/app/(backend)/utils/generateReportContent";

export class MarkdownExporter implements IExporter {
  async export(reportData: ReportDTO): Promise<Buffer> {
    const markdown = generateReportContent(reportData); // gunakan struktur standar
    return Buffer.from(markdown, "utf-8");
  }

  getMimeType(): string {
    return "text/markdown";
  }

  getFileName(): string {
    return `report-${Date.now()}.md`;
  }
}