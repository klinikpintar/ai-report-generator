"use client";

import { useEffect, useState } from "react";

export default function PDFViewer({ reportData }: { reportData: string }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    try {
      const data = JSON.parse(reportData);
      setTitle(data.title);
      
      // Generate PDF URL
      const fetchPdf = async () => {
        setLoading(true);
        const response = await fetch("/api/ekspor/pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportData: data }),
        });
        
        if (!response.ok) throw new Error("Failed to generate PDF");
        
        const blob = await response.blob();
        setPdfUrl(URL.createObjectURL(blob));
        setLoading(false);
        
        // Set document title for the browser tab
        document.title = `${data.title} - Klinik Pintar`;
      };
      
      fetchPdf();
    } catch (error) {
      console.error("Error parsing report data:", error);
      setLoading(false);
    }
    
    // Cleanup on unmount
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [reportData]);
  
  // Render only the PDF without any UI controls
  return (
    <div className="h-screen w-full">
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <span className="animate-spin mr-2">⟳</span> Loading PDF...
        </div>
      ) : pdfUrl ? (
        <iframe
          src={pdfUrl}
          className="w-full h-full border-0"
          title={title}
          style={{ border: "none", margin: 0, padding: 0 }}
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          Failed to load PDF
        </div>
      )}
    </div>
  );
}