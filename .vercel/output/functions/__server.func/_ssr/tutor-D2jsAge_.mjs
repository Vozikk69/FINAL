import { o as __toESM } from "../_runtime.mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { h as Download, i as Trash2, o as Send } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as saveTutorExchange, L as useDesk, O as prepareTutorContext, R as useRefreshDesk, c as Panel, h as clearChat, m as cardFromReply, r as Button, t as AppShell, x as errText } from "./ui-BEnCOF4e.mjs";
import { t as Markdown } from "../_libs/react-markdown+[...].mjs";
import { t as remarkGfm } from "../_libs/remark-gfm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tutor-D2jsAge_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var worker = null;
var nextId = 1;
var loadPromise = null;
var loadStatus = "idle";
var lastError = null;
var pending = /* @__PURE__ */ new Map();
function getWorker() {
	if (typeof window === "undefined") throw new Error("Local AI is available in the browser only.");
	if (!worker) {
		worker = new Worker(new URL("./local-ai.worker.ts", import.meta.url), { type: "module" });
		worker.onmessage = (event) => {
			const message = event.data;
			const request = pending.get(message.id);
			if (!request) return;
			if (message.type === "progress") {
				message.progress;
				request.onProgress?.(message.progress, message.status);
			} else {
				pending.delete(message.id);
				if (message.type === "error") request.reject(new Error(message.error));
				else if (message.type === "result") request.resolve(message.text);
				else request.resolve();
			}
		};
		worker.onerror = (event) => {
			const error = new Error(event.message || "The local AI worker stopped unexpectedly.");
			for (const request of pending.values()) request.reject(error);
			pending.clear();
			loadStatus = "error";
			lastError = error.message;
			loadPromise = null;
			worker?.terminate();
			worker = null;
		};
	}
	return worker;
}
function requestWorker(type, prompt, onProgress) {
	const id = nextId++;
	return new Promise((resolve, reject) => {
		pending.set(id, {
			resolve,
			reject,
			onProgress
		});
		getWorker().postMessage(type === "load" ? {
			id,
			type
		} : {
			id,
			type,
			prompt
		});
	});
}
async function loadLocalTutor(onProgress) {
	if (loadStatus === "ready") return;
	if (loadPromise) return loadPromise;
	loadStatus = "loading";
	lastError = null;
	loadPromise = (async () => {
		try {
			await requestWorker("load", void 0, onProgress);
			loadStatus = "ready";
			onProgress?.(100, "ready");
		} catch (error) {
			loadStatus = "error";
			lastError = error instanceof Error ? error.message : String(error);
			loadPromise = null;
			throw new Error(lastError);
		}
	})();
	return loadPromise;
}
function buildPrompt(input) {
	const notes = input.context.length ? input.context.slice(0, 2).map((c, i) => `[${i + 1}] (${c.source})\n${c.text.slice(0, 350)}`).join("\n\n") : "No notes matched this question.";
	let prompt = `<|im_start|>system\n${`You are Lumen, a helpful tutor for ${input.subjectTitle}. ${input.description.slice(0, 200)}\nBe accurate and concise (under 100 words). Use the notes if relevant and cite [1] or [2]. If notes do not cover the question, explain using general knowledge. End with one short check question.\nNotes:\n${notes}`}<|im_end|>\n`;
	for (const message of input.history.slice(-2)) prompt += `<|im_start|>${message.role}\n${message.content.slice(0, 350)}<|im_end|>\n`;
	return `${prompt}<|im_start|>user\n${input.question.slice(0, 700)}<|im_end|>\n<|im_start|>assistant\n`;
}
async function localTutorReply(input) {
	await loadLocalTutor();
	const result = await requestWorker("generate", buildPrompt(input));
	if (typeof result !== "string" || !result.trim()) throw new Error("The local model returned an empty reply.");
	return result;
}
function isLocalAiReady() {
	return loadStatus === "ready";
}
function TutorView() {
	const query = useDesk();
	const refresh = useRefreshDesk();
	const [subjectId, setSubjectId] = (0, import_react.useState)("");
	const [text, setText] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [savingId, setSavingId] = (0, import_react.useState)(null);
	const [modelProgress, setModelProgress] = (0, import_react.useState)(0);
	const [modelStatus, setModelStatus] = (0, import_react.useState)("idle");
	const [modelError, setModelError] = (0, import_react.useState)(null);
	const scroller = (0, import_react.useRef)(null);
	const subjects = query.data?.subjects ?? [];
	const activeId = subjectId || subjects[0]?.id || "";
	const messages = (query.data?.messages ?? []).filter((message) => message.subjectId === activeId);
	const noteCount = (query.data?.notes ?? []).filter((note) => note.subjectId === activeId).length;
	(0, import_react.useEffect)(() => {
		scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
	}, [messages.length, busy]);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		(async () => {
			try {
				setModelStatus("loading");
				setModelError(null);
				await loadLocalTutor((p, status) => {
					if (cancelled) return;
					setModelProgress(p);
					if (status === "ready") setModelStatus("ready");
				});
				if (!cancelled) {
					setModelStatus("ready");
					setModelProgress(100);
				}
			} catch (err) {
				if (!cancelled) {
					setModelStatus("error");
					const msg = err instanceof Error ? err.message : String(err);
					setModelError(msg);
					toast.error("Local model could not start. Open the app in a regular browser tab and try again.");
				}
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);
	if (query.isLoading || !query.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-mute",
		children: "Loading tutor…"
	});
	async function sendLocal() {
		const content = text.trim();
		if (!content || !activeId || busy) return;
		setText("");
		setBusy(true);
		await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
		try {
			const ctx = await prepareTutorContext({ data: {
				subjectId: activeId,
				content
			} });
			const reply = await localTutorReply({
				subjectTitle: ctx.subjectTitle,
				description: ctx.description,
				history: ctx.history,
				context: ctx.context,
				question: ctx.question
			});
			await saveTutorExchange({ data: {
				subjectId: activeId,
				question: content,
				reply
			} });
			await refresh();
		} catch (error) {
			setText(content);
			toast.error(errText(error));
		} finally {
			setBusy(false);
		}
	}
	async function send() {
		if (modelStatus === "ready" || isLocalAiReady()) await sendLocal();
		else if (modelStatus === "loading") toast.message("Still downloading the local model… try again in a moment.");
		else toast.message("The local model is not ready yet. Check the model status above.");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-[70dvh] flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-mute",
					children: "Tutor"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl leading-none",
					children: "AI Tutor"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap items-center gap-3",
					children: subjects.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "text-sm text-mute",
						children: ["Subject", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: `min-h-11 w-full rounded-md border border-line bg-ink px-3 pr-10 text-base text-parchment outline-none focus:border-brass mt-1 min-w-48`,
							value: activeId,
							onChange: (event) => setSubjectId(event.target.value),
							children: subjects.map((subject) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: subject.id,
								children: subject.title
							}, subject.id))
						})]
					})
				})]
			}),
			modelStatus !== "ready" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				className: "flex items-center gap-3 p-3 text-sm",
				children: modelStatus === "loading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4 animate-pulse text-brass" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-mute",
						children: [
							"Downloading local model (Qwen1.5-0.5B)… ",
							modelProgress,
							"%"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 h-1.5 overflow-hidden rounded-full bg-ink",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full rounded-full bg-brass transition-all duration-300",
							style: { width: `${modelProgress}%` }
						})
					})]
				})] }) : modelStatus === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-1 text-mute",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Local model unavailable", modelError ? `: ${modelError}` : "."] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs",
						children: "No API key is used. Open the app in a regular browser tab, check that WebAssembly is enabled, and retry."
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-mute",
					children: "Preparing local model…"
				})
			}),
			subjects.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "p-6 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-mute",
					children: "Add a subject first, then come back to chat with the tutor."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/subjects",
					className: "mt-3 inline-block text-brass underline",
					children: "Go to subjects"
				})]
			}) : noteCount === 0 && messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				className: "p-6 text-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-mute",
					children: "Upload notes for this subject so the tutor can use them. You can still ask general questions."
				})
			}) : null,
			subjects.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "flex min-h-[50dvh] flex-1 flex-col overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between border-b border-line px-4 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-mute",
							children: modelStatus === "ready" ? "Tutor ready" : "Preparing tutor…"
						}), messages.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "flex items-center gap-1 text-xs text-mute hover:text-parchment",
							onClick: async () => {
								try {
									await clearChat({ data: { subjectId: activeId } });
									await refresh();
									toast.success("Chat cleared");
								} catch (error) {
									toast.error(errText(error));
								}
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" }), "Clear"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						ref: scroller,
						className: "flex flex-1 flex-col gap-3 overflow-y-auto p-4",
						children: [
							messages.length === 0 && !busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "m-auto max-w-sm text-center text-sm text-mute",
								children: "Ask for an explanation, a worked example, or a check question. Replies can become cards."
							}),
							messages.map((message) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: message.role === "user" ? "ml-auto max-w-[40rem]" : "max-w-[40rem]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: message.role === "user" ? "rounded-lg bg-brass px-4 py-3 text-on-brass" : "rounded-lg bg-ink px-4 py-3",
									children: message.role === "assistant" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "tutor-md text-sm",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Markdown, {
											remarkPlugins: [remarkGfm],
											children: message.content
										})
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm whitespace-pre-wrap",
										children: message.content
									})
								}), message.role === "assistant" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "mt-1 min-h-11 text-xs text-brass disabled:opacity-50",
									disabled: savingId === message.id,
									onClick: async () => {
										setSavingId(message.id);
										try {
											await cardFromReply({ data: { messageId: message.id } });
											await refresh();
											toast.success("Saved to your cards");
										} catch (error) {
											toast.error(errText(error));
										} finally {
											setSavingId(null);
										}
									},
									children: savingId === message.id ? "Making a card…" : "Save as card"
								})]
							}, message.id)),
							busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-mute",
								children: modelStatus === "ready" ? "Thinking locally…" : "Reading the notes…"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "flex items-end gap-2 border-t border-line p-3",
						onSubmit: (event) => {
							event.preventDefault();
							send();
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: text,
							onChange: (event) => setText(event.target.value),
							onKeyDown: (event) => {
								if (event.key === "Enter" && !event.shiftKey) {
									event.preventDefault();
									send();
								}
							},
							rows: 2,
							placeholder: "Ask about a lecture, a problem, or a term.",
							className: `min-h-11 w-full rounded-md border border-line bg-ink px-3 text-base text-parchment outline-none placeholder:text-mute focus:border-brass max-h-40 py-2`
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: busy || !text.trim(),
							"aria-label": "Send",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" })
						})]
					})
				]
			})
		]
	});
}
function TutorPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TutorView, {}) });
}
//#endregion
export { TutorPage as component };
