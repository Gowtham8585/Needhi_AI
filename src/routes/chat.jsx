import { createFileRoute, Link } from "@tanstack/react-router";
import React, { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useSession, useActiveCase } from "@/lib/store";
import { translateUI, translateContent } from "@/lib/translate";
import { supabase } from "@/lib/supabase";
import { Send, Bot, User as UserIcon, Sparkles, Languages, Loader2 } from "lucide-react";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "Chatbot — Needhi_AI" }] }),
  component: Chat,
});const SUGGESTIONS = [
  "WHAT IS THE FINAL VERDICT?",
  "SUMMARIZE THE CASE?",
  "WHO ARE THE PARTIES INVOLVED?",
  "WHAT ARE THE KEY DIRECTIVES?",
  "SHOW ALL DEADLINES?",
  "WHAT IS THE NEXT STEP?",
  "WHO IS THE PETITIONER?",
  "WHO IS THE RESPONDENT?",
  "WHICH COURT GAVE THIS ORDER?",
];

function Chat() {
  const { cases, activeCaseId, setActive, language, setLanguage } = useSession();
  const active = useActiveCase();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);

  // Load chat history when active case changes
  useEffect(() => {
    if (active?.id && active.id.includes("-")) {
      const fetchHistory = async () => {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('case_id', active.id)
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          const formatted = data.map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
            ts: new Date(m.created_at).getTime()
          }));
          
          // Translate existing history if needed
          if (language !== "english") {
            const translated = await Promise.all(formatted.map(async m => ({
              ...m,
              content: await translateContent(m.content, language)
            })));
            setMessages(translated);
          } else {
            setMessages(formatted);
          }
        } else {
          const welcome = `Hello! I'm analyzing **${active.caseTitle ?? active.fileName}**. Ask me anything about its directives, deadlines, or constitutional articles.`;
          const tWelcome = language !== "english" ? await translateContent(welcome, language) : welcome;
          setMessages([{ id: crypto.randomUUID(), role: "bot", ts: Date.now(), content: tWelcome }]);
        }
      };
      fetchHistory();
    } else {
      const welcome = active
        ? `Hello! I'm analyzing **${active.caseTitle ?? active.fileName}**. Ask me anything about its directives, deadlines, or constitutional articles.`
        : "Hello! Upload a court judgment first, then I can answer questions about it.";
      
      const setInit = async () => {
        const tWelcome = language !== "english" ? await translateContent(welcome, language) : welcome;
        setMessages([{ id: crypto.randomUUID(), role: "bot", ts: Date.now(), content: tWelcome }]);
      };
      setInit();
    }
  }, [active?.id, language]);

  // Translate ALL messages when language changes
  useEffect(() => {
    if (messages.length > 0) {
      const syncTranslations = async () => {
        const translated = await Promise.all(messages.map(async m => {
          // If switching back to English, we might lose the original EN text if we don't store it
          // But for now, let's just trigger the translation
          const t = language === "english" ? m.content : await translateContent(m.content, language);
          return { ...m, content: t };
        }));
        setMessages(translated);
      };
      syncTranslations();
    }
  }, [language]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text) {
    if (!text.trim() || thinking) return;
    
    // Use english text for the backend/logic
    let englishText = text;
    // (In a real app, we might need to translate user input BACK to English first 
    // if they typed in another language, but let's assume they use suggestions or EN)

    const userMsg = { id: crypto.randomUUID(), role: "user", content: text, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    setThinking(true);
    try {
      if (active?.id && active.id.includes("-")) {
        await supabase.from('chat_messages').insert({
          case_id: active.id,
          role: "user",
          content: text
        });
      }

      const { answer: getAnswer } = await import("@/lib/chatbot");
      const rawAnswer = getAnswer(text, active);
      
      const finalContent = language !== "english" ? await translateContent(rawAnswer, language) : rawAnswer;
      const botMsg = { id: crypto.randomUUID(), role: "bot", content: finalContent, ts: Date.now() };
      setMessages((m) => [...m, botMsg]);

      if (active?.id && active.id.includes("-")) {
        await supabase.from('chat_messages').insert({
          case_id: active.id,
          role: "bot",
          content: finalContent
        });
      }
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg = { 
        id: crypto.randomUUID(), 
        role: "bot", 
        content: "Error processing request.", 
        ts: Date.now() 
      };
      setMessages((m) => [...m, errorMsg]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <AppShell>
      <div className="grid lg:grid-cols-[260px_1fr] gap-6 h-[calc(100vh-12rem)]">
        <aside className="glass rounded-2xl p-3 hidden lg:block">
          <div className="px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground">Active case</div>
          {cases.length === 0 ? (
            <Link to="/upload" className="block m-2 px-3 py-2 rounded-lg bg-white/5 text-sm">Upload a PDF →</Link>
          ) : (
            <div className="space-y-1">
              {cases.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActive(c.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition truncate ${
                    activeCaseId === c.id ? "bg-white/10" : "hover:bg-white/5"
                  }`}
                >
                  {c.caseTitle ?? c.fileName}
                </button>
              ))}
            </div>
          )}
        </aside>

        <div className="glass-strong rounded-2xl flex flex-col overflow-hidden">
          <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-aurora" />
              <span className="text-sm font-semibold tracking-wide uppercase">{active?.caseTitle ? "Case Assistant" : "Assistant"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Languages className="w-3.5 h-3.5 text-muted-foreground" />
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer hover:text-aurora transition"
              >
                <option value="english" className="bg-background">EN</option>
                <option value="tamil" className="bg-background">TA</option>
                <option value="hindi" className="bg-background">HI</option>
                <option value="kannada" className="bg-background">KN</option>
              </select>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m) => (
              <Bubble key={m.id} msg={m} />
            ))}
            {thinking && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-aurora flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-[oklch(0.15_0.04_270)]" />
                </div>
                <div className="glass rounded-2xl px-4 py-3 flex items-center gap-2 text-xs text-muted-foreground italic">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Needhi_AI is thinking...
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto px-6 py-2 border-t border-white/5 bg-white/5 overflow-x-auto scrollbar-hide whitespace-nowrap flex gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full glass hover:bg-white/10 border border-white/10 transition inline-flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-3 h-3 text-aurora" /> {translateUI(s, language)}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="p-4 border-t border-white/10 flex gap-2 bg-white/5"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={thinking}
              placeholder={thinking ? "Waiting..." : (active ? "Search Articles (e.g. Article 21?) or ask about the case…" : "Upload PDF…")}
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/10 outline-none focus:border-aurora transition placeholder:text-muted-foreground/50 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={thinking || !input.trim()}
              className="w-12 h-12 rounded-xl bg-aurora text-[oklch(0.15_0.04_270)] font-bold flex items-center justify-center shadow-[var(--shadow-glow)] hover:scale-105 active:scale-95 transition disabled:opacity-50 disabled:scale-100"
            >
              {thinking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

function Bubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-aurora flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4 text-[oklch(0.15_0.04_270)]" />
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser ? "bg-aurora text-[oklch(0.15_0.04_270)]" : "glass"
        }`}
      >
        {renderMarkdown(msg.content)}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
          <UserIcon className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}

function renderMarkdown(text) {
  const lines = text.split("\n");
  return lines.map((line, i) => (
    <div key={i}>
      {line.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) return <strong key={j}>{part.slice(2, -2)}</strong>;
        if (part.startsWith("*") && part.endsWith("*")) return <em key={j}>{part.slice(1, -1)}</em>;
        if (part.startsWith("`") && part.endsWith("`")) return <code key={j} className="px-1 rounded bg-white/10">{part.slice(1, -1)}</code>;
        return <span key={j}>{part}</span>;
      })}
    </div>
  ));
}
