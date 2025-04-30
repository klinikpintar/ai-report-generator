"use client";

import { useState } from "react";
import Modal from "@/app/(frontend)/components/Modal";
import ButtonSubmit from "@/app/(frontend)/components/button-submit";

export default function ExportModal({
  isVisible,
  onClose,
  content,
  title,
}: {
  isVisible: boolean;
  onClose: () => void;
  content: string;
  title: string;
}) {
  const [selectedFormat, setSelectedFormat] = useState<"markdown" | "pdf" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!selectedFormat) {
      setErrorMessage("Silakan pilih format laporan terlebih dahulu");
      return;
    }

    try {
      const createdAt = new Date().toISOString().split("T")[0];
      const fileName = `Klinik Pintar Laporan - ${title}`;

      const endpoint =
        selectedFormat === "markdown"
          ? "/api/ekspor/markdown"
          : "/api/ekspor/pdf?preview=true";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportData: {
            title,
            content,
            createdAt,
          },
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        setErrorMessage(error.message ?? "Terjadi kesalahan saat mengekspor laporan.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (selectedFormat === "markdown") {
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName}.md`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        window.open(url, "_blank");
      }

      onClose();
      setSelectedFormat(null);
      setErrorMessage(null);
    } catch (err) {
      console.error("Export failed:", err);
      setErrorMessage("Terjadi kesalahan saat memproses permintaan.");
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      isForm={false}
      onClose={onClose}
      title="Ekspor Laporan"
      subtitle="Pilih format laporan yang ingin anda ekspor"
    >
      <div className="flex justify-center gap-8 mb-6 mt-8">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="format"
            value="markdown"
            checked={selectedFormat === "markdown"}
            onChange={() => setSelectedFormat("markdown")}
          />
          Markdown
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="format"
            value="pdf"
            checked={selectedFormat === "pdf"}
            onChange={() => setSelectedFormat("pdf")}
          />
          PDF
        </label>
      </div>

      {errorMessage && (
        <div className="text-red-500 text-sm text-center mb-4">
          {errorMessage}
        </div>
      )}

      <div className="flex justify-center items-center mb-8">
        <ButtonSubmit
          variant="secondary"
          className="mr-2 ml-5"
          onClick={(e) => {
            e.preventDefault();
            onClose();
            setSelectedFormat(null);
            setErrorMessage(null);
          }}
        >
          Batal
        </ButtonSubmit>

        <ButtonSubmit
          type="button"
          className="mr-5 ml-2"
          onClick={handleDownload}
        >
          {selectedFormat === "pdf" ? "Preview" : "Download"}
        </ButtonSubmit>
      </div>
    </Modal>
  );
}