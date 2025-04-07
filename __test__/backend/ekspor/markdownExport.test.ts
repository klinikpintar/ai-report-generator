import { MarkdownExporter } from "@/app/(backend)/services/markdownExporter";

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