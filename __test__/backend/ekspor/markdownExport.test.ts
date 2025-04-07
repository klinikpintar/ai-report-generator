import { MarkdownExporter } from "@/app/(backend)/services/markdownExporter";
import { ReportSchema } from "@/app/(backend)/dtos/report.dto";

describe("MarkdownExporter", () => {
  const mockData = {
    title: "Monthly Report",
    content: "This is the content.",
    createdAt: "2025-04-07"
  };

  it("should generate markdown content as buffer", async () => {
    const exporter = new MarkdownExporter();
    const buffer = await exporter.export(mockData);
    const result = buffer.toString("utf-8");

    expect(result).toContain("# Monthly Report");
    expect(result).toContain("Created at: 2025-04-07");
    expect(result).toContain("This is the content.");
  });

  it("should return correct mime type", () => {
    const exporter = new MarkdownExporter();
    expect(exporter.getMimeType()).toBe("text/markdown");
  });

  it("should generate a valid file name", () => {
    const exporter = new MarkdownExporter();
    const filename = exporter.getFileName();
    expect(filename).toMatch(/^report-\d+\.md$/);
  });
});

describe("ReportSchema Validation", () => {
  it("should pass with valid report data", () => {
    const validData = {
      title: "Valid Title",
      content: "Valid content",
      createdAt: "2025-04-07"
    };

    const parsed = ReportSchema.parse(validData);
    expect(parsed).toEqual(validData);
  });

  it("should throw error for empty title", () => {
    expect(() =>
      ReportSchema.parse({
        title: "",
        content: "isi",
        createdAt: "2025-04-07"
      })
    ).toThrow();
  });

  it("should throw error for invalid date format", () => {
    expect(() =>
      ReportSchema.parse({
        title: "Laporan",
        content: "isi",
        createdAt: "not-a-date"
      })
    ).toThrow();
  });
});