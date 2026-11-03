import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import type { Sql } from "@/lib/db";
import {
  applySm2,
  chunkText,
  eachDay,
  isDay,
  retrieveRelevantChunks,
  type ChatMessage,
  type Flashcard,
  type NoteDoc,
  type PlanTask,
  type ReviewQuality,
  type SessionType,
  type StudySession,
  type Subject,
  type Workspace,
} from "@/lib/study/domain";

const SESSION_TYPES = new Set<SessionType>(["chat", "cards", "pomodoro"]);

function uid() {
  return crypto.randomUUID();
}

function nowIso() {
  return new Date().toISOString();
}

function asBool(value: unknown) {
  return value === true || value === "t" || value === "true" || value === 1 || value === "1";
}

function num(value: unknown, fallback = 0) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

async function db() {
  const { getSql } = await import("@/lib/db");
  return getSql();
}

async function assertSubject(sql: Sql, userId: string, subjectId: string) {
  const rows = await sql<{ id: string }>`select id from subjects where id = ${subjectId} and user_id = ${userId}`;
  if (!rows.length) throw new Error("Subject not found.");
}

async function saveChunks(sql: Sql, userId: string, subjectId: string, name: string, text: string) {
  const countRows = await sql<{ n: number }>`
    select count(*) as n from notes where user_id = ${userId} and subject_id = ${subjectId}
  `;
  if (num(countRows[0]?.n) >= 30) throw new Error("This subject already has 30 notes.");
  const chunks = chunkText(text).slice(0, 200);
  if (!chunks.length) throw new Error("No readable text found in that note.");
  const noteId = uid();
  const createdAt = nowIso();
  await sql`
    insert into notes (id, user_id, subject_id, name, created_at)
    values (${noteId}, ${userId}, ${subjectId}, ${name}, ${createdAt})
  `;
  for (let position = 0; position < chunks.length; position += 1) {
    await sql`
      insert into note_chunks (id, user_id, note_id, subject_id, source, content, position)
      values (${uid()}, ${userId}, ${noteId}, ${subjectId}, ${name}, ${chunks[position]}, ${position})
    `;
  }
  return { id: noteId, name, chunkCount: chunks.length, createdAt };
}

export const getWorkspace = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Workspace> => {
    const sql = await db();
    const userId = context.userId;
    const subjects = await sql<{
      id: string;
      title: string;
      description: string;
      target_date: string | null;
      created_at: string;
    }>`
      select id, title, description, target_date, created_at
      from subjects where user_id = ${userId} order by created_at asc
    `;
    const sessions = await sql<{
      id: string;
      subject_id: string | null;
      duration_minutes: number;
      type: string;
      created_at: string;
    }>`
      select id, subject_id, duration_minutes, type, created_at from study_sessions
      where user_id = ${userId} order by created_at desc limit 1000
    `;
    const cards = await sql<{
      id: string;
      subject_id: string;
      front_text: string;
      back_text: string;
      easiness_factor: number;
      interval_days: number;
      repetitions: number;
      next_review_date: string;
      created_at: string;
    }>`
      select id, subject_id, front_text, back_text, easiness_factor, interval_days, repetitions, next_review_date, created_at
      from flashcards where user_id = ${userId} order by next_review_date asc
    `;
    const messages = await sql<{
      id: string;
      subject_id: string;
      role: string;
      content: string;
      created_at: string;
    }>`
      select id, subject_id, role, content, created_at from (
        select id, subject_id, role, content, created_at from chat_messages
        where user_id = ${userId} order by created_at desc limit 200
      ) recent order by created_at asc
    `;
    const tasks = await sql<{
      id: string;
      subject_id: string;
      title: string;
      due_date: string;
      is_completed: unknown;
    }>`
      select id, subject_id, title, due_date, is_completed from plan_tasks
      where user_id = ${userId} order by due_date asc, title asc
    `;
    const notes = await sql<{
      id: string;
      subject_id: string;
      name: string;
      created_at: string;
      chunk_count: number;
    }>`
      select n.id, n.subject_id, n.name, n.created_at,
        (select count(*) from note_chunks c where c.note_id = n.id and c.user_id = n.user_id) as chunk_count
      from notes n where n.user_id = ${userId} order by n.created_at desc
    `;
    return {
      subjects: subjects.map(
        (row): Subject => ({
          id: row.id,
          title: row.title,
          description: row.description,
          targetDate: row.target_date,
          createdAt: row.created_at,
        }),
      ),
      sessions: sessions
        .map(
          (row): StudySession => ({
            id: row.id,
            subjectId: row.subject_id,
            durationMinutes: num(row.duration_minutes),
            type: (SESSION_TYPES.has(row.type as SessionType) ? row.type : "pomodoro") as SessionType,
            createdAt: row.created_at,
          }),
        )
        .reverse(),
      flashcards: cards.map(
        (row): Flashcard => ({
          id: row.id,
          subjectId: row.subject_id,
          frontText: row.front_text,
          backText: row.back_text,
          easinessFactor: num(row.easiness_factor, 2.5),
          interval: num(row.interval_days),
          repetitions: num(row.repetitions),
          nextReviewDate: row.next_review_date,
          createdAt: row.created_at,
        }),
      ),
      messages: messages
        .filter((row) => row.role === "user" || row.role === "assistant")
        .map(
          (row): ChatMessage => ({
            id: row.id,
            subjectId: row.subject_id,
            role: row.role as "user" | "assistant",
            content: row.content,
            timestamp: row.created_at,
          }),
        ),
      tasks: tasks.map(
        (row): PlanTask => ({
          id: row.id,
          subjectId: row.subject_id,
          title: row.title,
          dueDate: row.due_date,
          isCompleted: asBool(row.is_completed),
        }),
      ),
      notes: notes.map(
        (row): NoteDoc => ({
          id: row.id,
          subjectId: row.subject_id,
          name: row.name,
          chunkCount: num(row.chunk_count),
          createdAt: row.created_at,
        }),
      ),
    };
  });

