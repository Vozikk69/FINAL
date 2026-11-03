import { draftPlan } from "@/lib/study/domain";

type ChatBody = {
  choices?: { message?: { content?: string | { type?: string; text?: string }[] } }[];
  error?: { message?: string };
};

function textOf(content: string | { type?: string; text?: string }[] | undefined) {
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) return content.map((part) => part.text ?? "").join("").trim();
  return "";
}

function extractJson(raw: string) {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1] : raw;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("The tutor did not return a plan.");
  return JSON.parse(body.slice(start, end + 1)) as unknown;
}

async function grok(messages: { role: "system" | "user" | "assistant"; content: string }[], maxTokens: number) {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error("The tutor is not available in this environment.");
  let lastStatus = 0;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0.4,
        max_tokens: maxTokens,
        messages,
      }),
      signal: AbortSignal.timeout(45_000),
    });
    if (res.ok) {
      const body = (await res.json()) as ChatBody;
      const text = textOf(body.choices?.[0]?.message?.content);
      if (!text) throw new Error("The tutor returned an empty reply.");
      return text;
    }
    lastStatus = res.status;
    const detail = await res.text().catch(() => "");
    console.error("xai chat failed", res.status, detail.slice(0, 400));
    if (res.status === 401 || res.status === 403) {
      throw new Error("The tutor is unavailable right now. You can still write cards, tasks, and notes by hand.");
    }
    if (res.status !== 429 && res.status < 500) break;
  }
  throw new Error(`The tutor could not answer (${lastStatus || "network"}). Try again.`);
}

export async function tutorReply(input: {
  subjectTitle: string;
  description: string;
  history: { role: "user" | "assistant"; content: string }[];
  context: { source: string; text: string }[];
  question: string;
}) {
  const notes = input.context.length
    ? input.context.map((chunk, index) => `[${index + 1}] (${chunk.source})\n${chunk.text}`).join("\n\n")
    : "No notes were uploaded, or none matched this question.";
  const system = `You are Lumen, a study tutor for "${input.subjectTitle}".
${input.description ? `Subject notes from the student: ${input.description}` : ""}
Rules:
- Be concrete and short. No pep talks, no "certainly", no filler openings.
- When the notes below are relevant, ground the answer in them and cite them as [1], [2].
- If the notes do not cover the question, say so in one clause, then teach from general knowledge.
- Use Markdown: short paragraphs and bullets. One worked example when it helps.
- End explanatory answers with a single check-your-understanding question.

Student notes:
${notes}`;
  const history = input.history.slice(-10).map((message) => ({
    role: message.role,
    content: message.content.slice(0, 2000),
  }));
  return grok(
    [{ role: "system", content: system }, ...history, { role: "user", content: input.question.slice(0, 4000) }],
    700,
  );
}

export async function extractCard(reply: string) {
  const text = await grok(
    [
      {
        role: "system",
        content:
          'Turn a tutor reply into one atomic flashcard. Ignore any closing check question. Return JSON only: {"front":"question","back":"1-3 sentence answer"}.',
      },
      { role: "user", content: reply.slice(0, 6000) },
    ],
    300,
  );
  const parsed = extractJson(text) as { front?: string; back?: string };
  const front = (parsed.front ?? "").trim();
  const back = (parsed.back ?? "").trim();
  if (!front || !back) throw new Error("Could not make a card from that reply.");
  return { front: front.slice(0, 300), back: back.slice(0, 800) };
}

export async function generateCardsFromMaterial(input: { subjectTitle: string; material: string; count: number }) {
  const text = await grok(
    [
      {
        role: "system",
        content: `Create ${input.count} flashcards for "${input.subjectTitle}". Each card tests one fact. Fronts are questions. Backs are 1-3 sentences. No duplicates. Return JSON only: {"cards":[{"front":"...","back":"..."}]}.`,
      },
      { role: "user", content: input.material.slice(0, 12000) },
    ],
    1200,
  );
  const parsed = extractJson(text) as { cards?: { front?: string; back?: string }[] };
  const cards = (parsed.cards ?? [])
    .map((card) => ({ front: (card.front ?? "").trim().slice(0, 300), back: (card.back ?? "").trim().slice(0, 800) }))
    .filter((card) => card.front && card.back)
    .slice(0, input.count);
  if (!cards.length) throw new Error("Could not generate flashcards from that material.");
  return cards;
}

export async function generateStudyPlan(input: {
  title: string;
  description: string;
  topics: string;
  today: string;
  examDate: string;
  hoursPerDay: number;
}) {
  const fallback = () => ({ tasks: draftPlan(input), source: "draft" as const });
  try {
    const text = await grok(
      [
        {
          role: "system",
          content:
            'Return JSON only: {"tasks":[{"title":"specific study task","dueDate":"YYYY-MM-DD"}]}. No markdown.',
        },
        {
          role: "user",
          content: `Build a day-by-day study plan for "${input.title}".
Today is ${input.today}. The exam is ${input.examDate}. The student can study about ${input.hoursPerDay} hours a day.
${input.description ? `Description: ${input.description}` : ""}
${input.topics ? `Topics:\n${input.topics}` : "Infer a sensible syllabus."}
Rules: spread work from today through the day before the exam; finish with review and a practice exam. 1-3 tasks a day, sized to the hours. Revisit earlier topics. Maximum 36 tasks. Every dueDate must be between ${input.today} and ${input.examDate} inclusive.`,
        },
      ],
      1400,
    );
    const parsed = extractJson(text) as { tasks?: { title?: string; dueDate?: string }[] };
    const tasks = (parsed.tasks ?? [])
      .map((task) => ({ title: (task.title ?? "").trim().slice(0, 180), dueDate: (task.dueDate ?? "").trim() }))
      .filter((task) => task.title && task.dueDate >= input.today && task.dueDate <= input.examDate && /^\d{4}-\d{2}-\d{2}$/.test(task.dueDate))
      .slice(0, 40);
    if (tasks.length < 2) return fallback();
    return { tasks, source: "tutor" as const };
  } catch (error) {
    console.error("plan fallback", error);
    return fallback();
  }
}
