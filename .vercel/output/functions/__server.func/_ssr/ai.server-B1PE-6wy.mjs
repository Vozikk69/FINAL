import { l as draftPlan } from "./middleware-CAVz00Rp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ai.server-B1PE-6wy.js
/** Offline-only fallback tutor. The interactive tutor itself runs in the browser model. */
async function tutorReply(input) {
	const note = input.context[0]?.text;
	if (note) {
		const excerpt = note.slice(0, 900);
		return `I can help you study **${input.subjectTitle}**. I found this related material in your notes:\n\n${excerpt}\n\nTry asking a more specific question about this passage, or open the local tutor in your browser for generated explanations.`;
	}
	return `I can help organize your study of **${input.subjectTitle}**, but the browser-based local model is needed for open-ended explanations. Try reloading the tutor so it can finish downloading its model.\n\nYour question: ${input.question.slice(0, 300)}`;
}
function cleanSentence(value) {
	return value.replace(/^[-*•\d.)\s]+/, "").replace(/\s+/g, " ").trim();
}
/** Create useful extractive cards from notes without calling an external service. */
async function generateCardsFromMaterial(input) {
	const blocks = input.material.replace(/\r/g, "").split(/\n+|(?<=[.!?])\s+/).map(cleanSentence).filter((sentence) => sentence.length >= 35 && sentence.length <= 800);
	const seen = /* @__PURE__ */ new Set();
	const cards = [];
	for (const sentence of blocks) {
		const key = sentence.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		const definition = sentence.match(/^(?:a|an|the)?\s*([A-Z][\w-]{2,40})\s+(?:is|are|means|refers to|describes)\s+(.+)$/i);
		const front = definition ? `What is ${definition[1]}?` : `What should you remember about ${input.subjectTitle}?`;
		const back = sentence.slice(0, 800);
		if (!cards.some((card) => card.back.toLowerCase() === back.toLowerCase())) cards.push({
			front,
			back
		});
		if (cards.length >= input.count) break;
	}
	if (!cards.length) throw new Error("I couldn't find enough complete facts in these notes. Add a few sentences or create cards manually.");
	return cards.map((card, index) => ({
		...card,
		front: card.front.startsWith("What should you remember") ? `Key point ${index + 1}: ${card.back.slice(0, 90)}${card.back.length > 90 ? "…" : ""}` : card.front
	}));
}
async function generateStudyPlan(input) {
	return {
		tasks: draftPlan(input),
		source: "draft"
	};
}
//#endregion
export { generateCardsFromMaterial, generateStudyPlan, tutorReply };
