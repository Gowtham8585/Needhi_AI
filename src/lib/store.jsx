import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import { useAuth } from "@/hooks/useSupabaseAuth";

const SessionCtx = createContext(null);

export function SessionProvider({ children }) {
  const { user: authUser } = useAuth();
  const [state, setState] = useState({ 
    user: null, 
    cases: [], 
    activeCaseId: null,
    language: "english" 
  });

  // Load cases from Supabase when authUser changes
  useEffect(() => {
    if (authUser) {
      const fetchCases = async () => {
        try {
          const { data, error } = await supabase
            .from('cases')
            .select('*, actions(*)')
            .order('created_at', { ascending: false });

          if (error) {
            console.warn("Could not fetch cases from Supabase. Ensure tables are created.", error.message);
            return;
          }

          if (data) {
            const formattedCases = data.map(c => ({
              id: c.id,
              fileName: c.filename,
              uploadedAt: new Date(c.created_at).getTime(),
              caseTitle: c.case_title,
              caseNumber: c.case_number,
              judgmentDate: c.judgment_date,
              parties: c.parties || [],
              rawText: c.content || "",
              overallSummary: c.overall_summary,
              actions: (c.actions || []).map((a) => ({
                id: a.id,
                action: a.directive,
                verb: a.type || "",
                department: a.department,
                deadline: a.deadline,
                amount: a.amount,
                type: a.type,
                sentence: a.source_text,
                highlights: [],
                confidence: a.confidence,
                status: a.status
              })),
            }));
            setState(s => ({ ...s, user: authUser.email || null, cases: formattedCases }));
          }
        } catch (err) {
          console.error("Database sync failed:", err);
        }
      };
      fetchCases();
    } else {
      setState(s => ({ ...s, user: null, cases: [] }));
    }
  }, [authUser]);

  const value = useMemo(
    () => ({
      ...state,
      login: (name) => setState((s) => ({ ...s, user: name })),
      setLanguage: (lang) => setState((s) => ({ ...s, language: lang })),
      updateCase: (caseId, patch) => setState((s) => ({
        ...s,
        cases: s.cases.map((c) => (c.id === caseId ? { ...c, ...patch } : c)),
      })),
      logout: () => {
        setState({ user: null, cases: [], activeCaseId: null, language: "english" });
      },
      addCase: async (c) => {
        // Save to Supabase
        if (authUser) {
          const { data: caseData, error: caseError } = await supabase
            .from('cases')
            .insert({
              user_id: authUser.id,
              filename: c.fileName,
              case_title: c.caseTitle,
              case_number: c.caseNumber,
              judgment_date: c.judgmentDate,
              parties: c.parties,
              content: c.rawText,
              overall_summary: c.overallSummary,
              language: state.language
            })
            .select()
            .single();

          if (!caseError && caseData) {
            const actionsToInsert = c.actions.map(a => ({
              case_id: caseData.id,
              directive: a.action,
              type: a.verb,
              department: a.department,
              deadline: a.deadline,
              amount: a.amount,
              status: a.status,
              confidence: a.confidence,
              source_text: a.sentence
            }));

            await supabase.from('actions').insert(actionsToInsert);
            
            // Refresh cases is handled by the useEffect or we can manually add
            setState((s) => ({ ...s, cases: [{ ...c, id: caseData.id }, ...s.cases], activeCaseId: caseData.id }));
          } else {
            console.error("Error saving case:", caseError);
          }
        } else {
          setState((s) => ({ ...s, cases: [c, ...s.cases], activeCaseId: c.id }));
        }
      },
      setActive: (id) => setState((s) => ({ ...s, activeCaseId: id })),
      updateAction: async (caseId, actionId, patch) => {
        if (authUser) {
          await supabase.from('actions').update({
            directive: patch.action,
            status: patch.status,
            department: patch.department,
            deadline: patch.deadline,
            amount: patch.amount
          }).eq('id', actionId);
        }
        setState((s) => ({
          ...s,
          cases: s.cases.map((c) =>
            c.id !== caseId ? c : { ...c, actions: c.actions.map((a) => (a.id === actionId ? { ...a, ...patch } : a)) },
          ),
        }));
      },
      removeCase: async (id) => {
        if (authUser) {
          await supabase.from('cases').delete().eq('id', id);
        }
        setState((s) => ({
          ...s,
          cases: s.cases.filter((c) => c.id !== id),
          activeCaseId: s.activeCaseId === id ? null : s.activeCaseId,
        }));
      },
    }),
    [state, authUser],
  );

  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>;
}

export function useSession() {
  const v = useContext(SessionCtx);
  if (!v) throw new Error("useSession must be used inside SessionProvider");
  return v;
}

export function useActiveCase() {
  const { cases, activeCaseId } = useSession();
  return cases.find((c) => c.id === activeCaseId) ?? null;
}