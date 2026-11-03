import { t as createMiddleware } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/middleware-CAVz00Rp.js
var REVIEW_BUTTONS = [
	{
		label: "Again",
		quality: 1,
		hint: "Forgot it"
	},
	{
		label: "Hard",
		quality: 3,
		hint: "Recalled with effort"
	},
	{
		label: "Good",
		quality: 4,
		hint: "After a pause"
	},
	{
		label: "Easy",
		quality: 5,
		hint: "Instant"
	}
];
var DAY_MS = 864e5;
function applySm2(card, quality, now = /* @__PURE__ */ new Date()) {
	let { easinessFactor, interval, repetitions } = card;
	if (quality < 3) {
		repetitions = 0;
		interval = 1;
	} else {
		repetitions += 1;
		if (repetitions === 1) interval = 1;
		else if (repetitions === 2) interval = 6;
		else interval = Math.max(1, Math.round(interval * easinessFactor));
	}
	const delta = 5 - quality;
	easinessFactor = Math.max(1.3, easinessFactor + (.1 - delta * (.08 + delta * .02)));
	easinessFactor = Math.round(easinessFactor * 100) / 100;
	return {
		easinessFactor,
		interval,
		repetitions,
		nextReviewDate: new Date(now.getTime() + interval * DAY_MS).toISOString()
	};
}
function previewInterval(card, quality) {
	const { interval } = applySm2(card, quality);
	if (interval <= 1) return "1 day";
	return `${interval} days`;
}
function isDue(card, now = /* @__PURE__ */ new Date()) {
	return new Date(card.nextReviewDate).getTime() <= now.getTime();
}
function isMastered(card) {
	return card.interval >= 6;
}
function toDayKey(date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function todayKey(now = /* @__PURE__ */ new Date()) {
	return toDayKey(now);
}
function computeStreak(sessions, now = /* @__PURE__ */ new Date()) {
	const days = new Set(sessions.map((session) => toDayKey(new Date(session.createdAt))));
	const cursor = new Date(now);
	if (!days.has(toDayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
	let streak = 0;
	while (days.has(toDayKey(cursor))) {
		streak += 1;
		cursor.setDate(cursor.getDate() - 1);
	}
	return {
		streak,
		studiedToday: days.has(toDayKey(now))
	};
}
function computeWeeklyHours(sessions, now = /* @__PURE__ */ new Date()) {
	const buckets = Array.from({ length: 7 }, (_, index) => {
		const date = new Date(now);
		date.setDate(date.getDate() - (6 - index));
		return {
			key: toDayKey(date),
			day: date.toLocaleDateString(void 0, { weekday: "short" }),
			minutes: 0
		};
	});
	const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));
	for (const session of sessions) {
		const bucket = byKey.get(toDayKey(new Date(session.createdAt)));
		if (bucket) bucket.minutes += session.durationMinutes;
	}
	const data = buckets.map((bucket) => ({
		day: bucket.day,
		hours: Math.round(bucket.minutes / 60 * 10) / 10
	}));
	return {
		data,
		totalHours: Math.round(data.reduce((sum, item) => sum + item.hours, 0) * 10) / 10
	};
}
function computeReadiness(flashcards, tasks) {
	const mastered = flashcards.filter(isMastered).length;
	const completed = tasks.filter((task) => task.isCompleted).length;
	const parts = [flashcards.length ? mastered / flashcards.length : null, tasks.length ? completed / tasks.length : null].filter((value) => value !== null);
	return {
		score: parts.length ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length * 100) : 0,
		mastered,
		totalCards: flashcards.length,
		completed,
		totalTasks: tasks.length
	};
}
function getDueCards(flashcards, now = /* @__PURE__ */ new Date()) {
	return flashcards.filter((card) => isDue(card, now)).sort((a, b) => new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime());
}
function formatRelativeDue(iso, now = /* @__PURE__ */ new Date()) {
	const diffDays = Math.floor((now.getTime() - new Date(iso).getTime()) / DAY_MS);
	if (diffDays <= 0) return "Due today";
	if (diffDays === 1) return "1 day overdue";
	return `${diffDays} days overdue`;
}
function daysUntil(date, now = /* @__PURE__ */ new Date()) {
	if (!date) return null;
	const [y, m, d] = date.split("-").map(Number);
	if (!y || !m || !d) return null;
	const target = new Date(y, m - 1, d);
	const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	return Math.round((target.getTime() - start.getTime()) / DAY_MS);
}
var STOPWORDS = new Set("the a an and or but of to in on for with is are was were be been it this that these those as at by from what which who how why when where can do does did i you we they he she its their our your about into than then so if not no yes explain tell me give".split(" "));
function tokenize(text) {
	return text.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 2 && !STOPWORDS.has(token));
}
function chunkText(text, size = 900, overlap = 150) {
	const clean = text.replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
	if (!clean) return [];
	const chunks = [];
	let start = 0;
	while (start < clean.length) {
		let end = Math.min(start + size, clean.length);
		if (end < clean.length) {
			const breakAt = Math.max(clean.lastIndexOf("\n", end), clean.lastIndexOf(". ", end));
			if (breakAt > start + size / 2) end = breakAt + 1;
		}
		chunks.push(clean.slice(start, end).trim());
		if (end >= clean.length) break;
		start = Math.max(end - overlap, start + 1);
	}
	return chunks.filter(Boolean);
}
function retrieveRelevantChunks(query, notes, limit = 4) {
	const queryTokens = Array.from(new Set(tokenize(query)));
	const all = notes.map((note) => ({
		...note,
		tokens: tokenize(note.text)
	}));
	if (!all.length) return [];
	if (!queryTokens.length) return all.slice(0, limit).map(({ source, text }) => ({
		source,
		text
	}));
	const documentFrequency = /* @__PURE__ */ new Map();
	for (const chunk of all) for (const token of new Set(chunk.tokens)) documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1);
	const scored = all.map((chunk) => {
		const termCounts = /* @__PURE__ */ new Map();
		for (const token of chunk.tokens) termCounts.set(token, (termCounts.get(token) ?? 0) + 1);
		let score = 0;
		for (const token of queryTokens) {
			const tf = termCounts.get(token) ?? 0;
			if (!tf) continue;
			const idf = Math.log(1 + all.length / (documentFrequency.get(token) ?? 1));
			score += tf / (tf + 1.2) * idf;
		}
		return {
			source: chunk.source,
			text: chunk.text,
			score
		};
	});
	const hits = scored.filter((chunk) => chunk.score > 0).sort((a, b) => b.score - a.score);
	return (hits.length ? hits : scored).slice(0, limit).map(({ source, text }) => ({
		source,
		text
	}));
}
function parseDay(value) {
	const [y, m, d] = value.split("-").map(Number);
	return new Date(y, (m || 1) - 1, d || 1);
}
function fmtDay(date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function eachDay(start, end) {
	const days = [];
	const cursor = parseDay(start);
	const last = parseDay(end);
	while (cursor <= last && days.length < 130) {
		days.push(fmtDay(cursor));
		cursor.setDate(cursor.getDate() + 1);
	}
	return days;
}
function isDay(value) {
	return /^\d{4}-\d{2}-\d{2}$/.test(value);
}
function draftPlan(input) {
	const days = eachDay(input.today, input.examDate);
	if (!days.length) return [];
	const perDay = input.hoursPerDay >= 2.5 ? 3 : input.hoursPerDay >= 1.5 ? 2 : 1;
	const rawTopics = input.topics.split(/\n|,/).map((topic) => topic.trim()).filter((topic) => topic.length > 1);
	const topics = rawTopics.length ? rawTopics : [
		`Skim the map of ${input.title}`,
		input.description ? "Turn the description into a one-page outline" : `List the core ideas in ${input.title}`,
		"Work a first set of practice problems",
		"Re-teach the hardest idea out loud",
		"Mixed practice from earlier topics"
	];
	const workDays = days.length > 2 ? days.slice(0, -2) : days.slice(0, -1);
	const reviewDay = days.length > 2 ? days[days.length - 2] : null;
	const examDay = days[days.length - 1];
	const tasks = [];
	let topicIndex = 0;
	for (const day of workDays) for (let slot = 0; slot < perDay && tasks.length < 36; slot += 1) {
		const topic = topics[topicIndex % topics.length];
		const pass = Math.floor(topicIndex / topics.length);
		const title = pass === 0 ? `Study: ${topic}` : pass === 1 ? `Practice problems — ${topic}` : `Recall from memory — ${topic}`;
		tasks.push({
			title: title.slice(0, 180),
			dueDate: day
		});
		topicIndex += 1;
	}
	if (reviewDay) tasks.push({
		title: `Mixed review of ${input.title}`.slice(0, 180),
		dueDate: reviewDay
	});
	if (examDay) tasks.push({
		title: `Timed practice exam — ${input.title}`.slice(0, 180),
		dueDate: examDay
	});
	return tasks.slice(0, 40);
}
/**
* Auth middleware for server functions.
* Provides context.userId from the database session cookie.
*/
var authMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	return next({ sendContext: { bearerToken: void 0 } });
}).server(async ({ next }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-ZQG4KQcM.mjs");
	const { requireUserId } = await import("./verify.server-C9jXY853.mjs");
	assertSameSiteRequest();
	return next({ context: { userId: await requireUserId() } });
});
//#endregion
export { todayKey as _, computeReadiness as a, daysUntil as c, formatRelativeDue as d, getDueCards as f, retrieveRelevantChunks as g, previewInterval as h, chunkText as i, draftPlan as l, isDue as m, applySm2 as n, computeStreak as o, isDay as p, authMiddleware as r, computeWeeklyHours as s, REVIEW_BUTTONS as t, eachDay as u };
