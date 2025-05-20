import { NextRequest, NextResponse } from "next/server";
import { MarkdownExporter } from "@/app/(backend)/services/markdownExporter";
import { ReportSchema } from "@/app/(backend)/dtos/report.dto";
import { ZodError } from "zod";
import { apiResponseDuration, apiMetrics } from '@/app/(backend)/utils/metrics';

const route = "/api/ekspor/markdown";
export async function POST(req: NextRequest) {
  const method = "POST";
  const endTimer = apiResponseDuration.startTimer({ route, method });
  apiMetrics(method, route);
  try {
    const body = await req.json();

    // OWASP A1 – Injection: Validasi input untuk mencegah input berbahaya
    const parsed = ReportSchema.parse(body.reportData);

    if (!parsed.title?.trim() || !parsed.content?.trim()) {
      return NextResponse.json({ message: "Judul dan isi laporan tidak boleh kosong" }, { status: 400 });
    }    

    const exporter = new MarkdownExporter();
    const fileBuffer = await exporter.export(parsed);

    endTimer({ route, method });
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": exporter.getMimeType(),
        "Content-Disposition": `attachment; filename="${exporter.getFileName(parsed.title)}"`,
      },
    });
  } catch (err) {
    // Tangani error validasi
    if (err instanceof ZodError) {
      return NextResponse.json({ message: "Input tidak valid", errors: err.errors }, { status: 400 });
    }

    endTimer({ route, method });
    console.error("Export Markdown Failed:", err);
    return NextResponse.json({ message: "Gagal mengekspor laporan" }, { status: 500 });
  }
}