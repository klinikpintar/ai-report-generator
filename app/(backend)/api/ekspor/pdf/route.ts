import { NextRequest, NextResponse } from "next/server";
import { PdfExporter } from "@/app/(backend)/services/pdfExporter";
import { ReportSchema } from "@/app/(backend)/dtos/report.dto";
import { ZodError } from "zod";
// import * as Sentry from "@sentry/nextjs"; // (opsional)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ReportSchema.parse(body.reportData);

    const exporter = new PdfExporter();
    const fileBuffer = await exporter.export(parsed);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": exporter.getMimeType(),
        "Content-Disposition": `attachment; filename="${exporter.getFileName()}"`
      },
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ message: "Input tidak valid", errors: err.errors }, { status: 400 });
    }

    // Sentry.captureException(err); // monitoring (opsional)
    console.error("Export PDF Failed:", err);
    return NextResponse.json({ message: "Gagal mengekspor laporan" }, { status: 500 });
  }
}