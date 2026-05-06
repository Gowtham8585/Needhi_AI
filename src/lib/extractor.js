const IMPORTANCE_KEYWORDS = [
  "shall", "must", "directed", "ordered", "within", "hereby", "comply",
  "compliance", "forthwith", "pay", "reinstate", "submit", "provide",
  "release", "appoint", "issue", "refund", "deposit",
];

const ACTION_VERBS = [
  "pay", "reinstate", "submit", "provide", "release", "appoint",
  "issue", "refund", "deposit", "comply", "produce", "furnish",
  "consider", "decide", "dispose", "transfer", "restore", "grant",
];

const DEPARTMENT_MAP = {
  pay: "Finance Department",
  refund: "Finance Department",
  deposit: "Finance Department",
  reinstate: "Human Resources / Personnel",
  appoint: "Human Resources / Personnel",
  release: "Human Resources / Personnel",
  submit: "Administrative Department",
  provide: "Administrative Department",
  furnish: "Administrative Department",
  produce: "Administrative Department",
  issue: "Administrative Department",
  comply: "Compliance Cell",
  consider: "Concerned Authority",
  decide: "Concerned Authority",
  dispose: "Concerned Authority",
  transfer: "Concerned Authority",
  restore: "Concerned Authority",
  grant: "Concerned Authority",
};

const APPEAL_TRIGGERS = ["appeal", "challenge", "set aside", "review"];

function splitSentences(text) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z(0-9])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
}

function extractDeadline(s) {
  const m = s.match(/within\s+(\d+)\s*(days?|weeks?|months?|years?)/i);
  if (m) {
    const num = parseInt(m[1]);
    const unit = m[2].toLowerCase();
    let ms = 0;
    if (unit.startsWith("day")) ms = num * 24 * 60 * 60 * 1000;
    else if (unit.startsWith("week")) ms = num * 7 * 24 * 60 * 60 * 1000;
    else if (unit.startsWith("month")) ms = num * 30 * 24 * 60 * 60 * 1000;
    else if (unit.startsWith("year")) ms = num * 365 * 24 * 60 * 60 * 1000;
    return { label: `Within ${m[1]} ${m[2].toLowerCase()}`, timestamp: ms };
  }

  const dateMatch = s.match(/\b(?:on or before|by)\s+([0-9]{1,2}[./-][0-9]{1,2}[./-][0-9]{2,4})/i);
  if (dateMatch) {
    const d = new Date(dateMatch[1]);
    return { label: `By ${dateMatch[1]}`, timestamp: isNaN(d.getTime()) ? null : d.getTime() };
  }

  const verboseMatch = s.match(/\b(?:on or before|by)\s+([A-Z][a-z]+ \d{1,2},?\s*\d{4})/);
  if (verboseMatch) {
    const d = new Date(verboseMatch[1]);
    return { label: `By ${verboseMatch[1]}`, timestamp: isNaN(d.getTime()) ? null : d.getTime() };
  }

  return null;
}

function extractAmount(s) {
  const m =
    s.match(/(?:Rs\.?|INR|₹)\s*([0-9,]+(?:\.[0-9]+)?)\s*(?:\/-)?(?:\s*(lakh|lakhs|crore|crores))?/i) ||
    s.match(/([0-9,]+(?:\.[0-9]+)?)\s*(rupees|lakh|lakhs|crore|crores)/i);
  if (!m) return null;
  return `₹${m[1]}${m[2] ? " " + m[2] : ""}`;
}

function detectVerb(s) {
  const lower = s.toLowerCase();
  for (const v of ACTION_VERBS) {
    const re = new RegExp(`\\b${v}(?:s|ed|ing)?\\b`, "i");
    if (re.test(lower)) return v;
  }
  return null;
}

function classify(verb, sentence) {
  const lower = sentence.toLowerCase();
  if (APPEAL_TRIGGERS.some((t) => lower.includes(t))) return "Appeal";
  if (verb) return "Compliance";
  return "Information";
}

function highlightWords(s) {
  const found = new Set();
  const lower = s.toLowerCase();
  for (const k of [...IMPORTANCE_KEYWORDS, ...ACTION_VERBS]) {
    const re = new RegExp(`\\b${k}\\w*\\b`, "gi");
    const m = lower.match(re);
    if (m) m.forEach((w) => found.add(w));
  }
  return [...found];
}

function score(
  sentence,
  verb,
  amount,
  deadline,
  inOrderSection,
) {
  let s = 0;
  const lower = sentence.toLowerCase();
  const kw = IMPORTANCE_KEYWORDS.filter((k) => lower.includes(k)).length;
  s += Math.min(kw, 5) * 8; // up to 40
  if (verb) s += 25;
  if (deadline) s += 15;
  if (amount) s += 10;
  if (inOrderSection) s += 10;
  return Math.min(100, s);
}

