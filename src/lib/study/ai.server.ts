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
  return value.replace(/^[-*•\d.)\s]+/, "").replace(/\s+/g, " ").trim();
}

/** Create useful extractive cards from notes without calling an external service. */
export async function generateCardsFromMaterial(input: { subjectTitle: string; material: string; count: number }) {
  const blocks = input.material
    .replace(/\r/g, "")
    .split(/\n+|(?<=[.!?])\s+/)
    .map(cleanSentence)
    .filter((sentence) => sentence.length >= 35 && sentence.length <= 800);

  const seen = new Set<string>();
  const cards: { front: string; back: string }[] = [];
  for (const sentence of blocks) {
    const key = sentence.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const definition = sentence.match(/^(?:a|an|the)?\s*([A-Z][\w-]{2,40})\s+(?:is|are|means|refers to|describes)\s+(.+)$/i);
    const front = definition
      ? `What is ${definition[1]}?`
      : `What should you remember about ${input.subjectTitle}?`;
    const back = sentence.slice(0, 800);
    if (!cards.some((card) => card.back.toLowerCase() === back.toLowerCase())) {
      cards.push({ front, back });
    }
    if (cards.length >= input.count) break;
  }

  if (!cards.length) {
    throw new Error("I couldn't find enough complete facts in these notes. Add a few sentences or create cards manually.");
  }
  // Make generic prompts distinct when the source has no definition-like sentences.
  return cards.map((card, index) => ({
    ...card,
    front: card.front.startsWith("What should you remember")
      ? `Key point ${index + 1}: ${card.back.slice(0, 90)}${card.back.length > 90 ? "…" : ""}`
      : card.front,
  }));
}

export async function extractCard(reply: string) {
  const cleaned = reply.replace(/\*\*/g, "").trim();
  const lines = cleaned.split(/\n+/).map(cleanSentence).filter(Boolean);
  const answer = lines.filter((line) => !line.endsWith("?")).join(" ").slice(0, 800) || cleaned.slice(0, 800);
  const question = lines.find((line) => line.endsWith("?")) || `Explain the main idea: ${lines[0]?.slice(0, 100) ?? "this topic"}?`;
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
