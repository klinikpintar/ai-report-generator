export interface IExporter {
    export(reportData: any): Promise<Buffer>;
    getMimeType(): string;
    getFileName(): string;
  }  