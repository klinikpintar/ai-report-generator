"use client";

import { useSearchParams } from "next/navigation";
import PDFViewer from "../components/ekspor/pdf-viewer";

export default function PDFViewerPage() {
  const searchParams = useSearchParams();
  const reportData = searchParams.get("reportData");
  
  if (!reportData) {
    return <div className="p-8">Report data not found</div>;
  }
  
  return <PDFViewer reportData={reportData} />;
}