export const addSubject = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { title: string; description?: string; targetDate?: string | null }) => {
    const title = (input.title ?? "").trim().slice(0, 120);
    if (!title) throw new Error("Give the subject a name.");
    const description = (input.description ?? "").trim().slice(0, 2000);
    const targetDate = input.targetDate && isDay(input.targetDate) ? input.targetDate : null;
    return { title, description, targetDate };
  })
  .handler(async ({ context, data }) => {
    const sql = await db();
    const subject: Subject = {
      id: uid(),
      title: data.title,
      description: data.description,
      targetDate: data.targetDate,
      createdAt: nowIso(),
    };
    await sql`
      insert into subjects (id, user_id, title, description, target_date, created_at)
      values (${subject.id}, ${context.userId}, ${subject.title}, ${subject.description}, ${subject.targetDate}, ${subject.createdAt})
    `;
    return subject;
  });

export const updateSubject = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; title: string; description?: string; targetDate?: string | null }) => {
    const title = (input.title ?? "").trim().slice(0, 120);
    if (!input.id || !title) throw new Error("Give the subject a name.");
    return {
      id: input.id,
      title,
      description: (input.description ?? "").trim().slice(0, 2000),
      targetDate: input.targetDate && isDay(input.targetDate) ? input.targetDate : null,
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await db();
    await sql`
      update subjects set title = ${data.title}, description = ${data.description}, target_date = ${data.targetDate}
      where id = ${data.id} and user_id = ${context.userId}
    `;
    return { ok: true as const };
  });

export const deleteSubject = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => {
    if (!input.id) throw new Error("Missing subject.");
    return input;
  })
  .handler(async ({ context, data }) => {
    const sql = await db();
    const userId = context.userId;
    await sql`delete from note_chunks where user_id = ${userId} and subject_id = ${data.id}`;
    await sql`delete from notes where user_id = ${userId} and subject_id = ${data.id}`;
    await sql`delete from chat_messages where user_id = ${userId} and subject_id = ${data.id}`;
    await sql`delete from plan_tasks where user_id = ${userId} and subject_id = ${data.id}`;
    await sql`delete from flashcards where user_id = ${userId} and subject_id = ${data.id}`;
    await sql`update study_sessions set subject_id = null where user_id = ${userId} and subject_id = ${data.id}`;
    await sql`delete from subjects where id = ${data.id} and user_id = ${userId}`;
    return { ok: true as const };
  });

export const logSession = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { subjectId?: string | null; durationMinutes: number; type: SessionType }) => {
    if (!SESSION_TYPES.has(input.type)) throw new Error("Unknown session type.");
    const durationMinutes = Math.max(1, Math.min(180, Math.round(Number(input.durationMinutes) || 0)));
    return { subjectId: input.subjectId || null, durationMinutes, type: input.type };
  })
  .handler(async ({ context, data }) => {
    const sql = await db();
    if (data.subjectId) await assertSubject(sql, context.userId, data.subjectId);
    const session: StudySession = {
      id: uid(),
      subjectId: data.subjectId,
      durationMinutes: data.durationMinutes,
      type: data.type,
      createdAt: nowIso(),
    };
    await sql`
      insert into study_sessions (id, user_id, subject_id, duration_minutes, type, created_at)
      values (${session.id}, ${context.userId}, ${session.subjectId}, ${session.durationMinutes}, ${session.type}, ${session.createdAt})
    `;
    return session;
  });

