import { IExporter } from "@/app/(backend)/interfaces/IExporter";
import { ReportDTO } from "@/app/(backend)/dtos/report.dto";

export class MarkdownExporter implements IExporter {
  async export(reportData: ReportDTO): Promise<Buffer> {
    const { title, content, createdAt } = reportData;
    const markdown = `# ${title}\n\nCreated at: ${createdAt}\n\n---\n\n${content}`;
    return Buffer.from(markdown, "utf-8");
  }

  getMimeType(): string {
    return "text/markdown";
  }

  getFileName(): string {
    return `report-${Date.now()}.md`;
  }
}