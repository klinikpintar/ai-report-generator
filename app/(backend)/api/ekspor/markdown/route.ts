import { NextRequest, NextResponse } from "next/server";
import { MarkdownExporter } from "@/app/(backend)/services/markdownExporter";
import { ReportSchema } from "@/app/(backend)/dtos/report.dto";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ message: "Missing token" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // OWASP A1 – Injection: Validasi input untuk mencegah input berbahaya
    const parsed = ReportSchema.parse(body.reportData);

    if (!parsed.title?.trim() || !parsed.content?.trim()) {
      return NextResponse.json({ message: "Judul dan isi laporan tidak boleh kosong" }, { status: 400 });
    }    

    const exporter = new MarkdownExporter();
    const fileBuffer = await exporter.export(parsed);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": exporter.getMimeType(),
        "Content-Disposition": `attachment; filename="${exporter.getFileName()}"`
      },
    });
  } catch (err) {
    // Tangani error validasi
    if (err instanceof ZodError) {
      return NextResponse.json({ message: "Input tidak valid", errors: err.errors }, { status: 400 });
    }

    console.error("Export Markdown Failed:", err);
    return NextResponse.json({ message: "Gagal mengekspor laporan" }, { status: 500 });
  }
}