async function insertCard(sql: Sql, userId: string, subjectId: string, front: string, back: string) {
  const card: Flashcard = {
    id: uid(),
    subjectId,
    frontText: front.trim().slice(0, 300),
    backText: back.trim().slice(0, 800),
    easinessFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: nowIso(),
    createdAt: nowIso(),
  };
  if (!card.frontText || !card.backText) throw new Error("A card needs both sides.");
  await sql`
    insert into flashcards (
      id, user_id, subject_id, front_text, back_text, easiness_factor, interval_days, repetitions, next_review_date, created_at
    ) values (
      ${card.id}, ${userId}, ${subjectId}, ${card.frontText}, ${card.backText},
      ${card.easinessFactor}, ${card.interval}, ${card.repetitions}, ${card.nextReviewDate}, ${card.createdAt}
    )
  `;
  return card;
}

export const addFlashcard = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { subjectId: string; frontText: string; backText: string }) => {
    if (!input.subjectId) throw new Error("Pick a subject.");
    return input;
  })
  .handler(async ({ context, data }) => {
    const sql = await db();
    await assertSubject(sql, context.userId, data.subjectId);
    return insertCard(sql, context.userId, data.subjectId, data.frontText, data.backText);
  });

export const updateFlashcard = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; frontText: string; backText: string }) => {
    const frontText = (input.frontText ?? "").trim().slice(0, 300);
    const backText = (input.backText ?? "").trim().slice(0, 800);
    if (!input.id || !frontText || !backText) throw new Error("A card needs both sides.");
    return { id: input.id, frontText, backText };
  })
  .handler(async ({ context, data }) => {
    const sql = await db();
    await sql`
      update flashcards set front_text = ${data.frontText}, back_text = ${data.backText}
      where id = ${data.id} and user_id = ${context.userId}
    `;
    return { ok: true as const };
  });

export const deleteFlashcard = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await db();
    await sql`delete from flashcards where id = ${data.id} and user_id = ${context.userId}`;
    return { ok: true as const };
  });

export const reviewFlashcard = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; quality: ReviewQuality }) => {
    if (!input.id || input.quality < 0 || input.quality > 5) throw new Error("Invalid review.");
    return input;
  })
  .handler(async ({ context, data }) => {
    const sql = await db();
    const rows = await sql<{
      easiness_factor: number;
      interval_days: number;
      repetitions: number;
    }>`
      select easiness_factor, interval_days, repetitions from flashcards
      where id = ${data.id} and user_id = ${context.userId}
    `;
    const row = rows[0];
    if (!row) throw new Error("That card is gone.");
    const next = applySm2(
      { easinessFactor: num(row.easiness_factor, 2.5), interval: num(row.interval_days), repetitions: num(row.repetitions) },
      data.quality,
    );
    await sql`
      update flashcards set
        easiness_factor = ${next.easinessFactor},
        interval_days = ${next.interval},
        repetitions = ${next.repetitions},
        next_review_date = ${next.nextReviewDate}
      where id = ${data.id} and user_id = ${context.userId}
    `;
    return next;
  });

