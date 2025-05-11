import { ReportDTO } from "@/app/(backend)/dtos/report.dto";

export interface IExporter {
  export(reportData: ReportDTO): Promise<Buffer>;
  getMimeType(): string;
  getFileName(identifier: string): string;
}