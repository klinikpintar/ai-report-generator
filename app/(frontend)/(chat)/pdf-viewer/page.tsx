"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PDFViewer from "../components/ekspor/pdf-viewer";

// Komponen yang menggunakan useSearchParams
function PDFViewerWithParams() {
  const searchParams = useSearchParams();
  const reportData = searchParams.get("reportData") || "{}";
  
  return <PDFViewer reportData={reportData} />;
}

// Halaman utama menggunakan Suspense boundary
export default function PDFViewerPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <PDFViewerWithParams />
    </Suspense>
  );
}