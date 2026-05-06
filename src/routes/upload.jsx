import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { UploadCloud, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useSession } from "@/lib/store";
import { extractPdfText } from "@/lib/pdf";
import { buildCaseRecord } from "@/lib/extractor";

export const Route = createFileRoute("/upload")({
  head: () => ({ meta: [{ title: "Upload — Needhi_AI" }] }),
  component: UploadPage,
});

function UploadPage() {
  const { addCase } = useSession();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [mode, setMode] = useState("file"); // 'file' or 'text'
  const [pastedText, setPastedText] = useState("");
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file) {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file.");
      return;
    }
    setError(null);
    try {
      const { text, usedOcr } = await extractPdfText(file, setProgress);
      const rec = buildCaseRecord(file.name, text);
      addCase(rec);
      setProgress({ stage: "done", message: usedOcr ? "OCR complete" : "Extraction complete" });
      setTimeout(() => navigate({ to: "/dashboard" }), 400);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to process PDF");
      setProgress(null);
    }
  }

  async function handlePaste() {
    if (!pastedText.trim()) {
      setError("Please paste some text first.");
      return;
    }
    setError(null);
    setProgress({ stage: "analyzing", message: "Processing pasted text…" });
    try {
      // Small delay to show progress
      await new Promise(r => setTimeout(r, 800));
      const rec = buildCaseRecord("Pasted Content", pastedText);
      addCase(rec);
      setProgress({ stage: "done", message: "Analysis complete" });
      setTimeout(() => navigate({ to: "/dashboard" }), 400);
    } catch (e) {
      setError("Failed to process text.");
      setProgress(null);
    }
  }

  const busy = progress && progress.stage !== "done";

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold tracking-tight">Add a court judgment</h1>
        <p className="text-muted-foreground mt-2">Process PDFs or paste text directly for instant analysis.</p>

        {/* MODE TOGGLE */}
        <div className="flex gap-2 mt-8 p-1 glass rounded-xl w-fit">
          <button 
            onClick={() => setMode("file")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${mode === "file" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            PDF Upload
          </button>
          <button 
            onClick={() => setMode("text")}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${mode === "text" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            Paste Text
          </button>
        </div>

        {mode === "file" ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            onClick={() => !busy && inputRef.current?.click()}
            className={`mt-6 glass-strong rounded-3xl p-12 text-center cursor-pointer transition ${
              dragOver ? "border-aurora bg-accent/50" : "border-border/50"
            } ${busy ? "pointer-events-none opacity-90" : "hover:bg-accent/30"}`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <div className="w-16 h-16 mx-auto rounded-2xl bg-aurora flex items-center justify-center shadow-[var(--shadow-glow)] mb-4">
              <UploadCloud className="w-8 h-8 text-[oklch(0.15_0.04_270)]" />
            </div>
            <div className="text-lg font-medium">Drop a PDF or click to browse</div>
            <div className="text-sm text-muted-foreground mt-1">Digital and scanned PDFs are both supported.</div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              disabled={busy}
              placeholder="Paste the judgment text here..."
              className="w-full h-64 rounded-3xl bg-muted/30 border border-border/50 p-6 text-sm outline-none focus:border-aurora transition resize-none"
            />
            <button
              onClick={handlePaste}
              disabled={busy || !pastedText.trim()}
              className="w-full py-4 rounded-2xl bg-aurora text-[oklch(0.15_0.04_270)] font-bold shadow-[var(--shadow-glow)] hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50"
            >
              Analyze Pasted Text
            </button>
          </div>
        )}

        {progress && (
          <div className="mt-6 glass rounded-2xl p-5 flex items-center gap-3">
            {progress.stage === "done" ? (
              <CheckCircle2 className="w-5 h-5 text-aurora" />
            ) : (
              <Loader2 className="w-5 h-5 animate-spin text-aurora" />
            )}
            <div className="text-sm">
              <div className="font-medium capitalize">{progress.stage}</div>
              <div className="text-muted-foreground">
                {progress.message ?? (progress.totalPages ? `Page ${progress.page}/${progress.totalPages}` : "Working…")}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 glass rounded-2xl p-5 border-destructive/40 text-sm text-destructive">{error}</div>
        )}

        <div className="mt-8 flex items-start gap-3 text-sm text-muted-foreground">
          <FileText className="w-4 h-4 mt-0.5 shrink-0" />
          <p>Tip: You can now paste text directly if you don't have the PDF file. Analysis takes just a few seconds.</p>
        </div>
      </div>
    </AppShell>
  );
}