export const sendTutorMessage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { subjectId: string; content: string }) => {
    const content = (input.content ?? "").trim().slice(0, 4000);
    if (!input.subjectId || !content) throw new Error("Write a question first.");
    return { subjectId: input.subjectId, content };
  })
  .handler(async ({ context, data }) => {
    const sql = await db();
    const userId = context.userId;
    const subjects = await sql<{ title: string; description: string }>`
      select title, description from subjects where id = ${data.subjectId} and user_id = ${userId}
    `;
    const subject = subjects[0];
    if (!subject) throw new Error("Subject not found.");
    const history = await sql<{ role: string; content: string }>`
      select role, content from chat_messages
      where user_id = ${userId} and subject_id = ${data.subjectId}
      order by created_at desc limit 10
    `;
    const chunks = await sql<{ source: string; content: string }>`
      select source, content from note_chunks where user_id = ${userId} and subject_id = ${data.subjectId}
    `;
    const contextChunks = retrieveRelevantChunks(data.content, chunks.map((chunk) => ({ source: chunk.source, text: chunk.content }))).map(
      (chunk) => ({ source: chunk.source, text: chunk.text.slice(0, 1200) }),
    );
    const { tutorReply } = await import("@/lib/study/ai.server");
    const reply = await tutorReply({
      subjectTitle: subject.title,
      description: subject.description,
      history: history
        .reverse()
        .filter((message) => message.role === "user" || message.role === "assistant")
        .map((message) => ({ role: message.role as "user" | "assistant", content: message.content })),
      context: contextChunks,
      question: data.content,
    });
    const createdAt = nowIso();
    const userMessage: ChatMessage = {
      id: uid(),
      subjectId: data.subjectId,
      role: "user",
      content: data.content,
      timestamp: createdAt,
    };
    const assistant: ChatMessage = {
      id: uid(),
      subjectId: data.subjectId,
      role: "assistant",
      content: reply.slice(0, 12000),
      timestamp: new Date(Date.now() + 1).toISOString(),
    };
    await sql`
      insert into chat_messages (id, user_id, subject_id, role, content, created_at)
      values (${userMessage.id}, ${userId}, ${data.subjectId}, ${"user"}, ${userMessage.content}, ${userMessage.timestamp})
    `;
    await sql`
      insert into chat_messages (id, user_id, subject_id, role, content, created_at)
      values (${assistant.id}, ${userId}, ${data.subjectId}, ${"assistant"}, ${assistant.content}, ${assistant.timestamp})
    `;
    const recent = await sql<{ created_at: string }>`
      select created_at from study_sessions
      where user_id = ${userId} and type = ${"chat"} order by created_at desc limit 1
    `;
    const last = recent[0] ? new Date(recent[0].created_at).getTime() : 0;
    if (Date.now() - last > 4 * 60 * 1000) {
      await sql`
        insert into study_sessions (id, user_id, subject_id, duration_minutes, type, created_at)
        values (${uid()}, ${userId}, ${data.subjectId}, ${5}, ${"chat"}, ${nowIso()})
      `;
    }
    return { user: userMessage, assistant };
  });

export const clearChat = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { subjectId: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await db();
    await sql`delete from chat_messages where user_id = ${context.userId} and subject_id = ${data.subjectId}`;
    return { ok: true as const };
  });


export const prepareTutorContext = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { subjectId: string; content: string }) => {
    const content = (input.content ?? "").trim().slice(0, 4000);
    if (!input.subjectId || !content) throw new Error("Write a question first.");
    return { subjectId: input.subjectId, content };
  })
  .handler(async ({ context, data }) => {
    const sql = await db();
    const userId = context.userId;
    const subjects = await sql<{ title: string; description: string }>`
      select title, description from subjects where id = ${data.subjectId} and user_id = ${userId}
    `;
    const subject = subjects[0];
    if (!subject) throw new Error("Subject not found.");
    const history = await sql<{ role: string; content: string }>`
      select role, content from chat_messages
      where user_id = ${userId} and subject_id = ${data.subjectId}
      order by created_at desc limit 10
    `;
    const chunks = await sql<{ source: string; content: string }>`
      select source, content from note_chunks where user_id = ${userId} and subject_id = ${data.subjectId}
    `;
    const contextChunks = retrieveRelevantChunks(
      data.content,
      chunks.map((chunk) => ({ source: chunk.source, text: chunk.content })),
    ).map((chunk) => ({ source: chunk.source, text: chunk.text.slice(0, 1200) }));
    return {
      subjectTitle: subject.title,
      description: subject.description ?? "",
      history: history
        .reverse()
        .filter((message) => message.role === "user" || message.role === "assistant")
        .map((message) => ({ role: message.role as "user" | "assistant", content: message.content })),
      context: contextChunks,
      question: data.content,
    };
  });

