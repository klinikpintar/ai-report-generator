import { IQuery } from "@backend/interfaces/query/IQuery";
import { IQueryExtractor } from "@backend/interfaces/query/IQueryExtractor";

export class QueryExtractor implements IQueryExtractor {
  /**
   * Mengekstrak blok kode (query) dari teks laporan.
   * Jika bahasa tidak ditentukan dalam blok kode, akan diisi dengan "unknown".
   * Jika id tidak ditentukan, akan diisi dengan string kosong.
   * @param report Teks laporan yang berisi blok kode.
   * @returns Array objek yang masing-masing berisi bahasa, id, dan kode query.
   */
  extract(report: string): IQuery[] {
    const queries: IQuery[] = [];

    const codeBlockRegex = /```(?:([a-zA-Z0-9_]+)?(?:\s+id=([a-zA-Z0-9_-]+))?)?\n([\s\S]+?)\n```/g;

    let match;
    while ((match = codeBlockRegex.exec(report)) !== null) {
      const language = match[1] || "unknown";
      const id = match[2] || "";
      const rawCodeContent = match[3];

      const processedCode = rawCodeContent.trim()

      if (processedCode) {
        queries.push({ language, id, code: processedCode });
      }
    }

    return queries;
  }
}
