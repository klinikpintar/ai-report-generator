import { NextRequest, NextResponse } from "next/server";
import { PdfExporter } from "@/app/(backend)/services/pdfExporter";
import { ReportSchema } from "@/app/(backend)/dtos/report.dto";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isPreview = searchParams.get("preview") === "true";

    const body = await req.json();
    const parsed = ReportSchema.parse(body.reportData);

    const exporter = new PdfExporter();
    const fileBuffer = await exporter.export(parsed);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": exporter.getMimeType(),
        "Content-Disposition": `${isPreview ? "inline" : "attachment"}; filename="${exporter.getFileName()}"`
      },
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ message: "Input tidak valid", errors: err.errors }, { status: 400 });
    }

    return NextResponse.json({ message: "Gagal mengekspor laporan" }, { status: 500 });
  }
}