export const saveTutorExchange = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { subjectId: string; question: string; reply: string }) => {
    const question = (input.question ?? "").trim().slice(0, 4000);
    const reply = (input.reply ?? "").trim().slice(0, 12000);
    if (!input.subjectId || !question || !reply) throw new Error("Missing exchange data.");
    return { subjectId: input.subjectId, question, reply };
  })
  .handler(async ({ context, data }) => {
    const sql = await db();
    const userId = context.userId;
    await assertSubject(sql, userId, data.subjectId);
    const createdAt = nowIso();
    const userMessage: ChatMessage = {
      id: uid(),
      subjectId: data.subjectId,
      role: "user",
      content: data.question,
      timestamp: createdAt,
    };
    const assistant: ChatMessage = {
      id: uid(),
      subjectId: data.subjectId,
      role: "assistant",
      content: data.reply,
      timestamp: new Date(Date.now() + 1).toISOString(),
    };
    await sql`
      insert into chat_messages (id, user_id, subject_id, role, content, created_at)
      values (${userMessage.id}, ${userId}, ${data.subjectId}, ${"user"}, ${userMessage.content}, ${userMessage.timestamp})
    `;
    await sql`
      insert into chat_messages (id, user_id, subject_id, role, content, created_at)
      values (${assistant.id}, ${userId}, ${data.subjectId}, ${"assistant"}, ${assistant.content}, ${assistant.timestamp})
    `;
    const recent = await sql<{ created_at: string }>`
      select created_at from study_sessions
      where user_id = ${userId} and type = ${"chat"} order by created_at desc limit 1
    `;
    const last = recent[0] ? new Date(recent[0].created_at).getTime() : 0;
    if (Date.now() - last > 4 * 60 * 1000) {
      await sql`
        insert into study_sessions (id, user_id, subject_id, duration_minutes, type, created_at)
        values (${uid()}, ${userId}, ${data.subjectId}, ${5}, ${"chat"}, ${nowIso()})
      `;
    }
    return { user: userMessage, assistant };
  });

/** Turn an assistant reply into a proper Q→A flashcard (offline, no API). */
function cardFromReplyText(content: string): { front: string; back: string } {
  let cleaned = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\r/g, "")
    .replace(/\*\*/g, "")
    .trim();
  if (!cleaned) throw new Error("That reply is empty.");

  const lines = cleaned
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^[-*•]\s+/, "").replace(/^\d+[.)]\s+/, ""));

  // 1) Prefer a short closing check-question as the front.
  let front = "";
  let backBody = cleaned;
  const qIdx = [...lines]
    .map((l, i) => ({ l, i }))
    .reverse()
    .find(({ l }) => /\?\s*$/.test(l) && l.length >= 12 && l.length <= 180);
  if (qIdx) {
    front = qIdx.l;
    backBody = lines.filter((_, i) => i !== qIdx.i).join("\n").trim();
  }

  // 2) Otherwise build a real question from a definition-like first sentence.
  //    "An alkane is a saturated hydrocarbon..." → "What is an alkane?"
  if (!front) {
    const first = (lines[0] ?? cleaned).split(/(?<=[.!])\s+/)[0]?.trim() ?? "";
    const def =
      first.match(
        /^(?:an?|the)\s+([A-Za-z][A-Za-z0-9\-]{1,40})\s+(?:is|are|was|were)\b/i,
      ) ||
      first.match(
        /^([A-Za-z][A-Za-z0-9\-]{1,40})\s+(?:is|are|was|were)\b/i,
      );
    if (def) {
      const term = def[1];
      const article = /^[aeiou]/i.test(term) ? "an" : "a";
      front = `What is ${article} ${term}?`;
      backBody = cleaned;
    } else if (first.endsWith("?")) {
      front = first;
      backBody = cleaned.slice(first.length).trim() || cleaned;
    } else {
      // Generic but NOT "key idea: <answer>"
      const topic = first.replace(/[.!]+$/, "").slice(0, 80).trim();
      front = topic ? `Explain: ${topic}?`.replace("??", "?") : "What is the main point of this note?";
      backBody = cleaned;
    }
  }

  // Strip the front question from the back if it was left in.
  if (front) {
    backBody = backBody
      .split("\n")
      .filter((l) => l.trim() !== front.trim())
      .join("\n")
      .trim();
  }

  // Never put the answer text into the front.
  let back = backBody.replace(/\n{3,}/g, "\n\n").trim();
  if (!back || back.length < 8) back = cleaned;
  // If front accidentally equals / contains most of back, force a short question form.
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (norm(front).includes(norm(back).slice(0, 40)) || norm(back).startsWith(norm(front).replace(/^what is (an?|the)\s+/i, ""))) {
    // keep front as question only; back stays full explanation
  }
  if (front.length > 120 && !front.endsWith("?")) {
    front = `What should you remember about this?`;
  }

  front = front.slice(0, 220).trim();
  back = back.slice(0, 800).trim();
  if (!front || !back) throw new Error("Could not make a card from that reply.");
  // Final guard: front must not be a near-copy of the back.
  if (norm(front) === norm(back) || (back.startsWith(front.replace(/^What is the key idea:\s*/i, "")) && front.length > 40)) {
    const termMatch = back.match(
      /^(?:an?|the)\s+([A-Za-z][A-Za-z0-9\-]{1,40})\s+(?:is|are)\b/i,
    );
    front = termMatch ? `What is ${/^[aeiou]/i.test(termMatch[1]) ? "an" : "a"} ${termMatch[1]}?` : "What is the main idea?";
  }
  return { front, back };
}

