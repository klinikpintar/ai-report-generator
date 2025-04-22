import { NextRequest, NextResponse } from "next/server";
import { PdfExporter } from "@/app/(backend)/services/pdfExporter";
import { ReportSchema } from "@/app/(backend)/dtos/report.dto";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  // OWASP A2 – Cek token autentikasi
  if (!token) {
    return NextResponse.json({ message: "Missing token" }, { status: 401 });
  }

  try {
    const { searchParams } = req.nextUrl; 
    const isPreview = searchParams.get("preview") === "true";

    const body = await req.json();
    const parsed = ReportSchema.parse(body.reportData);

    const exporter = new PdfExporter();

    let fileBuffer: Buffer;
    try {
      fileBuffer = await exporter.export(parsed);
    } catch (pdfError) {
      return NextResponse.json({ message: "Gagal generate PDF" }, { status: 500 });
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": exporter.getMimeType(),
        "Content-Disposition": `${isPreview ? "inline" : "attachment"}; filename="${exporter.getFileName(parsed.createdAt)}"`,
      },
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ message: "Input tidak valid", errors: err.errors }, { status: 400 });
    }

    return NextResponse.json({ message: "Gagal mengekspor laporan" }, { status: 500 });
  }
}