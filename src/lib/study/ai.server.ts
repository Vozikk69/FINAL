import { draftPlan } from "@/lib/study/domain";

/** Offline-only fallback tutor. The interactive tutor itself runs in the browser model. */
export async function tutorReply(input: {
  subjectTitle: string;
  description: string;
  history: { role: "user" | "assistant"; content: string }[];
  context: { source: string; text: string }[];
  question: string;
}) {
  const note = input.context[0]?.text;
  if (note) {
    const excerpt = note.slice(0, 900);
    return `I can help you study **${input.subjectTitle}**. I found this related material in your notes:\n\n${excerpt}\n\nTry asking a more specific question about this passage, or open the local tutor in your browser for generated explanations.`;
  }
  return `I can help organize your study of **${input.subjectTitle}**, but the browser-based local model is needed for open-ended explanations. Try reloading the tutor so it can finish downloading its model.\n\nYour question: ${input.question.slice(0, 300)}`;
}

function cleanSentence(value: string) {
  return value
    .replace(/^[-*•\d.)\s]+/, "")
    .replace(/\s+/g, " ")
    .replace(/^["'`]+|["'`]+$/g, "")
    .trim();
}

function isUsableSentence(s: string) {
  if (s.length < 40 || s.length > 600) return false;
  // Need real content, not headings / UI chrome / questions alone.
  if (!/[.!?]$/.test(s) && s.split(" ").length < 8) return false;
  if (/^(chapter|section|figure|table|page|copyright|http)/i.test(s)) return false;
  const letters = (s.match(/[a-zA-Z]/g) || []).length;
  if (letters < s.length * 0.55) return false;
  return true;
}

/** Split material into candidate fact sentences. */
function extractSentences(material: string): string[] {
  const text = material
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/[ \u00a0]+/g, " ")
    .replace(/\n{2,}/g, "\n");

  const raw = text
    .split(/\n+|(?<=[.!?])\s+(?=[A-Z0-9"'])/)
    .map(cleanSentence)
    .filter(isUsableSentence);

  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of raw) {
    const key = s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (key.length < 20 || seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

type DraftCard = { front: string; back: string; score: number };

/**
 * Turn a fact sentence into a proper study Q→A pair.
 * Prefer definition / "X is …" / "X refers to …" / year / cause patterns.
 */
function sentenceToCard(sentence: string, subjectTitle: string): DraftCard | null {
  const s = sentence.trim();
  if (!s) return null;

  // "The Opium Wars were …" / "An alkane is …" / "Photosynthesis refers to …"
  const def =
    s.match(
      /^(?:(?:a|an|the)\s+)?([A-Z][\w'’-]{1,48}(?:\s+[A-Z][\w'’-]{1,30}){0,4})\s+(?:is|are|was|were|means|refers to|describes|represents)\s+(.+)$/i,
    ) ||
    s.match(/^([A-Z][\w'’-]{2,40})\s+(?:is|are|was|were)\s+(.+)$/i);

  if (def) {
    const term = def[1].trim().replace(/\s+/g, " ");
    const rest = def[2].trim().replace(/\.$/, "");
    if (term.length >= 2 && rest.length >= 20) {
      const article = /^[aeiou]/i.test(term) ? "an" : "a";
      const front = term.split(/\s+/).length <= 4 ? `What is ${article} ${term}?` : `What is ${term}?`;
      return { front, back: s.slice(0, 700), score: 90 };
    }
  }

  // "X occurred in YEAR" / "In YEAR, X happened"
  const year =
    s.match(/\b((?:1[6-9]|20)\d{2})\b/) &&
    s.match(
      /^(?:in\s+)?((?:1[6-9]|20)\d{2})[,:]?\s+(.+)$/i,
    );
  if (year) {
    const y = year[1];
    const rest = year[2].replace(/\.$/, "").trim();
    if (rest.length >= 25) {
      return {
        front: `What happened in ${y} (related to ${subjectTitle})?`,
        back: s.slice(0, 700),
        score: 75,
      };
    }
  }

  // "X caused / led to / resulted in Y"
  const cause = s.match(
    /^(.{12,90}?)\s+(?:caused|led to|resulted in|triggered|sparked)\s+(.+)$/i,
  );
  if (cause) {
    const subject = cause[1].trim().replace(/\.$/, "");
    return {
      front: `What did ${subject.slice(0, 80)} lead to?`,
      back: s.slice(0, 700),
      score: 70,
    };
  }

  // Cloze: hide a significant capitalized multi-word phrase or number
  const clozeTarget =
    s.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/) ||
    s.match(/\b((?:1[6-9]|20)\d{2})\b/) ||
    s.match(/\b(\d+(?:\.\d+)?%)\b/);
  if (clozeTarget && clozeTarget[1].length >= 3) {
    const term = clozeTarget[1];
    // Avoid cloze on the first word only if it's the whole subject
    const idx = s.indexOf(term);
    if (idx > 8 || term.split(" ").length > 1) {
      const blanked = (s.slice(0, idx) + "_____" + s.slice(idx + term.length)).slice(0, 220);
      if (blanked.includes("_____") && blanked.length >= 30) {
        return {
          front: `Fill in the blank: ${blanked}${blanked.endsWith("?") || blanked.endsWith(".") ? "" : "."}`,
          back: term,
          score: 55,
        };
      }
    }
  }

  // Fallback: ask for the key fact, keep full sentence as answer
  const topicHint = s.replace(/[.!?]+$/, "").slice(0, 70).trim();
  if (topicHint.length < 25) return null;
  return {
    front: `What should you know about this?`,
    back: s.slice(0, 700),
    score: 30,
  };
}

/**
 * Create useful extractive cards from notes without calling an external LLM.
 * Prioritizes definition-style and factual sentences; avoids turning model
 * hallucinations (or empty fluff) into study material.
 */
export async function generateCardsFromMaterial(input: {
  subjectTitle: string;
  material: string;
  count: number;
}) {
  const sentences = extractSentences(input.material);
  if (!sentences.length) {
    throw new Error(
      "I couldn't find enough complete facts in these notes. Add a few clear sentences (definitions, dates, causes) or create cards manually.",
    );
  }

  const drafts: DraftCard[] = [];
  const usedBacks = new Set<string>();
  const usedFronts = new Set<string>();

  for (const sentence of sentences) {
    const card = sentenceToCard(sentence, input.subjectTitle);
    if (!card) continue;
    const backKey = card.back.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().slice(0, 120);
    const frontKey = card.front.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (usedBacks.has(backKey) || usedFronts.has(frontKey)) continue;
    // Reject fronts that are basically the whole answer
    if (frontKey.length > 40 && backKey.startsWith(frontKey.slice(0, 40))) continue;
    usedBacks.add(backKey);
    usedFronts.add(frontKey);
    drafts.push(card);
  }

  drafts.sort((a, b) => b.score - a.score);

  // Improve weak fallback fronts with numbered key-points only if we have nothing better
  const strong = drafts.filter((d) => d.score >= 55);
  const weak = drafts.filter((d) => d.score < 55);
  const selected = [...strong, ...weak].slice(0, input.count);

  if (!selected.length) {
    throw new Error(
      "I couldn't find enough complete facts in these notes. Add a few clear sentences (definitions, dates, causes) or create cards manually.",
    );
  }

  return selected.map((card, index) => {
    let front = card.front;
    if (card.score < 40) {
      front = `Key fact ${index + 1} (${input.subjectTitle})`;
    }
    return { front: front.slice(0, 220), back: card.back.slice(0, 800) };
  });
}

export async function extractCard(reply: string) {
  const cleaned = reply.replace(/\*\*/g, "").trim();
  const lines = cleaned.split(/\n+/).map(cleanSentence).filter(Boolean);
  const answer =
    lines.filter((line) => !line.endsWith("?")).join(" ").slice(0, 800) || cleaned.slice(0, 800);
  const question =
    lines.find((line) => line.endsWith("?")) ||
    `Explain the main idea: ${lines[0]?.slice(0, 100) ?? "this topic"}?`;
  if (!answer || !question) throw new Error("Could not make a card from that reply.");
  return { front: question.slice(0, 300), back: answer };
}

export async function generateStudyPlan(input: {
  title: string;
  description: string;
  topics: string;
  today: string;
  examDate: string;
  hoursPerDay: number;
}) {
  return { tasks: draftPlan(input), source: "draft" as const };
}