export const cardFromReply = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { messageId: string }) => {
    if (!input.messageId) throw new Error("Missing reply.");
    return input;
  })
  .handler(async ({ context, data }) => {
    const sql = await db();
    const rows = await sql<{ subject_id: string; content: string; role: string }>`
      select subject_id, content, role from chat_messages
      where id = ${data.messageId} and user_id = ${context.userId}
    `;
    const message = rows[0];
    if (!message || message.role !== "assistant") throw new Error("Reply not found.");

    // Prefer local/offline extraction. Only use cloud AI when XAI_API_KEY is set
    // and local parsing produces a weak card.
    let card = cardFromReplyText(message.content);
    if (process.env.XAI_API_KEY) {
      try {
        const { extractCard } = await import("@/lib/study/ai.server");
        card = await extractCard(message.content);
      } catch {
        // keep local card
      }
    }
    return insertCard(sql, context.userId, message.subject_id, card.front, card.back);
  });

export const generateFlashcards = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { subjectId: string; count?: number; extra?: string }) => {
    if (!input.subjectId) throw new Error("Pick a subject.");
    const count = Math.max(1, Math.min(12, Math.round(Number(input.count) || 8)));
    return { subjectId: input.subjectId, count, extra: (input.extra ?? "").trim().slice(0, 8000) };
  })
  .handler(async ({ context, data }) => {
    const sql = await db();
    const userId = context.userId;
    const subjects = await sql<{ title: string }>`
      select title from subjects where id = ${data.subjectId} and user_id = ${userId}
    `;
    if (!subjects[0]) throw new Error("Subject not found.");
    const chunks = await sql<{ content: string }>`
      select content from note_chunks where user_id = ${userId} and subject_id = ${data.subjectId} order by position asc limit 40
    `;
    const material = [...chunks.map((chunk) => chunk.content), data.extra].filter(Boolean).join("\n\n").slice(0, 12000);
    if (material.trim().length < 40) throw new Error("Add notes or paste a paragraph first.");
    const { generateCardsFromMaterial } = await import("@/lib/study/ai.server");
    const drafted = await generateCardsFromMaterial({
      subjectTitle: subjects[0].title,
      material,
      count: data.count,
    });
    const cards: Flashcard[] = [];
    for (const card of drafted) cards.push(await insertCard(sql, userId, data.subjectId, card.front, card.back));
    return { cards };
  });

export const generatePlan = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { subjectId: string; topics?: string; examDate: string; today: string; hoursPerDay?: number }) => {
    if (!input.subjectId) throw new Error("Pick a subject.");
    if (!isDay(input.examDate) || !isDay(input.today)) throw new Error("Pick a valid exam date.");
    if (input.examDate < input.today) throw new Error("The exam date has to be today or later.");
    const span = eachDay(input.today, input.examDate);
    if (span.length > 120) throw new Error("Pick an exam within four months.");
    const hoursPerDay = Math.max(0.5, Math.min(8, Number(input.hoursPerDay) || 2));
    return {
      subjectId: input.subjectId,
      topics: (input.topics ?? "").trim().slice(0, 4000),
      examDate: input.examDate,
      today: input.today,
      hoursPerDay,
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await db();
    const userId = context.userId;
    const subjects = await sql<{ title: string; description: string }>`
      select title, description from subjects where id = ${data.subjectId} and user_id = ${userId}
    `;
    const subject = subjects[0];
    if (!subject) throw new Error("Subject not found.");
    const { generateStudyPlan } = await import("@/lib/study/ai.server");
    const plan = await generateStudyPlan({
      title: subject.title,
      description: subject.description,
      topics: data.topics,
      today: data.today,
      examDate: data.examDate,
      hoursPerDay: data.hoursPerDay,
    });
    await sql`
      update subjects set target_date = ${data.examDate} where id = ${data.subjectId} and user_id = ${userId}
    `;
    await sql`
      delete from plan_tasks where user_id = ${userId} and subject_id = ${data.subjectId} and is_completed = false
    `;
    const tasks: PlanTask[] = [];
    for (const task of plan.tasks) {
      const row: PlanTask = {
        id: uid(),
        subjectId: data.subjectId,
        title: task.title,
        dueDate: task.dueDate,
        isCompleted: false,
      };
      await sql`
        insert into plan_tasks (id, user_id, subject_id, title, due_date, is_completed)
        values (${row.id}, ${userId}, ${row.subjectId}, ${row.title}, ${row.dueDate}, ${false})
      `;
      tasks.push(row);
    }
    return { tasks, source: plan.source };
  });

