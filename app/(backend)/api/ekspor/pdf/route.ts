import { NextRequest, NextResponse } from "next/server";
import { PdfExporter } from "@/app/(backend)/services/pdfExporter";
import { ReportSchema } from "@/app/(backend)/dtos/report.dto";
import { ZodError } from "zod";
import { apiResponseDuration } from "@/app/(backend)/utils/metrics";

const route = "/api/ekspor/pdf";
export async function POST(req: NextRequest) {
  const method = "POST";
  const endTimer = apiResponseDuration.startTimer({ route, method });
  try {
    const { searchParams } = req.nextUrl; 
    const isPreview = searchParams.get("preview") === "true";

    const body = await req.json();

    // ✅ OWASP A1 – Input Validation
    const parsed = ReportSchema.parse(body.reportData);

    const exporter = new PdfExporter();

    let fileBuffer: Buffer;
    try {
      fileBuffer = await exporter.export(parsed);
    } catch {
      return NextResponse.json({ message: "Gagal generate PDF" }, { status: 500 });
    }

    const filename = exporter.getFileName(parsed.title);

    endTimer({ route, method });
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": exporter.getMimeType(),
        "Content-Disposition": `${isPreview ? "inline" : "attachment"}; filename="${filename}"`,
      },
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { message: "Input tidak valid", errors: err.errors },
        { status: 400 }
      );
    }

    endTimer({ route, method });
    return NextResponse.json(
      { message: "Gagal mengekspor laporan" },
      { status: 500 }
    );
  }
}