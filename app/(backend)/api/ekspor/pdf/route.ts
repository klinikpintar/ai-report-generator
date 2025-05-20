import { NextRequest, NextResponse } from "next/server";
import { PdfExporter } from "@/app/(backend)/services/pdfExporter";
import { ZodError } from "zod";
import { apiResponseDuration, apiMetrics } from '@/app/(backend)/utils/metrics';

const route = "/api/ekspor/pdf";
export async function POST(req: NextRequest) {
  const method = "POST";
  const endTimer = apiResponseDuration.startTimer({ route, method });
  apiMetrics(method, route);
  try {
    // Hanya mendukung application/json
    const body = await req.json();
    const { title, content, createdAt } = body.reportData;

    const exporter = new PdfExporter();
    const reportData = { title, content, createdAt };
    const fileBuffer = await exporter.export(reportData);
    const filename = exporter.getFileName(title);
    const safeFilename = `${filename}.pdf`;
    const encodedFilename = encodeURIComponent(safeFilename).replace(/['()]/g, escape);

    endTimer({ route, method });
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    console.error("PDF export error:", err);
    return NextResponse.json(
      { message: "Gagal mengekspor laporan", error: (err as Error).message },
      { status: 500 }
    );
  }
}

// Handle GET (via query params)
export async function GET(req: NextRequest) {
  const method = "GET";
  const endTimer = apiResponseDuration.startTimer({ route, method });
  try {
    const { searchParams } = req.nextUrl;

    const title = searchParams.get("title") || "Laporan";
    const content = searchParams.get("content") || "";
    const createdAt = searchParams.get("createdAt") || new Date().toISOString();

    const exporter = new PdfExporter();
    const reportData = { title, content, createdAt };
    const fileBuffer = await exporter.export(reportData);
    const filename = exporter.getFileName(title);
    const encodedFilename = encodeURIComponent(filename).replace(/['()]/g, escape);

    endTimer({ route, method });
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": exporter.getMimeType(),
        "Content-Disposition": `inline; filename="${encodedFilename}.pdf"; filename*=UTF-8''${encodedFilename}.pdf`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store, max-age=0",
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
      { message: "Gagal mengekspor laporan", error: (err as Error).message },
      { status: 500 }
    );
  }
}