export const addTask = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { subjectId: string; title: string; dueDate: string }) => {
    const title = (input.title ?? "").trim().slice(0, 180);
    if (!input.subjectId || !title || !isDay(input.dueDate)) throw new Error("A task needs a name and a date.");
    return { subjectId: input.subjectId, title, dueDate: input.dueDate };
  })
  .handler(async ({ context, data }) => {
    const sql = await db();
    await assertSubject(sql, context.userId, data.subjectId);
    const task: PlanTask = { id: uid(), ...data, isCompleted: false };
    await sql`
      insert into plan_tasks (id, user_id, subject_id, title, due_date, is_completed)
      values (${task.id}, ${context.userId}, ${task.subjectId}, ${task.title}, ${task.dueDate}, ${false})
    `;
    return task;
  });

export const toggleTask = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await db();
    const rows = await sql<{ is_completed: unknown }>`
      select is_completed from plan_tasks where id = ${data.id} and user_id = ${context.userId}
    `;
    if (!rows[0]) throw new Error("That task is gone.");
    const next = !asBool(rows[0].is_completed);
    await sql`update plan_tasks set is_completed = ${next} where id = ${data.id} and user_id = ${context.userId}`;
    return { isCompleted: next };
  });

export const deleteTask = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await db();
    await sql`delete from plan_tasks where id = ${data.id} and user_id = ${context.userId}`;
    return { ok: true as const };
  });

async function textFromUpload(name: string, mime: string, base64: string) {
  const bytes = Buffer.from(base64, "base64");
  if (bytes.length > 4_000_000) throw new Error("File is larger than 4 MB.");
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf") || mime === "application/pdf") {
    const unpdf = (await import("unpdf")) as unknown as {
      getDocumentProxy: (data: Uint8Array) => Promise<unknown>;
      extractText: (doc: unknown, opts: { mergePages: boolean }) => Promise<{ text: string | string[] }>;
    };
    const pdf = await unpdf.getDocumentProxy(new Uint8Array(bytes));
    const result = await unpdf.extractText(pdf, { mergePages: true });
    return Array.isArray(result.text) ? result.text.join("\n") : result.text;
  }
  if (/\.(txt|md|markdown)$/.test(lower) || mime.startsWith("text/")) return bytes.toString("utf8");
  throw new Error("Upload a PDF, TXT, or Markdown file.");
}

export const ingestNote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { subjectId: string; name: string; mime?: string; base64: string }) => {
    if (!input.subjectId || !input.name || !input.base64) throw new Error("Choose a file.");
    if (input.base64.length > 8_000_000) throw new Error("File is larger than 4 MB.");
    return { subjectId: input.subjectId, name: input.name.slice(0, 180), mime: input.mime ?? "", base64: input.base64 };
  })
  .handler(async ({ context, data }) => {
    const sql = await db();
    await assertSubject(sql, context.userId, data.subjectId);
    let text = "";
    try {
      text = await textFromUpload(data.name, data.mime, data.base64);
    } catch (error) {
      if (error instanceof Error && /Upload a PDF|larger than/.test(error.message)) throw error;
      console.error("note parse", error);
      throw new Error("Could not read that file. Paste the text instead.");
    }
    text = text.replace(/\u0000/g, "").slice(0, 200_000);
    return saveChunks(sql, context.userId, data.subjectId, data.name, text);
  });

export const ingestText = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { subjectId: string; name?: string; text: string }) => {
    const text = (input.text ?? "").replace(/\u0000/g, "").trim();
    if (!input.subjectId) throw new Error("Pick a subject.");
    if (text.length < 40) throw new Error("Paste a bit more — at least a short paragraph.");
    return { subjectId: input.subjectId, name: (input.name ?? "").trim().slice(0, 120) || "Pasted notes", text: text.slice(0, 200_000) };
  })
  .handler(async ({ context, data }) => {
    const sql = await db();
    await assertSubject(sql, context.userId, data.subjectId);
    return saveChunks(sql, context.userId, data.subjectId, data.name, data.text);
  });

export const deleteNote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await db();
    await sql`delete from note_chunks where user_id = ${context.userId} and note_id = ${data.id}`;
    await sql`delete from notes where id = ${data.id} and user_id = ${context.userId}`;
    return { ok: true as const };
  });

