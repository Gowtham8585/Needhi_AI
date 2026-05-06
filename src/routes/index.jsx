import { createFileRoute, Link } from "@tanstack/react-router"; // Updated with premium visuals
import { Scale, FileText, Sparkles, ShieldCheck, MessageCircle, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Needhi_AI — Dynamic Court Judgment Analyzer" },
      { name: "description", content: "Upload court judgment PDFs and convert them into structured, actionable plans with an explainable, session-only engine." },
    ],
  }),
  component: Landing,
});

import { ThemeToggle } from "@/components/ThemeToggle";
import ocrImg from "/public/features/ocr.png?url";
import actionsImg from "/public/features/actions.png?url";
import explainableImg from "/public/features/explainable.png?url";
import chatbotImg from "/public/features/chatbot.png?url";

function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-aurora flex items-center justify-center shadow-[var(--shadow-glow)]">
            <Scale className="w-5 h-5 text-[oklch(0.15_0.04_270)]" />
          </div>
          <span className="font-semibold tracking-tight">
            Needhi<span className="text-aurora">_</span>AI
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link to="/login" className="text-sm font-medium hover:text-aurora transition">
            Log in
          </Link>
          <Link to="/signup" className="px-4 py-2 rounded-lg bg-aurora text-[oklch(0.15_0.04_270)] text-sm font-medium hover:scale-[1.02] transition shadow-[var(--shadow-glow)]">
            Sign up
          </Link>
        </div>
      </header>

      <section className="flex-1 max-w-6xl w-full mx-auto px-6 pt-12 pb-24 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-muted-foreground mb-6">
            <Sparkles className="w-3 h-3" /> Secure Auth · User History · Explainable AI
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
            Turn court judgments into <span className="text-aurora">actionable plans</span>.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-lg">
            Upload any court judgment PDF. Needhi_AI extracts directives, deadlines, and departments, then stores them securely in your account for easy tracking.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/signup"
              className="px-6 py-3 rounded-xl bg-aurora text-[oklch(0.15_0.04_270)] font-medium inline-flex items-center gap-2 shadow-[var(--shadow-glow)] hover:scale-[1.02] transition"
            >
              Get started for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="px-6 py-3 rounded-xl glass hover:bg-white/10 transition">
              Log in to account
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Feature img={ocrImg} title="PDF + OCR" desc="Digital and scanned PDFs. In-browser extraction." />
          <Feature img={actionsImg} title="Action plans" desc="Verbs, deadlines, ₹ amounts, departments." />
          <Feature img={explainableImg} title="Explainable" desc="Confidence scores + highlighted source sentences." />
          <Feature img={chatbotImg} title="Built-in chatbot" desc="Ask questions about the active case." />
        </div>
      </section>
    </div>
  );
}

function Feature({ img, title, desc }) {
  return (
    <div className="glass rounded-2xl p-5 group hover:bg-white/10 transition-all duration-300">
      <div className="w-full aspect-square rounded-xl bg-white/5 flex items-center justify-center mb-4 overflow-hidden border border-white/10">
        <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      </div>
      <div className="font-semibold text-base">{title}</div>
      <div className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{desc}</div>
    </div>
  );
}
