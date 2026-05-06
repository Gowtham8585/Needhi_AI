// --- LOCAL LEGAL KNOWLEDGE BASE (Constitution of India) ---
const LEGAL_KB = {
  "article 1": "Article 1 of the Constitution of India states that India, that is Bharat, shall be a Union of States.",
  "article 5": "Article 5 of the Constitution of India covers citizenship at the commencement of the Constitution for those domiciled in India.",
  "article 12": "Article 12 of the Constitution of India defines 'the State' for the purposes of Fundamental Rights.",
  "article 13": "Article 13 of the Constitution of India declares that laws inconsistent with or in derogation of Fundamental Rights shall be void.",
  "article 14": "Article 14 of the Constitution of India ensures equality before the law and equal protection of the laws within the territory of India.",
  "article 15": "Article 15 of the Constitution of India prohibits discrimination on grounds of religion, race, caste, sex, or place of birth.",
  "article 16": "Article 16 of the Constitution of India guarantees equality of opportunity in matters of public employment.",
  "article 17": "Article 17 of the Constitution of India abolishes 'Untouchability' and forbids its practice in any form.",
  "article 19": "Article 19 of the Constitution of India guarantees the protection of certain rights regarding freedom of speech, assembly, association, movement, and profession.",
  "article 21": "Article 21 of the Constitution of India protects life and personal liberty, stating that no person shall be deprived of their life or personal liberty except according to procedure established by law.",
  "article 21a": "Article 21A of the Constitution of India guarantees the right to free and compulsory education for all children between the ages of six and fourteen years.",
  "article 32": "Article 32 of the Constitution of India provides the right to move the Supreme Court for the enforcement of Fundamental Rights.",
  "article 44": "Article 44 of the Constitution of India directs the State to endeavour to secure for the citizens a uniform civil code throughout the territory of India.",
  "article 51a": "Article 51A of the Constitution of India outlines the Fundamental Duties of every citizen of India.",
  "article 226": "Article 226 of the Constitution of India empowers High Courts to issue writs for the enforcement of Fundamental Rights and for any other legal purpose.",
  "preamble": "The Preamble to the Constitution of India declares India to be a Sovereign Socialist Secular Democratic Republic, securing justice, liberty, equality, and fraternity.",
  "slp": "A Special Leave Petition (SLP) is filed under Article 136 of the Constitution of India, allowing the Supreme Court to hear appeals against any judgment or order.",
  "writ of mandamus": "A Writ of Mandamus is issued by courts under Article 32 or 226 of the Constitution of India to direct a public authority to perform its legal duty.",
};

// --- HELPER FUNCTIONS ---

function getParagraphs(text) {
  return text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 50);
}

function calculateScore(query, text) {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const textLower = text.toLowerCase();
  let score = 0;
  
  queryWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = textLower.match(regex);
    if (matches) {
      score += matches.length * (10 / word.length);
    }
  });
  
  return score;
}

export function answer(question, caseRec) {
  if (!caseRec) {
    return "⚖️ **Officer, no case file is currently loaded.**\n\nPlease upload a court judgment PDF first. Once analyzed, I can provide accurate information regarding directives, deadlines, and legal procedures.";
  }

  const q = question.toLowerCase();

  // 1. CASE METADATA INTENT (Concise & Accurate)
  if (/\b(case number|case no|order no|petition number)\b/.test(q)) {
    return `**Case Number:** ${caseRec.caseNumber || "Not explicitly mentioned in the header."}`;
  }
  if (/\b(title|name of the case|case title)\b/.test(q)) {
    return `**Case Title:** ${caseRec.caseTitle || caseRec.fileName}`;
  }
  if (/\b(date|order date|judgment date)\b/.test(q)) {
    return `**Date of Order:** ${caseRec.judgmentDate || "Not identified."}`;
  }

  // 2. ACTION PLAN INTENT (Prioritize the extracted directives)
  if (/\b(action|directive|instruction|task|require|do|order|command|step|what to do|next step)\b/.test(q)) {
    if (caseRec.actions && caseRec.actions.length > 0) {
      const items = caseRec.actions.map((a, i) => `${i + 1}. **${a.action}** (Dept: ${a.department})`).join("\n");
      const nextStep = q.includes("next") ? `\n\n**Immediate Next Step:** ${caseRec.actions[0].action}` : "";
      return `### 📜 Court Directives\n${items}${nextStep}`;
    }
    return "The system did not detect any explicit directives in this judgment.";
  }

  // 3. DEADLINE INTENT
  if (/\b(deadline|last date|limit|within|time|expire|when)\b/.test(q)) {
    const withDeadlines = caseRec.actions.filter(a => a.deadline);
    if (withDeadlines.length > 0) {
      const items = withDeadlines.map(a => `- **${a.action}**: Due by ${a.deadline}`).join("\n");
      return `### ⏳ Legal Deadlines\n${items}`;
    }
    return "No specific compliance deadlines were identified in the judgment.";
  }

  // 4. PARTY INTENT
  if (/\b(party|parties|petitioner|respondent|vs|versus|who)\b/.test(q)) {
    if (q.includes("petitioner")) return `**Petitioner/Appellant:** ${caseRec.parties[0] || "N/A"}`;
    if (q.includes("respondent")) return `**Respondent:** ${caseRec.parties[1] || "N/A"}`;
    return `### 👥 Litigating Parties\n**Petitioner/Appellant:** ${caseRec.parties[0] || "N/A"}\n**Respondent:** ${caseRec.parties[1] || "N/A"}`;
  }

  // 5. COURT INTENT
  if (/\b(court|where|who gave|bench|judge)\b/.test(q)) {
    const courts = ["Supreme Court", "High Court", "District Court", "Tribunal"];
    const found = courts.find(c => caseRec.rawText.toLowerCase().includes(c.toLowerCase()));
    return `**Issuing Authority:** ${found || "Not explicitly identified (likely mentioned in the header)."}`;
  }

  // 6. Check Legal Knowledge Base
  for (const [key, val] of Object.entries(LEGAL_KB)) {
    if (q.includes(key)) {
      return `### ⚖️ Legal Definition: ${key.toUpperCase()}\n${val}`;
    }
  }

  // 7. SUMMARY / VERDICT INTENT
  if (/\b(summary|overview|what is it about|tell me|verdict|decision|final)\b/.test(q)) {
    const header = q.includes("verdict") || q.includes("final") ? "### 🏁 Final Verdict" : "### 📝 Case Overview";
    return `${header}\n${caseRec.overallSummary || "No summary available."}`;
  }

  // 7. SEMANTIC SEARCH (Deep document lookup - now more concise)
  const paragraphs = getParagraphs(caseRec.rawText);
  const scored = paragraphs.map(p => ({
    text: p,
    score: calculateScore(q, p)
  })).sort((a, b) => b.score - a.score);

  if (scored.length > 0 && scored[0].score > 3) {
    const top = scored[0].text;
    let formatted = top.length > 500 ? top.slice(0, 500).trim() + "..." : top;
    
    return `**According to the Judgment:**\n> "${formatted}"`;
  }

  // 8. Default Fallback
  return "⚖️ **No definitive court-related answer found.**\n\nTry asking for:\n- **Case Number**\n- **Directives**\n- **Deadlines**\n- **Parties**";
}
