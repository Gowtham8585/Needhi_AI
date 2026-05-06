// Client-side PDF text extraction with OCR fallback.
// Vite-friendly worker import
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

export async function extractPdfText(file, onProgress) {
  onProgress?.({ stage: "loading", message: "Reading PDF…" });
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
  onProgress?.({ stage: "loading", message: "Reading PDF…" });
  const buf = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buf }).promise;
  const totalPages = doc.numPages;
  let fullText = "";

  for (let i = 1; i <= totalPages; i++) {
    onProgress?.({ stage: "extracting", page: i, totalPages });
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((it) => ("str" in it ? it.str : ""))
      .join(" ");
    fullText += "\n" + pageText;
  }

  const trimmed = fullText.replace(/\s+/g, " ").trim();
  // Heuristic: if very little text was extracted, treat as scanned and OCR.
  if (trimmed.length < 200) {
    onProgress?.({ stage: "ocr", message: "Scanned PDF detected — running OCR…" });
    const ocrText = await ocrPdf(doc, totalPages, onProgress);
    onProgress?.({ stage: "done" });
    return { text: ocrText, usedOcr: true };
  }

  onProgress?.({ stage: "done" });
  return { text: trimmed, usedOcr: false };
}

async function ocrPdf(doc, totalPages, onProgress) {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");
  let text = "";
  try {
    for (let i = 1; i <= totalPages; i++) {
      onProgress?.({ stage: "ocr", page: i, totalPages, message: `OCR page ${i}/${totalPages}` });
      const page = await doc.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      const { data } = await worker.recognize(canvas);
      text += "\n" + data.text;
    }
  } finally {
    await worker.terminate();
  }
  return text.replace(/\s+/g, " ").trim();
}