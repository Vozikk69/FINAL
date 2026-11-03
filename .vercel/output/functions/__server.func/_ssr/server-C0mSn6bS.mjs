import { n as createServerFn, r as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { g as retrieveRelevantChunks, i as chunkText, n as applySm2, p as isDay, r as authMiddleware, u as eachDay } from "./middleware-CAVz00Rp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-C0mSn6bS.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var SESSION_TYPES = /* @__PURE__ */ new Set([
	"chat",
	"cards",
	"pomodoro"
]);
function uid() {
	return crypto.randomUUID();
}
function nowIso() {
	return (/* @__PURE__ */ new Date()).toISOString();
}
function asBool(value) {
	return value === true || value === "t" || value === "true" || value === 1 || value === "1";
}
function num(value, fallback = 0) {
	const n = typeof value === "number" ? value : Number(value);
	return Number.isFinite(n) ? n : fallback;
}
async function db() {
	const { getSql } = await import("./db-BR-zt9mX.mjs").then((n) => n.n).then((n) => n.t);
	return getSql();
}
async function assertSubject(sql, userId, subjectId) {
	if (!(await sql`select id from subjects where id = ${subjectId} and user_id = ${userId}`).length) throw new Error("Subject not found.");
}
async function saveChunks(sql, userId, subjectId, name, text) {
	if (num((await sql`
    select count(*) as n from notes where user_id = ${userId} and subject_id = ${subjectId}
  `)[0]?.n) >= 30) throw new Error("This subject already has 30 notes.");
	const chunks = chunkText(text).slice(0, 200);
	if (!chunks.length) throw new Error("No readable text found in that note.");
	const noteId = uid();
	const createdAt = nowIso();
	await sql`
    insert into notes (id, user_id, subject_id, name, created_at)
    values (${noteId}, ${userId}, ${subjectId}, ${name}, ${createdAt})
  `;
	for (let position = 0; position < chunks.length; position += 1) await sql`
      insert into note_chunks (id, user_id, note_id, subject_id, source, content, position)
      values (${uid()}, ${userId}, ${noteId}, ${subjectId}, ${name}, ${chunks[position]}, ${position})
    `;
	return {
		id: noteId,
		name,
		chunkCount: chunks.length,
		createdAt
	};
}
var getWorkspace_createServerFn_handler = createServerRpc({
	id: "9e80a67acd6f343ffd05222830b8f3e1477d98abf640fe442f8deff244b9c850",
	name: "getWorkspace",
	filename: "src/lib/study/server.ts"
}, (opts) => getWorkspace.__executeServer(opts));
var getWorkspace = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getWorkspace_createServerFn_handler, async ({ context }) => {
	const sql = await db();
	const userId = context.userId;
	const subjects = await sql`
      select id, title, description, target_date, created_at
      from subjects where user_id = ${userId} order by created_at asc
    `;
	const sessions = await sql`
      select id, subject_id, duration_minutes, type, created_at from study_sessions
      where user_id = ${userId} order by created_at desc limit 1000
    `;
	const cards = await sql`
      select id, subject_id, front_text, back_text, easiness_factor, interval_days, repetitions, next_review_date, created_at
      from flashcards where user_id = ${userId} order by next_review_date asc
    `;
	const messages = await sql`
      select id, subject_id, role, content, created_at from (
        select id, subject_id, role, content, created_at from chat_messages
        where user_id = ${userId} order by created_at desc limit 200
      ) recent order by created_at asc
    `;
	const tasks = await sql`
      select id, subject_id, title, due_date, is_completed from plan_tasks
      where user_id = ${userId} order by due_date asc, title asc
    `;
	const notes = await sql`
      select n.id, n.subject_id, n.name, n.created_at,
        (select count(*) from note_chunks c where c.note_id = n.id and c.user_id = n.user_id) as chunk_count
      from notes n where n.user_id = ${userId} order by n.created_at desc
    `;
	return {
		subjects: subjects.map((row) => ({
			id: row.id,
			title: row.title,
			description: row.description,
			targetDate: row.target_date,
			createdAt: row.created_at
		})),
		sessions: sessions.map((row) => ({
			id: row.id,
			subjectId: row.subject_id,
			durationMinutes: num(row.duration_minutes),
			type: SESSION_TYPES.has(row.type) ? row.type : "pomodoro",
			createdAt: row.created_at
		})).reverse(),
		flashcards: cards.map((row) => ({
			id: row.id,
			subjectId: row.subject_id,
			frontText: row.front_text,
			backText: row.back_text,
			easinessFactor: num(row.easiness_factor, 2.5),
			interval: num(row.interval_days),
			repetitions: num(row.repetitions),
			nextReviewDate: row.next_review_date,
			createdAt: row.created_at
		})),
		messages: messages.filter((row) => row.role === "user" || row.role === "assistant").map((row) => ({
			id: row.id,
			subjectId: row.subject_id,
			role: row.role,
			content: row.content,
			timestamp: row.created_at
		})),
		tasks: tasks.map((row) => ({
			id: row.id,
			subjectId: row.subject_id,
			title: row.title,
			dueDate: row.due_date,
			isCompleted: asBool(row.is_completed)
		})),
		notes: notes.map((row) => ({
			id: row.id,
			subjectId: row.subject_id,
			name: row.name,
			chunkCount: num(row.chunk_count),
			createdAt: row.created_at
		}))
	};
});
var addSubject_createServerFn_handler = createServerRpc({
	id: "e9b20fec11646512bda213963403c8c48a8dda9c6f9eccd3ee4738bb3351edbf",
	name: "addSubject",
	filename: "src/lib/study/server.ts"
}, (opts) => addSubject.__executeServer(opts));
var addSubject = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const title = (input.title ?? "").trim().slice(0, 120);
	if (!title) throw new Error("Give the subject a name.");
	return {
		title,
		description: (input.description ?? "").trim().slice(0, 2e3),
		targetDate: input.targetDate && isDay(input.targetDate) ? input.targetDate : null
	};
}).handler(addSubject_createServerFn_handler, async ({ context, data }) => {
	const sql = await db();
	const subject = {
		id: uid(),
		title: data.title,
		description: data.description,
		targetDate: data.targetDate,
		createdAt: nowIso()
	};
	await sql`
      insert into subjects (id, user_id, title, description, target_date, created_at)
      values (${subject.id}, ${context.userId}, ${subject.title}, ${subject.description}, ${subject.targetDate}, ${subject.createdAt})
    `;
	return subject;
});
var updateSubject_createServerFn_handler = createServerRpc({
	id: "bbb36f35bccd67bb147f25607e332a9491793238e69d65eed4077b18286b729f",
	name: "updateSubject",
	filename: "src/lib/study/server.ts"
}, (opts) => updateSubject.__executeServer(opts));
var updateSubject = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const title = (input.title ?? "").trim().slice(0, 120);
	if (!input.id || !title) throw new Error("Give the subject a name.");
	return {
		id: input.id,
		title,
		description: (input.description ?? "").trim().slice(0, 2e3),
		targetDate: input.targetDate && isDay(input.targetDate) ? input.targetDate : null
	};
}).handler(updateSubject_createServerFn_handler, async ({ context, data }) => {
	await (await db())`
      update subjects set title = ${data.title}, description = ${data.description}, target_date = ${data.targetDate}
      where id = ${data.id} and user_id = ${context.userId}
    `;
	return { ok: true };
});
var deleteSubject_createServerFn_handler = createServerRpc({
	id: "89c5c6887ac7f43350246a14ce4e0a28aeb1497e93b55668332f202d7fbdaea2",
	name: "deleteSubject",
	filename: "src/lib/study/server.ts"
}, (opts) => deleteSubject.__executeServer(opts));
var deleteSubject = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input.id) throw new Error("Missing subject.");
	return input;
}).handler(deleteSubject_createServerFn_handler, async ({ context, data }) => {
	const sql = await db();
	const userId = context.userId;
	await sql`delete from note_chunks where user_id = ${userId} and subject_id = ${data.id}`;
	await sql`delete from notes where user_id = ${userId} and subject_id = ${data.id}`;
	await sql`delete from chat_messages where user_id = ${userId} and subject_id = ${data.id}`;
	await sql`delete from plan_tasks where user_id = ${userId} and subject_id = ${data.id}`;
	await sql`delete from flashcards where user_id = ${userId} and subject_id = ${data.id}`;
	await sql`update study_sessions set subject_id = null where user_id = ${userId} and subject_id = ${data.id}`;
	await sql`delete from subjects where id = ${data.id} and user_id = ${userId}`;
	return { ok: true };
});
var logSession_createServerFn_handler = createServerRpc({
	id: "84eec7e28a5dc3bbe78b5c4c1f935cc8eb7ba1644764979130cab238020d43e7",
	name: "logSession",
	filename: "src/lib/study/server.ts"
}, (opts) => logSession.__executeServer(opts));
var logSession = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!SESSION_TYPES.has(input.type)) throw new Error("Unknown session type.");
	const durationMinutes = Math.max(1, Math.min(180, Math.round(Number(input.durationMinutes) || 0)));
	return {
		subjectId: input.subjectId || null,
		durationMinutes,
		type: input.type
	};
}).handler(logSession_createServerFn_handler, async ({ context, data }) => {
	const sql = await db();
	if (data.subjectId) await assertSubject(sql, context.userId, data.subjectId);
	const session = {
		id: uid(),
		subjectId: data.subjectId,
		durationMinutes: data.durationMinutes,
		type: data.type,
		createdAt: nowIso()
	};
	await sql`
      insert into study_sessions (id, user_id, subject_id, duration_minutes, type, created_at)
      values (${session.id}, ${context.userId}, ${session.subjectId}, ${session.durationMinutes}, ${session.type}, ${session.createdAt})
    `;
	return session;
});
async function insertCard(sql, userId, subjectId, front, back) {
	const card = {
		id: uid(),
		subjectId,
		frontText: front.trim().slice(0, 300),
		backText: back.trim().slice(0, 800),
		easinessFactor: 2.5,
		interval: 0,
		repetitions: 0,
		nextReviewDate: nowIso(),
		createdAt: nowIso()
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
var addFlashcard_createServerFn_handler = createServerRpc({
	id: "5fe0da5004f281e40c19a6a684fa1d12812802c23d4f75aef34f5909a2eb6155",
	name: "addFlashcard",
	filename: "src/lib/study/server.ts"
}, (opts) => addFlashcard.__executeServer(opts));
var addFlashcard = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input.subjectId) throw new Error("Pick a subject.");
	return input;
}).handler(addFlashcard_createServerFn_handler, async ({ context, data }) => {
	const sql = await db();
	await assertSubject(sql, context.userId, data.subjectId);
	return insertCard(sql, context.userId, data.subjectId, data.frontText, data.backText);
});
var updateFlashcard_createServerFn_handler = createServerRpc({
	id: "56f074572b2c847111fea79b2cb65cfb73a816a17a65ebe98f1d8bf9567bac79",
	name: "updateFlashcard",
	filename: "src/lib/study/server.ts"
}, (opts) => updateFlashcard.__executeServer(opts));
var updateFlashcard = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const frontText = (input.frontText ?? "").trim().slice(0, 300);
	const backText = (input.backText ?? "").trim().slice(0, 800);
	if (!input.id || !frontText || !backText) throw new Error("A card needs both sides.");
	return {
		id: input.id,
		frontText,
		backText
	};
}).handler(updateFlashcard_createServerFn_handler, async ({ context, data }) => {
	await (await db())`
      update flashcards set front_text = ${data.frontText}, back_text = ${data.backText}
      where id = ${data.id} and user_id = ${context.userId}
    `;
	return { ok: true };
});
var deleteFlashcard_createServerFn_handler = createServerRpc({
	id: "2787b8ed87bbabfb48cc45142ceffe4aeb880f84202daf016af0028c63bf975f",
	name: "deleteFlashcard",
	filename: "src/lib/study/server.ts"
}, (opts) => deleteFlashcard.__executeServer(opts));
var deleteFlashcard = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(deleteFlashcard_createServerFn_handler, async ({ context, data }) => {
	await (await db())`delete from flashcards where id = ${data.id} and user_id = ${context.userId}`;
	return { ok: true };
});
var reviewFlashcard_createServerFn_handler = createServerRpc({
	id: "9b99b5204e032145654408d59c61398dba91b4ff06f2b72b07efd17fbe60f1d3",
	name: "reviewFlashcard",
	filename: "src/lib/study/server.ts"
}, (opts) => reviewFlashcard.__executeServer(opts));
var reviewFlashcard = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input.id || input.quality < 0 || input.quality > 5) throw new Error("Invalid review.");
	return input;
}).handler(reviewFlashcard_createServerFn_handler, async ({ context, data }) => {
	const sql = await db();
	const row = (await sql`
      select easiness_factor, interval_days, repetitions from flashcards
      where id = ${data.id} and user_id = ${context.userId}
    `)[0];
	if (!row) throw new Error("That card is gone.");
	const next = applySm2({
		easinessFactor: num(row.easiness_factor, 2.5),
		interval: num(row.interval_days),
		repetitions: num(row.repetitions)
	}, data.quality);
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
var sendTutorMessage_createServerFn_handler = createServerRpc({
	id: "c914f46bcd258c0280907844bd730bdbf1425d968d95a88b902f27c3f919ad54",
	name: "sendTutorMessage",
	filename: "src/lib/study/server.ts"
}, (opts) => sendTutorMessage.__executeServer(opts));
var sendTutorMessage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const content = (input.content ?? "").trim().slice(0, 4e3);
	if (!input.subjectId || !content) throw new Error("Write a question first.");
	return {
		subjectId: input.subjectId,
		content
	};
}).handler(sendTutorMessage_createServerFn_handler, async ({ context, data }) => {
	const sql = await db();
	const userId = context.userId;
	const subject = (await sql`
      select title, description from subjects where id = ${data.subjectId} and user_id = ${userId}
    `)[0];
	if (!subject) throw new Error("Subject not found.");
	const history = await sql`
      select role, content from chat_messages
      where user_id = ${userId} and subject_id = ${data.subjectId}
      order by created_at desc limit 10
    `;
	const chunks = await sql`
      select source, content from note_chunks where user_id = ${userId} and subject_id = ${data.subjectId}
    `;
	const contextChunks = retrieveRelevantChunks(data.content, chunks.map((chunk) => ({
		source: chunk.source,
		text: chunk.content
	}))).map((chunk) => ({
		source: chunk.source,
		text: chunk.text.slice(0, 1200)
	}));
	const { tutorReply } = await import("./ai.server-B1PE-6wy.mjs");
	const reply = await tutorReply({
		subjectTitle: subject.title,
		description: subject.description,
		history: history.reverse().filter((message) => message.role === "user" || message.role === "assistant").map((message) => ({
			role: message.role,
			content: message.content
		})),
		context: contextChunks,
		question: data.content
	});
	const createdAt = nowIso();
	const userMessage = {
		id: uid(),
		subjectId: data.subjectId,
		role: "user",
		content: data.content,
		timestamp: createdAt
	};
	const assistant = {
		id: uid(),
		subjectId: data.subjectId,
		role: "assistant",
		content: reply.slice(0, 12e3),
		timestamp: new Date(Date.now() + 1).toISOString()
	};
	await sql`
      insert into chat_messages (id, user_id, subject_id, role, content, created_at)
      values (${userMessage.id}, ${userId}, ${data.subjectId}, ${"user"}, ${userMessage.content}, ${userMessage.timestamp})
    `;
	await sql`
      insert into chat_messages (id, user_id, subject_id, role, content, created_at)
      values (${assistant.id}, ${userId}, ${data.subjectId}, ${"assistant"}, ${assistant.content}, ${assistant.timestamp})
    `;
	const recent = await sql`
      select created_at from study_sessions
      where user_id = ${userId} and type = ${"chat"} order by created_at desc limit 1
    `;
	const last = recent[0] ? new Date(recent[0].created_at).getTime() : 0;
	if (Date.now() - last > 24e4) await sql`
        insert into study_sessions (id, user_id, subject_id, duration_minutes, type, created_at)
        values (${uid()}, ${userId}, ${data.subjectId}, ${5}, ${"chat"}, ${nowIso()})
      `;
	return {
		user: userMessage,
		assistant
	};
});
var clearChat_createServerFn_handler = createServerRpc({
	id: "19c8a1a420c14d51de0a5f413e89df1f27c71f44337a736a126a68a4edeb8b64",
	name: "clearChat",
	filename: "src/lib/study/server.ts"
}, (opts) => clearChat.__executeServer(opts));
var clearChat = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(clearChat_createServerFn_handler, async ({ context, data }) => {
	await (await db())`delete from chat_messages where user_id = ${context.userId} and subject_id = ${data.subjectId}`;
	return { ok: true };
});
var prepareTutorContext_createServerFn_handler = createServerRpc({
	id: "23f5e7062cea5a8a21ab0abd5c76e8fdbacda85f247d2dd6e0fc0d02b579a8bc",
	name: "prepareTutorContext",
	filename: "src/lib/study/server.ts"
}, (opts) => prepareTutorContext.__executeServer(opts));
var prepareTutorContext = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const content = (input.content ?? "").trim().slice(0, 4e3);
	if (!input.subjectId || !content) throw new Error("Write a question first.");
	return {
		subjectId: input.subjectId,
		content
	};
}).handler(prepareTutorContext_createServerFn_handler, async ({ context, data }) => {
	const sql = await db();
	const userId = context.userId;
	const subject = (await sql`
      select title, description from subjects where id = ${data.subjectId} and user_id = ${userId}
    `)[0];
	if (!subject) throw new Error("Subject not found.");
	const history = await sql`
      select role, content from chat_messages
      where user_id = ${userId} and subject_id = ${data.subjectId}
      order by created_at desc limit 10
    `;
	const chunks = await sql`
      select source, content from note_chunks where user_id = ${userId} and subject_id = ${data.subjectId}
    `;
	const contextChunks = retrieveRelevantChunks(data.content, chunks.map((chunk) => ({
		source: chunk.source,
		text: chunk.content
	}))).map((chunk) => ({
		source: chunk.source,
		text: chunk.text.slice(0, 1200)
	}));
	return {
		subjectTitle: subject.title,
		description: subject.description ?? "",
		history: history.reverse().filter((message) => message.role === "user" || message.role === "assistant").map((message) => ({
			role: message.role,
			content: message.content
		})),
		context: contextChunks,
		question: data.content
	};
});
var saveTutorExchange_createServerFn_handler = createServerRpc({
	id: "7e73f87acd3a7184a88a845bfa246836470fd0064755b35b33ce9a990f8e1961",
	name: "saveTutorExchange",
	filename: "src/lib/study/server.ts"
}, (opts) => saveTutorExchange.__executeServer(opts));
var saveTutorExchange = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const question = (input.question ?? "").trim().slice(0, 4e3);
	const reply = (input.reply ?? "").trim().slice(0, 12e3);
	if (!input.subjectId || !question || !reply) throw new Error("Missing exchange data.");
	return {
		subjectId: input.subjectId,
		question,
		reply
	};
}).handler(saveTutorExchange_createServerFn_handler, async ({ context, data }) => {
	const sql = await db();
	const userId = context.userId;
	await assertSubject(sql, userId, data.subjectId);
	const createdAt = nowIso();
	const userMessage = {
		id: uid(),
		subjectId: data.subjectId,
		role: "user",
		content: data.question,
		timestamp: createdAt
	};
	const assistant = {
		id: uid(),
		subjectId: data.subjectId,
		role: "assistant",
		content: data.reply,
		timestamp: new Date(Date.now() + 1).toISOString()
	};
	await sql`
      insert into chat_messages (id, user_id, subject_id, role, content, created_at)
      values (${userMessage.id}, ${userId}, ${data.subjectId}, ${"user"}, ${userMessage.content}, ${userMessage.timestamp})
    `;
	await sql`
      insert into chat_messages (id, user_id, subject_id, role, content, created_at)
      values (${assistant.id}, ${userId}, ${data.subjectId}, ${"assistant"}, ${assistant.content}, ${assistant.timestamp})
    `;
	const recent = await sql`
      select created_at from study_sessions
      where user_id = ${userId} and type = ${"chat"} order by created_at desc limit 1
    `;
	const last = recent[0] ? new Date(recent[0].created_at).getTime() : 0;
	if (Date.now() - last > 24e4) await sql`
        insert into study_sessions (id, user_id, subject_id, duration_minutes, type, created_at)
        values (${uid()}, ${userId}, ${data.subjectId}, ${5}, ${"chat"}, ${nowIso()})
      `;
	return {
		user: userMessage,
		assistant
	};
});
/** Turn an assistant reply into a proper Q→A flashcard (offline, no API). */
function cardFromReplyText(content) {
	let cleaned = content.replace(/```[\s\S]*?```/g, " ").replace(/\r/g, "").replace(/\*\*/g, "").trim();
	if (!cleaned) throw new Error("That reply is empty.");
	const lines = cleaned.split(/\n+/).map((l) => l.trim()).filter(Boolean).map((l) => l.replace(/^[-*•]\s+/, "").replace(/^\d+[.)]\s+/, ""));
	let front = "";
	let backBody = cleaned;
	const qIdx = [...lines].map((l, i) => ({
		l,
		i
	})).reverse().find(({ l }) => /\?\s*$/.test(l) && l.length >= 12 && l.length <= 180);
	if (qIdx) {
		front = qIdx.l;
		backBody = lines.filter((_, i) => i !== qIdx.i).join("\n").trim();
	}
	if (!front) {
		const first = (lines[0] ?? cleaned).split(/(?<=[.!])\s+/)[0]?.trim() ?? "";
		const def = first.match(/^(?:an?|the)\s+([A-Za-z][A-Za-z0-9\-]{1,40})\s+(?:is|are|was|were)\b/i) || first.match(/^([A-Za-z][A-Za-z0-9\-]{1,40})\s+(?:is|are|was|were)\b/i);
		if (def) {
			const term = def[1];
			front = `What is ${/^[aeiou]/i.test(term) ? "an" : "a"} ${term}?`;
			backBody = cleaned;
		} else if (first.endsWith("?")) {
			front = first;
			backBody = cleaned.slice(first.length).trim() || cleaned;
		} else {
			const topic = first.replace(/[.!]+$/, "").slice(0, 80).trim();
			front = topic ? `Explain: ${topic}?`.replace("??", "?") : "What is the main point of this note?";
			backBody = cleaned;
		}
	}
	if (front) backBody = backBody.split("\n").filter((l) => l.trim() !== front.trim()).join("\n").trim();
	let back = backBody.replace(/\n{3,}/g, "\n\n").trim();
	if (!back || back.length < 8) back = cleaned;
	const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
	if (norm(front).includes(norm(back).slice(0, 40)) || norm(back).startsWith(norm(front).replace(/^what is (an?|the)\s+/i, ""))) {}
	if (front.length > 120 && !front.endsWith("?")) front = `What should you remember about this?`;
	front = front.slice(0, 220).trim();
	back = back.slice(0, 800).trim();
	if (!front || !back) throw new Error("Could not make a card from that reply.");
	if (norm(front) === norm(back) || back.startsWith(front.replace(/^What is the key idea:\s*/i, "")) && front.length > 40) {
		const termMatch = back.match(/^(?:an?|the)\s+([A-Za-z][A-Za-z0-9\-]{1,40})\s+(?:is|are)\b/i);
		front = termMatch ? `What is ${/^[aeiou]/i.test(termMatch[1]) ? "an" : "a"} ${termMatch[1]}?` : "What is the main idea?";
	}
	return {
		front,
		back
	};
}
var cardFromReply_createServerFn_handler = createServerRpc({
	id: "8b88718ec35d4a0b192f654eb4c309de328cba90b51f22eff70b2c29e4398ccd",
	name: "cardFromReply",
	filename: "src/lib/study/server.ts"
}, (opts) => cardFromReply.__executeServer(opts));
var cardFromReply = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input.messageId) throw new Error("Missing reply.");
	return input;
}).handler(cardFromReply_createServerFn_handler, async ({ context, data }) => {
	const sql = await db();
	const message = (await sql`
      select subject_id, content, role from chat_messages
      where id = ${data.messageId} and user_id = ${context.userId}
    `)[0];
	if (!message || message.role !== "assistant") throw new Error("Reply not found.");
	const card = cardFromReplyText(message.content);
	return insertCard(sql, context.userId, message.subject_id, card.front, card.back);
});
var generateFlashcards_createServerFn_handler = createServerRpc({
	id: "d6dd92cb4257e06cd719b0465edcaddcfd243ccf71f0d3a0c84e44e4818921ea",
	name: "generateFlashcards",
	filename: "src/lib/study/server.ts"
}, (opts) => generateFlashcards.__executeServer(opts));
var generateFlashcards = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input.subjectId) throw new Error("Pick a subject.");
	const count = Math.max(1, Math.min(12, Math.round(Number(input.count) || 8)));
	return {
		subjectId: input.subjectId,
		count,
		extra: (input.extra ?? "").trim().slice(0, 8e3)
	};
}).handler(generateFlashcards_createServerFn_handler, async ({ context, data }) => {
	const sql = await db();
	const userId = context.userId;
	const subjects = await sql`
      select title from subjects where id = ${data.subjectId} and user_id = ${userId}
    `;
	if (!subjects[0]) throw new Error("Subject not found.");
	const material = [...(await sql`
      select content from note_chunks where user_id = ${userId} and subject_id = ${data.subjectId} order by position asc limit 40
    `).map((chunk) => chunk.content), data.extra].filter(Boolean).join("\n\n").slice(0, 12e3);
	if (material.trim().length < 40) throw new Error("Add notes or paste a paragraph first.");
	const { generateCardsFromMaterial } = await import("./ai.server-B1PE-6wy.mjs");
	const drafted = await generateCardsFromMaterial({
		subjectTitle: subjects[0].title,
		material,
		count: data.count
	});
	const cards = [];
	for (const card of drafted) cards.push(await insertCard(sql, userId, data.subjectId, card.front, card.back));
	return { cards };
});
var generatePlan_createServerFn_handler = createServerRpc({
	id: "ede15d5768585c097539dc37560b6fbcfd034978a8460ddbe21ec5a7ba16fbaf",
	name: "generatePlan",
	filename: "src/lib/study/server.ts"
}, (opts) => generatePlan.__executeServer(opts));
var generatePlan = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input.subjectId) throw new Error("Pick a subject.");
	if (!isDay(input.examDate) || !isDay(input.today)) throw new Error("Pick a valid exam date.");
	if (input.examDate < input.today) throw new Error("The exam date has to be today or later.");
	if (eachDay(input.today, input.examDate).length > 120) throw new Error("Pick an exam within four months.");
	const hoursPerDay = Math.max(.5, Math.min(8, Number(input.hoursPerDay) || 2));
	return {
		subjectId: input.subjectId,
		topics: (input.topics ?? "").trim().slice(0, 4e3),
		examDate: input.examDate,
		today: input.today,
		hoursPerDay
	};
}).handler(generatePlan_createServerFn_handler, async ({ context, data }) => {
	const sql = await db();
	const userId = context.userId;
	const subject = (await sql`
      select title, description from subjects where id = ${data.subjectId} and user_id = ${userId}
    `)[0];
	if (!subject) throw new Error("Subject not found.");
	const { generateStudyPlan } = await import("./ai.server-B1PE-6wy.mjs");
	const plan = await generateStudyPlan({
		title: subject.title,
		description: subject.description,
		topics: data.topics,
		today: data.today,
		examDate: data.examDate,
		hoursPerDay: data.hoursPerDay
	});
	await sql`
      update subjects set target_date = ${data.examDate} where id = ${data.subjectId} and user_id = ${userId}
    `;
	await sql`
      delete from plan_tasks where user_id = ${userId} and subject_id = ${data.subjectId} and is_completed = false
    `;
	const tasks = [];
	for (const task of plan.tasks) {
		const row = {
			id: uid(),
			subjectId: data.subjectId,
			title: task.title,
			dueDate: task.dueDate,
			isCompleted: false
		};
		await sql`
        insert into plan_tasks (id, user_id, subject_id, title, due_date, is_completed)
        values (${row.id}, ${userId}, ${row.subjectId}, ${row.title}, ${row.dueDate}, ${false})
      `;
		tasks.push(row);
	}
	return {
		tasks,
		source: plan.source
	};
});
var addTask_createServerFn_handler = createServerRpc({
	id: "fbfc43290c95b3ce2addd48dd3a85e25fdb8dc79e7bc59b710913f3773b22a6b",
	name: "addTask",
	filename: "src/lib/study/server.ts"
}, (opts) => addTask.__executeServer(opts));
var addTask = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const title = (input.title ?? "").trim().slice(0, 180);
	if (!input.subjectId || !title || !isDay(input.dueDate)) throw new Error("A task needs a name and a date.");
	return {
		subjectId: input.subjectId,
		title,
		dueDate: input.dueDate
	};
}).handler(addTask_createServerFn_handler, async ({ context, data }) => {
	const sql = await db();
	await assertSubject(sql, context.userId, data.subjectId);
	const task = {
		id: uid(),
		...data,
		isCompleted: false
	};
	await sql`
      insert into plan_tasks (id, user_id, subject_id, title, due_date, is_completed)
      values (${task.id}, ${context.userId}, ${task.subjectId}, ${task.title}, ${task.dueDate}, ${false})
    `;
	return task;
});
var toggleTask_createServerFn_handler = createServerRpc({
	id: "0be5b6e24197181abbbab8d922b00a7966589f2b08ea50cf6e497e4030ea2825",
	name: "toggleTask",
	filename: "src/lib/study/server.ts"
}, (opts) => toggleTask.__executeServer(opts));
var toggleTask = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(toggleTask_createServerFn_handler, async ({ context, data }) => {
	const sql = await db();
	const rows = await sql`
      select is_completed from plan_tasks where id = ${data.id} and user_id = ${context.userId}
    `;
	if (!rows[0]) throw new Error("That task is gone.");
	const next = !asBool(rows[0].is_completed);
	await sql`update plan_tasks set is_completed = ${next} where id = ${data.id} and user_id = ${context.userId}`;
	return { isCompleted: next };
});
var deleteTask_createServerFn_handler = createServerRpc({
	id: "8029627e13519245807e90f7965889792eb2487f27c336721b3ec8434d4a1b21",
	name: "deleteTask",
	filename: "src/lib/study/server.ts"
}, (opts) => deleteTask.__executeServer(opts));
var deleteTask = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(deleteTask_createServerFn_handler, async ({ context, data }) => {
	await (await db())`delete from plan_tasks where id = ${data.id} and user_id = ${context.userId}`;
	return { ok: true };
});
async function textFromUpload(name, mime, base64) {
	const bytes = Buffer.from(base64, "base64");
	if (bytes.length > 4e6) throw new Error("File is larger than 4 MB.");
	const lower = name.toLowerCase();
	if (lower.endsWith(".pdf") || mime === "application/pdf") {
		const unpdf = await import("../_libs/unpdf.mjs").then((n) => n.t);
		const pdf = await unpdf.getDocumentProxy(new Uint8Array(bytes));
		const result = await unpdf.extractText(pdf, { mergePages: true });
		return Array.isArray(result.text) ? result.text.join("\n") : result.text;
	}
	if (/\.(txt|md|markdown)$/.test(lower) || mime.startsWith("text/")) return bytes.toString("utf8");
	throw new Error("Upload a PDF, TXT, or Markdown file.");
}
var ingestNote_createServerFn_handler = createServerRpc({
	id: "a943c6d421defb3734db9b3759207f476abde49515afa124d8d335998fce6465",
	name: "ingestNote",
	filename: "src/lib/study/server.ts"
}, (opts) => ingestNote.__executeServer(opts));
var ingestNote = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input.subjectId || !input.name || !input.base64) throw new Error("Choose a file.");
	if (input.base64.length > 8e6) throw new Error("File is larger than 4 MB.");
	return {
		subjectId: input.subjectId,
		name: input.name.slice(0, 180),
		mime: input.mime ?? "",
		base64: input.base64
	};
}).handler(ingestNote_createServerFn_handler, async ({ context, data }) => {
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
	text = text.replace(/\u0000/g, "").slice(0, 2e5);
	return saveChunks(sql, context.userId, data.subjectId, data.name, text);
});
var ingestText_createServerFn_handler = createServerRpc({
	id: "9a894a068401bb0c188b7466ee70b63c36fcf9d03d839af430daac33bd0ce38c",
	name: "ingestText",
	filename: "src/lib/study/server.ts"
}, (opts) => ingestText.__executeServer(opts));
var ingestText = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const text = (input.text ?? "").replace(/\u0000/g, "").trim();
	if (!input.subjectId) throw new Error("Pick a subject.");
	if (text.length < 40) throw new Error("Paste a bit more — at least a short paragraph.");
	return {
		subjectId: input.subjectId,
		name: (input.name ?? "").trim().slice(0, 120) || "Pasted notes",
		text: text.slice(0, 2e5)
	};
}).handler(ingestText_createServerFn_handler, async ({ context, data }) => {
	const sql = await db();
	await assertSubject(sql, context.userId, data.subjectId);
	return saveChunks(sql, context.userId, data.subjectId, data.name, data.text);
});
var deleteNote_createServerFn_handler = createServerRpc({
	id: "4be05b0cf7c70a478b87cc4260ddc5bc7a40a956eb296ed5c8ff708a23d00a83",
	name: "deleteNote",
	filename: "src/lib/study/server.ts"
}, (opts) => deleteNote.__executeServer(opts));
var deleteNote = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(deleteNote_createServerFn_handler, async ({ context, data }) => {
	const sql = await db();
	await sql`delete from note_chunks where user_id = ${context.userId} and note_id = ${data.id}`;
	await sql`delete from notes where id = ${data.id} and user_id = ${context.userId}`;
	return { ok: true };
});
var seedDesk_createServerFn_handler = createServerRpc({
	id: "87acb6855a2af2022c979228be3a601f4f8c21e90e70075c944738aab1f916a5",
	name: "seedDesk",
	filename: "src/lib/study/server.ts"
}, (opts) => seedDesk.__executeServer(opts));
var seedDesk = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(seedDesk_createServerFn_handler, async ({ context }) => {
	const sql = await db();
	const userId = context.userId;
	const dayMs = 864e5;
	const noon = (offsetDays) => {
		const date = /* @__PURE__ */ new Date();
		date.setHours(12, 0, 0, 0);
		date.setDate(date.getDate() + offsetDays);
		return date.toISOString();
	};
	const day = (offsetDays) => noon(offsetDays).slice(0, 10);
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
	const cards = [
		[
			bioId,
			"What is the main function of mitochondria?",
			"Producing ATP through cellular respiration.",
			6,
			3
		],
		[
			bioId,
			"What are the phases of mitosis?",
			"Prophase, metaphase, anaphase, telophase, then cytokinesis.",
			1,
			-1
		],
		[
			bioId,
			"What does the Golgi apparatus do?",
			"It modifies, sorts, and packages proteins for delivery.",
			0,
			0
		],
		[
			bioId,
			"Define osmosis.",
			"Passive movement of water across a membrane toward higher solute concentration.",
			15,
			8
		],
		[
			statsId,
			"What does a p-value represent?",
			"The probability of data at least this extreme if the null hypothesis is true.",
			1,
			-2
		],
		[
			statsId,
			"When do you use a t-test instead of a z-test?",
			"When the population standard deviation is unknown or the sample is small.",
			6,
			1
		],
		[
			statsId,
			"What does R-squared measure?",
			"The share of outcome variance explained by the model.",
			0,
			0
		]
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
	const sessionDays = [
		-6,
		-5,
		-4,
		-2,
		-1,
		0
	];
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
	const tasks = [
		[
			bioId,
			"Review organelle structure and function",
			day(-2),
			true
		],
		[
			bioId,
			"Summarize membrane transport",
			day(-1),
			true
		],
		[
			bioId,
			"Sketch cellular respiration from memory",
			day(0),
			false
		],
		[
			bioId,
			"Compare mitosis and meiosis in a table",
			day(2),
			false
		],
		[
			statsId,
			"Work ten hypothesis-testing problems",
			day(1),
			false
		],
		[
			statsId,
			"Review the assumptions of linear regression",
			day(4),
			false
		]
	];
	for (const [subjectId, title, due, done] of tasks) await sql`
        insert into plan_tasks (id, user_id, subject_id, title, due_date, is_completed)
        values (${uid()}, ${userId}, ${subjectId}, ${title}, ${due}, ${done})
      `;
	await saveChunks(sql, userId, bioId, "Week 3 lecture.txt", "Mitochondria produce ATP. The Golgi apparatus packages proteins. Osmosis is the passive movement of water toward higher solute concentration. Mitosis phases are prophase, metaphase, anaphase, and telophase. A p-value is the probability of data at least this extreme assuming the null is true. Use a t-test when the population standard deviation is unknown. R-squared is the share of variance explained by the model.");
	return { ok: true };
});
//#endregion
export { addFlashcard_createServerFn_handler, addSubject_createServerFn_handler, addTask_createServerFn_handler, cardFromReply_createServerFn_handler, clearChat_createServerFn_handler, deleteFlashcard_createServerFn_handler, deleteNote_createServerFn_handler, deleteSubject_createServerFn_handler, deleteTask_createServerFn_handler, generateFlashcards_createServerFn_handler, generatePlan_createServerFn_handler, getWorkspace_createServerFn_handler, ingestNote_createServerFn_handler, ingestText_createServerFn_handler, logSession_createServerFn_handler, prepareTutorContext_createServerFn_handler, reviewFlashcard_createServerFn_handler, saveTutorExchange_createServerFn_handler, seedDesk_createServerFn_handler, sendTutorMessage_createServerFn_handler, toggleTask_createServerFn_handler, updateFlashcard_createServerFn_handler, updateSubject_createServerFn_handler };
