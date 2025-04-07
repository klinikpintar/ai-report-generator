// app/(backend)/api/ekspor/markdown/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MarkdownExporter } from "@/app/(backend)/services/markdownExporter";
import { ReportSchema } from "@/app/(backend)/dtos/report.dto";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validasi data laporan
    const parsed = ReportSchema.parse(body.reportData);

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