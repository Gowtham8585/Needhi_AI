import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { useSession, useActiveCase } from "@/lib/store";
import { useAuth } from "@/hooks/useSupabaseAuth";
import { Check, X, Pencil, FileText, Trash2, Building2, Clock, IndianRupee, ChevronDown, CheckCircle2, Languages, RefreshCcw, Search, Bell, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { translateUI, translateContent } from "@/lib/translate";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Needhi_AI" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { cases, activeCaseId, setActive, removeCase } = useSession();
  const active = useActiveCase();

  const { user } = useAuth();
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "User";
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCases = cases.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      (c.caseTitle?.toLowerCase().includes(q)) ||
      (c.fileName?.toLowerCase().includes(q)) ||
      (c.caseNumber?.toLowerCase().includes(q))
    );
  });

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {firstName}!</h1>
        <p className="text-muted-foreground mt-1">Here is the latest analysis of your legal documents.</p>
      </div>
      {cases.length === 0 ? (
        <Empty />
      ) : (
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          <aside className="glass rounded-2xl p-3 h-fit flex flex-col gap-4 overflow-hidden">
            <div className="px-3 py-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search order no. or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-muted/50 border border-border/50 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-aurora/50 transition"
                />
              </div>
            </div>

            <div>
              <div className="px-3 py-2 text-xs uppercase tracking-wider text-muted-foreground hidden lg:block">Session cases</div>
              <div className="flex lg:flex-col gap-2 lg:space-y-1 lg:max-h-[60vh] overflow-x-auto lg:overflow-y-auto custom-scrollbar pb-2 lg:pb-0 pr-1">
                {filteredCases.length === 0 ? (
                  <div className="px-3 py-4 text-center text-xs text-muted-foreground italic w-full">
                    {searchTerm ? "No matching cases found." : "No cases yet."}
                  </div>
                ) : (
                  filteredCases.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActive(c.id)}
                      className={`min-w-[200px] lg:min-w-0 flex-shrink-0 text-left px-3 py-3 rounded-xl transition flex items-center justify-between gap-3 ${
                        activeCaseId === c.id ? "bg-accent shadow-sm ring-1 ring-border/50" : "hover:bg-accent/50"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-medium truncate leading-snug">
                          {c.caseNumber ? <span className="text-aurora block text-[11px] font-bold uppercase tracking-tight mb-0.5">{c.caseNumber}</span> : null}
                          {c.caseTitle ?? c.fileName}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate mt-1 flex items-center gap-1.5">
                          <FileText className="w-3 h-3" /> {c.actions.length} action item(s)
                        </div>
                      </div>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCase(c.id);
                        }}
                        className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </aside>

          <section>{active ? <CaseView caseId={active.id} /> : <p className="text-muted-foreground">Select a case.</p>}</section>
        </div>
      )}
    </AppShell>
  );
}

function Empty() {
  return (
    <div className="glass-strong rounded-3xl p-12 text-center max-w-lg mx-auto">
      <FileText className="w-10 h-10 mx-auto text-aurora" />
      <h2 className="mt-4 text-xl font-semibold">No cases yet</h2>
      <p className="text-muted-foreground mt-2">Upload your first court judgment to see extracted actions here.</p>
      <Link to="/upload" className="mt-6 inline-block px-5 py-2.5 rounded-xl bg-aurora text-[oklch(0.15_0.04_270)] font-medium shadow-[var(--shadow-glow)]">
        Upload PDF
      </Link>
    </div>
  );
}

function CaseView({ caseId }) {
  const { cases, updateAction, updateCase, language, setLanguage } = useSession();
  const c = cases.find((x) => x.id === caseId);

  const verifiedActions = c.actions.filter(a => a.status === 'Approved' || a.status === 'Edited');

  // AUTOMATIC FULL TRANSLATION EFFECT
  useEffect(() => {
    if (language === "english") return;

    // 1. Auto-translate Overall Summary
    if (!c.translations?.[`${language}_summary`]) {
      translateContent(c.overallSummary || "", language).then(t => {
        updateCase(c.id, { translations: { ...c.translations, [`${language}_summary`]: t } });
      });
    }

    // 2. Auto-translate all Action Items
    c.actions.forEach(a => {
      // Translate the action title/label
      if (!a.translations?.[`${language}_action`]) {
        translateContent(a.action, language).then(t => {
          updateAction(c.id, a.id, { translations: { ...a.translations, [`${language}_action`]: t } });
        });
      }
      // Translate the source sentence/paragraph
      if (!a.translations?.[`${language}_sentence`]) {
        translateContent(a.sentence, language).then(t => {
          updateAction(c.id, a.id, { translations: { ...a.translations, [`${language}_sentence`]: t } });
        });
      }
    });
  }, [language, c?.id]); 

  if (!c) return null;

  return (
    <div className="space-y-8 pb-24 max-w-4xl mx-auto">
      
      {/* LANGUAGE SELECTOR */}
      <div className="flex justify-end">
        <div className="glass px-3 py-1.5 rounded-xl flex items-center gap-3 border border-border/50">
          <Languages className="w-4 h-4 text-muted-foreground" />
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
          >
            <option value="english" className="bg-background">English</option>
            <option value="tamil" className="bg-background">தமிழ் (Tamil)</option>
            <option value="hindi" className="bg-background">हिन्दी (Hindi)</option>
            <option value="kannada" className="bg-background">ಕನ್ನಡ (Kannada)</option>
          </select>
          {language !== "english" && (
            <div className="flex items-center gap-2 pl-3 border-l border-border/50 ml-1">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[10px] uppercase font-bold text-blue-400">Live Trans</span>
            </div>
          )}
        </div>
      </div>

      {/* CASE INFORMATION */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold border-b border-border/50 pb-3 text-emerald-500 dark:text-emerald-400">
          {translateUI("Case Information", language)}
        </h2>
        <div className="glass-strong p-6 rounded-2xl border border-border/50 space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{translateUI("Case Details", language)}</p>
              <p className="font-semibold text-lg">{c.caseTitle ?? "Court Judgment"}</p>
              {c.caseNumber && <p className="text-sm mt-1">Case No: {c.caseNumber}</p>}
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{translateUI("Date of Order", language)}</p>
              <p className="font-medium">{c.judgmentDate || "Not mentioned"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{translateUI("Parties Involved", language)}</p>
              <p className="font-medium">{c.parties && c.parties.length > 0 ? c.parties.join(" vs ") : "Not extracted"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{translateUI("Key Directions / Orders", language)}</p>
              <p className="font-medium">{c.actions.length} action(s) found</p>
            </div>
          </div>
        </div>
      </section>

      <Tabs defaultValue="action-plan" className="w-full">
        <div className="overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="flex w-max sm:w-full sm:grid sm:grid-cols-4 bg-muted/50 border border-border/50 p-1 rounded-xl h-auto min-w-full">
            <TabsTrigger value="action-plan" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-primary/20 data-[state=active]:text-primary font-semibold transition-all shrink-0">
              {translateUI("Action Plan", language)}
            </TabsTrigger>
            <TabsTrigger value="verify" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-300 font-semibold transition-all shrink-0">
              {translateUI("Verify", language)}
            </TabsTrigger>
            <TabsTrigger value="reminders" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-300 font-semibold transition-all shrink-0">
              <span className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                {translateUI("Tab-Reminders", language)}
              </span>
            </TabsTrigger>
            <TabsTrigger value="summarize" className="rounded-lg px-4 py-2.5 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 font-semibold transition-all shrink-0">
              {translateUI("Summarize", language)}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ACTION PLAN TAB */}
        <TabsContent value="action-plan" className="space-y-4 outline-none animate-in fade-in slide-in-from-bottom-2">
          <h2 className="text-2xl font-bold border-b border-border/50 pb-3 text-primary">
            {translateUI("Action Plan", language)}
          </h2>
          <div className="grid gap-3">
            {c.actions.length === 0 ? (
              <p className="text-muted-foreground glass p-4 rounded-xl text-center">No actions generated.</p>
            ) : (
              c.actions.map(a => (
                <div key={a.id} className="glass p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-blue-500/50">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider ${a.type === 'Appeal' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                        {translateUI("Type", language)}: {a.type}
                      </span>
                    </div>
                    <p className="font-semibold text-[15px]">
                      {language !== "english" && a.translations?.[`${language}_action`] ? a.translations[`${language}_action`] : a.action}
                    </p>
                  </div>
                  <div className="sm:text-right shrink-0">
                    <div className="mb-2">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                        {translateUI("Responsible Department", language)}
                      </p>
                      <p className="text-sm flex items-center sm:justify-end gap-1.5"><Building2 className="w-3.5 h-3.5 text-blue-400"/> {a.department}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                        {translateUI("Deadline", language)}
                      </p>
                      <p className="text-sm flex items-center sm:justify-end gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-400"/> {a.deadline || "None"}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* VERIFY TAB */}
        <TabsContent value="verify" className="space-y-4 outline-none animate-in fade-in slide-in-from-bottom-2">
          <h2 className="text-2xl font-bold border-b border-white/10 pb-3 text-amber-400">
            {translateUI("Verify", language)}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">Before final use: Check the extracted data, view the confidence score, and highlight the source text. Approve, edit, or reject the actions. Only verified data is used below.</p>
          <div className="grid gap-6">
            {c.actions.map((a) => (
              <ActionCard key={a.id} action={a} language={language} onChange={(p) => updateAction(c.id, a.id, p)} />
            ))}
          </div>
        </TabsContent>

        {/* REMINDERS TAB */}
        <TabsContent value="reminders" className="space-y-4 outline-none animate-in fade-in slide-in-from-bottom-2">
          <h2 className="text-2xl font-bold border-b border-white/10 pb-3 text-rose-400">
            {translateUI("Compliance Reminders", language)}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {translateUI("Tracking deadlines automatically from the judgment date. These reminders are activated once you verify the action items.", language)}
          </p>
          
          <div className="grid gap-4">
            {c.actions.filter(a => a.deadlineTimestamp && (a.status === 'Approved' || a.status === 'Edited')).length === 0 ? (
              <div className="glass p-8 text-center rounded-2xl">
                <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {translateUI("No verified deadlines detected. Go to 'Verify' to activate reminders.", language)}
                </p>
              </div>
            ) : (
              c.actions
                .filter(a => a.deadlineTimestamp && (a.status === 'Approved' || a.status === 'Edited'))
                .sort((a, b) => (a.deadlineTimestamp ?? 0) - (b.deadlineTimestamp ?? 0))
                .map(a => {
                  const now = Date.now();
                  const diff = (a.deadlineTimestamp ?? 0) - now;
                  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                  const isOverdue = days < 0;
                  const isUrgent = days >= 0 && days <= 7;

                  return (
                    <div key={a.id} className={`glass p-5 rounded-2xl border-l-4 flex flex-col md:flex-row md:items-center justify-between gap-6 ${isOverdue ? 'border-rose-500 bg-rose-500/5' : isUrgent ? 'border-amber-500 bg-amber-500/5' : 'border-emerald-500'}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${isOverdue ? 'bg-rose-500/20 text-rose-300' : isUrgent ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                            {isOverdue ? translateUI('Overdue', language) : isUrgent ? translateUI('Urgent', language) : translateUI('Verified', language)}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase">{a.department}</span>
                          <div className="ml-auto md:ml-0 flex items-center gap-1 text-[10px] text-emerald-400 font-bold uppercase tracking-tight">
                            <CheckCircle2 className="w-3 h-3" /> {translateUI("Human Verified", language)}
                          </div>
                        </div>
                        <h4 className="font-semibold">{a.action}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{translateUI("Timeline", language)}: {a.deadline}</p>
                      </div>
                      
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-[10px] uppercase text-muted-foreground mb-0.5">{translateUI("Target Date", language)}</p>
                          <p className="text-sm font-bold">{new Date(a.deadlineTimestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div className={`px-4 py-3 rounded-xl flex flex-col items-center justify-center min-w-[100px] ${isOverdue ? 'bg-rose-500/20 text-rose-400' : isUrgent ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {isOverdue ? (
                            <>
                              <AlertTriangle className="w-5 h-5 mb-1" />
                              <span className="text-xs font-bold">{Math.abs(days)} {translateUI("Days Past", language)}</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-5 h-5 mb-1" />
                              <span className="text-xs font-bold">{days === 0 ? translateUI("Today", language) : `${days} ${translateUI("Days Left", language)}`}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </TabsContent>

        {/* SUMMARIZE TAB */}
        <TabsContent value="summarize" className="space-y-4 outline-none animate-in fade-in slide-in-from-bottom-2">
          <h2 className="text-2xl font-bold border-b border-white/10 pb-3 text-purple-400">
            {translateUI("Summarize", language)}
          </h2>
          <div className="glass-strong rounded-2xl overflow-hidden border border-purple-500/20">
            
            <div className="p-6 bg-black/20 border-b border-white/5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  {translateUI("Summary Made by AI", language)}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">
                {language !== "english" && c.translations?.[`${language}_summary`] ? c.translations[`${language}_summary`] : (c.overallSummary || "No summary available.")}
              </p>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-6">
                <Building2 className="w-5 h-5 text-purple-400" />
                {translateUI("Dashboard (Verified Actions)", language)}
              </h3>
              <FinalDashboardView verifiedActions={verifiedActions} />
            </div>

          </div>
        </TabsContent>
      </Tabs>

    </div>
  );
}

function FinalDashboardView({ verifiedActions }) {
  if (verifiedActions.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed border-white/10 rounded-xl">
        <CheckCircle2 className="w-10 h-10 text-purple-400/30 mx-auto mb-3" />
        <p className="text-muted-foreground">No actions verified yet. Please approve actions in the Third step.</p>
      </div>
    );
  }

  const departments = Array.from(new Set(verifiedActions.map(a => a.department)));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Total Verified</p>
          <p className="text-2xl font-semibold">{verifiedActions.length}</p>
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Departments</p>
          <p className="text-2xl font-semibold">{departments.length}</p>
        </div>
      </div>

      <div className="grid gap-4">
        {departments.map(dept => {
          const deptActions = verifiedActions.filter(a => a.department === dept);
          return (
            <div key={dept} className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
              <div className="bg-purple-500/10 px-4 py-3 flex items-center justify-between border-b border-white/5">
                <h4 className="font-semibold text-purple-200">{dept}</h4>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-bold uppercase">{deptActions.length} Actions</span>
              </div>
              <div className="divide-y divide-white/5">
                {deptActions.map(a => (
                  <div key={a.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <div>
                        <p className="font-medium text-[15px]">{a.action}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Type: {a.type}</p>
                      </div>
                    </div>
                    {a.deadline && (
                      <div className="shrink-0 flex items-center gap-1.5 text-xs text-amber-200 bg-amber-500/10 px-3 py-1.5 rounded-lg font-medium">
                        <Clock className="w-4 h-4" />
                        Deadline: {a.deadline}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

function ActionCard({ action, language, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(action.action);

  const statusColor =
    action.status === "Approved" ? "text-emerald-400" :
    action.status === "Rejected" ? "text-destructive" :
    action.status === "Edited" ? "text-emerald-400" : "text-amber-400";

  return (
    <div className="glass rounded-2xl overflow-hidden border border-amber-500/20">
      <div className="p-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <span className="px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-white/5 border border-white/10">
                Verification Status: <span className={statusColor}>{action.status}</span>
              </span>
            </div>
            {editing ? (
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10"
              />
            ) : (
              <div className="space-y-1">
                <h3 className="text-[15px] font-medium leading-snug">
                  {language !== "english" && action.translations?.[`${language}_action`] ? action.translations[`${language}_action`] : action.action}
                </h3>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <ConfidenceMeter value={action.confidence} />
          </div>
        </div>

        <div className="mt-4 bg-black/20 rounded-xl p-4 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] text-amber-400/80 uppercase tracking-widest font-semibold flex items-center gap-1.5">
              <FileText className="w-3 h-3" />
              {translateUI("Source Text from PDF", language)}
            </div>
          </div>
          <div className="text-sm leading-relaxed text-foreground/90 italic">
            {language !== "english" && action.translations?.[`${language}_sentence`] ? (
              <span>"{action.translations[`${language}_sentence`]}"</span>
            ) : (
              <span>"<Highlighted text={action.sentence} terms={action.highlights} />"</span>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 items-center">
          {editing ? (
            <>
              <button
                onClick={() => { onChange({ action: draft, status: "Edited" }); setEditing(false); }}
                className="px-4 py-2 text-sm rounded-lg bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-500/20"
              >
                Save Edit
              </button>
              <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm rounded-lg glass">Cancel</button>
            </>
          ) : (
            <>
              <button
                onClick={() => onChange({ status: "Approved" })}
                className="px-4 py-2 text-sm rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors inline-flex items-center gap-1.5 font-medium"
              >
                <Check className="w-4 h-4" /> Approve
              </button>
              <button
                onClick={() => { setDraft(action.action); setEditing(true); }}
                className="px-4 py-2 text-sm rounded-lg bg-white/5 text-foreground hover:bg-white/10 border border-white/10 transition-colors inline-flex items-center gap-1.5 font-medium"
              >
                <Pencil className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => onChange({ status: "Rejected" })}
                className="px-4 py-2 text-sm rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 transition-colors inline-flex items-center gap-1.5 font-medium"
              >
                <X className="w-4 h-4" /> Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ConfidenceMeter({ value }) {
  const isHigh = value >= 80;
  const color = isHigh ? "text-emerald-400" : "text-amber-400";
  const bg = isHigh ? "bg-emerald-400" : "bg-amber-400";
  
  return (
    <div className="text-right flex flex-col items-end">
      <div className={`text-xl font-bold ${color}`}>{value}%</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Confidence</div>
      <div className="mt-1.5 w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full ${bg}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Highlighted({ text, terms }) {
  if (!terms.length) return <span>{text}</span>;
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
  const parts = text.split(pattern);
  return (
    <span>
      {parts.map((p, i) =>
        pattern.test(p) ? (
          <mark key={i} className="bg-amber-500/30 text-amber-200 rounded px-1 font-medium">{p}</mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </span>
  );
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}