function findOrderSectionIndex(text) {
  const m = text.match(/\b(ORDER|JUDGMENT|DIRECTIONS?|HELD)\b\s*[:\-]?/i);
  return m ? (m.index ?? -1) : -1;
}

function extractCaseMeta(text) {
  const head = text.slice(0, 2000);
  const caseNumber =
    head.match(/\b(?:W\.?P\.?|Civil Appeal|Criminal Appeal|S\.L\.P\.?|C\.A\.|CRL\.A\.?|WRIT PETITION)[^\n]{0,60}\b(?:No\.?\s*)?\d+[^\s]*(?:\s*of\s*\d{4})?/i)?.[0] ?? null;
  const judgmentDate =
    head.match(/\b(?:Date(?:d)?(?:\s+of\s+Judgment)?[:\s]+)?(\d{1,2}(?:st|nd|rd|th)?\s+[A-Z][a-z]+,?\s+\d{4})/)?.[1] ??
    head.match(/\b(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})\b/)?.[1] ??
    null;

  const partiesMatch = head.match(/([A-Z][A-Za-z.\s&]+?)\s+(?:vs?\.?|versus)\s+([A-Z][A-Za-z.\s&]+?)(?:\n|\.)/);
  const parties = partiesMatch ? [partiesMatch[1].trim(), partiesMatch[2].trim()] : [];
  const caseTitle = parties.length === 2 ? `${parties[0]} vs ${parties[1]}` : null;

  return { caseNumber, judgmentDate, parties, caseTitle };
}

export function buildCaseRecord(fileName, text) {
  const meta = extractCaseMeta(text);
  const orderIdx = findOrderSectionIndex(text);
  const sentences = splitSentences(text);

  // Generate a simple heuristic summary based on the first few substantive sentences
  const summarySentences = sentences.filter(s => s.length > 60 && !s.match(/^[A-Z\s]+$/)).slice(0, 3);
  const overallSummary = summarySentences.length > 0 
    ? summarySentences.join(" ") 
    : "No detailed summary could be extracted from this document.";

  const candidates = [];
  let cursor = 0;
  for (const sentence of sentences) {
    const idx = text.indexOf(sentence, cursor);
    if (idx >= 0) cursor = idx;
    const inOrder = orderIdx >= 0 && cursor >= orderIdx;
    const verb = detectVerb(sentence);
    const deadlineInfo = extractDeadline(sentence);
    const amount = extractAmount(sentence);
    const lower = sentence.toLowerCase();
    const hasKw = IMPORTANCE_KEYWORDS.some((k) => lower.includes(k));
    if (!verb && !hasKw) continue;

    const conf = score(sentence, verb, amount, deadlineInfo?.label ?? null, inOrder);
    if (conf < 30) continue;

    const type = classify(verb, sentence);
    const dept = verb ? DEPARTMENT_MAP[verb] ?? "Concerned Authority" : "Concerned Authority";
    const action = buildActionLabel(verb, sentence, amount, deadlineInfo?.label ?? null);

    // Calculate final deadline timestamp
    let finalTs = null;
    if (deadlineInfo?.timestamp) {
      if (deadlineInfo.label.startsWith("Within")) {
        // Offset from judgment date or upload date
        const base = meta.judgmentDate ? new Date(meta.judgmentDate).getTime() : Date.now();
        finalTs = (isNaN(base) ? Date.now() : base) + deadlineInfo.timestamp;
      } else {
        // Absolute timestamp
        finalTs = deadlineInfo.timestamp;
      }
    }

    candidates.push({
      id: crypto.randomUUID(),
      action,
      verb: verb ?? "—",
      department: dept,
      deadline: deadlineInfo?.label ?? null,
      deadlineTimestamp: finalTs,
      amount,
      type,
      sentence,
      highlights: highlightWords(sentence),
      confidence: conf,
      status: "Pending",
    });
  }

  candidates.sort((a, b) => b.confidence - a.confidence);
  const top = candidates.slice(0, 15);

  return {
    id: crypto.randomUUID(),
    fileName,
    uploadedAt: Date.now(),
    rawText: text,
    overallSummary,
    actions: top,
    ...meta,
  };
}

function buildActionLabel(
  verb,
  sentence,
  amount,
  deadline,
) {
  if (verb) {
    const lowerSentence = sentence.toLowerCase();
    const verbIdx = lowerSentence.indexOf(verb);
    
    let context = sentence;
    if (verbIdx !== -1) {
      // Start from the verb to capture the actionable part
      context = sentence.slice(verbIdx);
    }
    
    // Capitalize the first letter
    let label = context.charAt(0).toUpperCase() + context.slice(1);
    
    // Truncate if excessively long
    if (label.length > 150) {
      label = label.slice(0, 150) + "…";
    }
    return label;
  }
  return sentence.slice(0, 150) + (sentence.length > 150 ? "…" : "");
}