export const seedDesk = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await db();
    const userId = context.userId;
    const dayMs = 24 * 60 * 60 * 1000;
    const noon = (offsetDays: number) => {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() + offsetDays);
      return date.toISOString();
    };
    const day = (offsetDays: number) => noon(offsetDays).slice(0, 10);
    const bioId = uid();
    const statsId = uid();
    await sql`
      insert into subjects (id, user_id, title, description, target_date, created_at)
      values (
        ${bioId}, ${userId}, ${"Cell Biology"},
        ${"Organelles, membrane transport, cellular respiration, and mitosis."},
        ${day(14)}, ${noon(-10)}
      )
    `;
    await sql`
      insert into subjects (id, user_id, title, description, target_date, created_at)
      values (
        ${statsId}, ${userId}, ${"Statistics 201"},
        ${"Probability, hypothesis tests, and regression."},
        ${day(24)}, ${noon(-9)}
      )
    `;
    const cards: [string, string, string, number, number][] = [
      [bioId, "What is the main function of mitochondria?", "Producing ATP through cellular respiration.", 6, 3],
      [bioId, "What are the phases of mitosis?", "Prophase, metaphase, anaphase, telophase, then cytokinesis.", 1, -1],
      [bioId, "What does the Golgi apparatus do?", "It modifies, sorts, and packages proteins for delivery.", 0, 0],
      [bioId, "Define osmosis.", "Passive movement of water across a membrane toward higher solute concentration.", 15, 8],
      [statsId, "What does a p-value represent?", "The probability of data at least this extreme if the null hypothesis is true.", 1, -2],
      [statsId, "When do you use a t-test instead of a z-test?", "When the population standard deviation is unknown or the sample is small.", 6, 1],
      [statsId, "What does R-squared measure?", "The share of outcome variance explained by the model.", 0, 0],
    ];
    for (const [subjectId, front, back, interval, dueOffset] of cards) {
      const reps = interval === 0 ? 0 : interval >= 6 ? 2 : 1;
      await sql`
        insert into flashcards (
          id, user_id, subject_id, front_text, back_text, easiness_factor, interval_days, repetitions, next_review_date, created_at
        ) values (
          ${uid()}, ${userId}, ${subjectId}, ${front}, ${back}, ${2.5}, ${interval}, ${reps},
          ${new Date(Date.now() + dueOffset * dayMs).toISOString()}, ${noon(-8)}
        )
      `;
    }
    const sessionDays = [-6, -5, -4, -2, -1, 0];
    for (let index = 0; index < sessionDays.length; index += 1) {
      const offset = sessionDays[index];
      await sql`
        insert into study_sessions (id, user_id, subject_id, duration_minutes, type, created_at)
        values (${uid()}, ${userId}, ${index % 2 === 0 ? bioId : statsId}, ${25}, ${"pomodoro"}, ${noon(offset)})
      `;
      await sql`
        insert into study_sessions (id, user_id, subject_id, duration_minutes, type, created_at)
        values (
          ${uid()}, ${userId}, ${index % 2 === 0 ? statsId : bioId}, ${10 + index * 5},
          ${index % 2 === 0 ? "cards" : "chat"}, ${noon(offset)}
        )
      `;
    }
    const tasks: [string, string, string, boolean][] = [
      [bioId, "Review organelle structure and function", day(-2), true],
      [bioId, "Summarize membrane transport", day(-1), true],
      [bioId, "Sketch cellular respiration from memory", day(0), false],
      [bioId, "Compare mitosis and meiosis in a table", day(2), false],
      [statsId, "Work ten hypothesis-testing problems", day(1), false],
      [statsId, "Review the assumptions of linear regression", day(4), false],
    ];
    for (const [subjectId, title, due, done] of tasks) {
      await sql`
        insert into plan_tasks (id, user_id, subject_id, title, due_date, is_completed)
        values (${uid()}, ${userId}, ${subjectId}, ${title}, ${due}, ${done})
      `;
    }
    const note = "Mitochondria produce ATP. The Golgi apparatus packages proteins. Osmosis is the passive movement of water toward higher solute concentration. Mitosis phases are prophase, metaphase, anaphase, and telophase. A p-value is the probability of data at least this extreme assuming the null is true. Use a t-test when the population standard deviation is unknown. R-squared is the share of variance explained by the model.";
    await saveChunks(sql, userId, bioId, "Week 3 lecture.txt", note);
    return { ok: true as const };
  });
