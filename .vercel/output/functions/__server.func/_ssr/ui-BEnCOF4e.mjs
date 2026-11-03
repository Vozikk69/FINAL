import { o as __toESM } from "../_runtime.mjs";
import { a as require_react, i as require_jsx_runtime, r as useQueryClient, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { S as Navigate, m as useRouterState, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as getServerFnById, n as createServerFn, r as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { f as getDueCards, p as isDay, r as authMiddleware, u as eachDay } from "./middleware-CAVz00Rp.mjs";
import { c as Play, d as MessageSquare, f as Library, p as Layers, s as RotateCcw, t as X, u as Pause, v as CalendarDays, y as BookOpen } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ui-BEnCOF4e.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function post(path, body) {
	const res = await fetch(`/api/auth/${path}`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		credentials: "include",
		body: JSON.stringify(body)
	});
	const json = await res.json().catch(() => ({}));
	if (!res.ok) return {
		error: { message: typeof json.error === "string" ? json.error : json.error?.message || "Request failed" },
		data: null
	};
	return {
		data: { user: json.user ?? json.data?.user ?? null },
		error: null,
		user: json.user ?? json.data?.user ?? null
	};
}
var authClient = {
	signUp: { email: async (input) => post("sign-up/email", input) },
	signIn: { email: async (input) => post("sign-in/email", input) },
	signOut: async () => {
		await fetch("/api/auth/sign-out", {
			method: "POST",
			credentials: "include"
		});
		return { error: null };
	},
	getSession: async () => {
		const res = await fetch("/api/auth/get-session", { credentials: "include" });
		if (!res.ok) return {
			data: null,
			error: { message: "Failed to load session" }
		};
		return {
			data: await res.json(),
			error: null
		};
	}
};
async function signOut(redirectTo = "/") {
	await authClient.signOut();
	if (typeof window !== "undefined") window.location.href = redirectTo;
}
function useCurrentUserState() {
	const [state, setState] = (0, import_react.useState)({
		user: null,
		isPending: true
	});
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		(async () => {
			try {
				const { data } = await authClient.getSession();
				if (cancelled) return;
				const u = data?.user;
				if (u?.id) setState({
					user: {
						id: u.id,
						displayName: u.name ?? null,
						primaryEmail: u.email ?? null,
						profileImageUrl: null,
						isDevFallback: false
					},
					isPending: false
				});
				else setState({
					user: null,
					isPending: false
				});
			} catch {
				if (!cancelled) setState({
					user: null,
					isPending: false
				});
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);
	return (0, import_react.useMemo)(() => state, [state]);
}
function useCurrentUser() {
	return useCurrentUserState().user;
}
var SIGN_IN_PATH = "/login";
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-w-0 items-center gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brass text-sm font-medium text-on-brass",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden min-w-0 truncate text-sm font-medium md:inline",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "min-h-11 shrink-0 cursor-pointer px-1 text-sm text-mute underline-offset-4 hover:text-parchment hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
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
var getWorkspace = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("9e80a67acd6f343ffd05222830b8f3e1477d98abf640fe442f8deff244b9c850"));
var addSubject = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const title = (input.title ?? "").trim().slice(0, 120);
	if (!title) throw new Error("Give the subject a name.");
	return {
		title,
		description: (input.description ?? "").trim().slice(0, 2e3),
		targetDate: input.targetDate && isDay(input.targetDate) ? input.targetDate : null
	};
}).handler(createSsrRpc("e9b20fec11646512bda213963403c8c48a8dda9c6f9eccd3ee4738bb3351edbf"));
var updateSubject = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const title = (input.title ?? "").trim().slice(0, 120);
	if (!input.id || !title) throw new Error("Give the subject a name.");
	return {
		id: input.id,
		title,
		description: (input.description ?? "").trim().slice(0, 2e3),
		targetDate: input.targetDate && isDay(input.targetDate) ? input.targetDate : null
	};
}).handler(createSsrRpc("bbb36f35bccd67bb147f25607e332a9491793238e69d65eed4077b18286b729f"));
var deleteSubject = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input.id) throw new Error("Missing subject.");
	return input;
}).handler(createSsrRpc("89c5c6887ac7f43350246a14ce4e0a28aeb1497e93b55668332f202d7fbdaea2"));
var logSession = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!SESSION_TYPES.has(input.type)) throw new Error("Unknown session type.");
	const durationMinutes = Math.max(1, Math.min(180, Math.round(Number(input.durationMinutes) || 0)));
	return {
		subjectId: input.subjectId || null,
		durationMinutes,
		type: input.type
	};
}).handler(createSsrRpc("84eec7e28a5dc3bbe78b5c4c1f935cc8eb7ba1644764979130cab238020d43e7"));
var addFlashcard = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input.subjectId) throw new Error("Pick a subject.");
	return input;
}).handler(createSsrRpc("5fe0da5004f281e40c19a6a684fa1d12812802c23d4f75aef34f5909a2eb6155"));
var updateFlashcard = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const frontText = (input.frontText ?? "").trim().slice(0, 300);
	const backText = (input.backText ?? "").trim().slice(0, 800);
	if (!input.id || !frontText || !backText) throw new Error("A card needs both sides.");
	return {
		id: input.id,
		frontText,
		backText
	};
}).handler(createSsrRpc("56f074572b2c847111fea79b2cb65cfb73a816a17a65ebe98f1d8bf9567bac79"));
var deleteFlashcard = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("2787b8ed87bbabfb48cc45142ceffe4aeb880f84202daf016af0028c63bf975f"));
var reviewFlashcard = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input.id || input.quality < 0 || input.quality > 5) throw new Error("Invalid review.");
	return input;
}).handler(createSsrRpc("9b99b5204e032145654408d59c61398dba91b4ff06f2b72b07efd17fbe60f1d3"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const content = (input.content ?? "").trim().slice(0, 4e3);
	if (!input.subjectId || !content) throw new Error("Write a question first.");
	return {
		subjectId: input.subjectId,
		content
	};
}).handler(createSsrRpc("c914f46bcd258c0280907844bd730bdbf1425d968d95a88b902f27c3f919ad54"));
var clearChat = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("19c8a1a420c14d51de0a5f413e89df1f27c71f44337a736a126a68a4edeb8b64"));
var prepareTutorContext = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const content = (input.content ?? "").trim().slice(0, 4e3);
	if (!input.subjectId || !content) throw new Error("Write a question first.");
	return {
		subjectId: input.subjectId,
		content
	};
}).handler(createSsrRpc("23f5e7062cea5a8a21ab0abd5c76e8fdbacda85f247d2dd6e0fc0d02b579a8bc"));
var saveTutorExchange = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const question = (input.question ?? "").trim().slice(0, 4e3);
	const reply = (input.reply ?? "").trim().slice(0, 12e3);
	if (!input.subjectId || !question || !reply) throw new Error("Missing exchange data.");
	return {
		subjectId: input.subjectId,
		question,
		reply
	};
}).handler(createSsrRpc("7e73f87acd3a7184a88a845bfa246836470fd0064755b35b33ce9a990f8e1961"));
/** Turn an assistant reply into a proper Q→A flashcard (offline, no API). */
var cardFromReply = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input.messageId) throw new Error("Missing reply.");
	return input;
}).handler(createSsrRpc("8b88718ec35d4a0b192f654eb4c309de328cba90b51f22eff70b2c29e4398ccd"));
var generateFlashcards = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input.subjectId) throw new Error("Pick a subject.");
	const count = Math.max(1, Math.min(12, Math.round(Number(input.count) || 8)));
	return {
		subjectId: input.subjectId,
		count,
		extra: (input.extra ?? "").trim().slice(0, 8e3)
	};
}).handler(createSsrRpc("d6dd92cb4257e06cd719b0465edcaddcfd243ccf71f0d3a0c84e44e4818921ea"));
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
}).handler(createSsrRpc("ede15d5768585c097539dc37560b6fbcfd034978a8460ddbe21ec5a7ba16fbaf"));
var addTask = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const title = (input.title ?? "").trim().slice(0, 180);
	if (!input.subjectId || !title || !isDay(input.dueDate)) throw new Error("A task needs a name and a date.");
	return {
		subjectId: input.subjectId,
		title,
		dueDate: input.dueDate
	};
}).handler(createSsrRpc("fbfc43290c95b3ce2addd48dd3a85e25fdb8dc79e7bc59b710913f3773b22a6b"));
var toggleTask = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("0be5b6e24197181abbbab8d922b00a7966589f2b08ea50cf6e497e4030ea2825"));
var deleteTask = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("8029627e13519245807e90f7965889792eb2487f27c336721b3ec8434d4a1b21"));
var ingestNote = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input.subjectId || !input.name || !input.base64) throw new Error("Choose a file.");
	if (input.base64.length > 8e6) throw new Error("File is larger than 4 MB.");
	return {
		subjectId: input.subjectId,
		name: input.name.slice(0, 180),
		mime: input.mime ?? "",
		base64: input.base64
	};
}).handler(createSsrRpc("a943c6d421defb3734db9b3759207f476abde49515afa124d8d335998fce6465"));
var ingestText = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const text = (input.text ?? "").replace(/\u0000/g, "").trim();
	if (!input.subjectId) throw new Error("Pick a subject.");
	if (text.length < 40) throw new Error("Paste a bit more — at least a short paragraph.");
	return {
		subjectId: input.subjectId,
		name: (input.name ?? "").trim().slice(0, 120) || "Pasted notes",
		text: text.slice(0, 2e5)
	};
}).handler(createSsrRpc("9a894a068401bb0c188b7466ee70b63c36fcf9d03d839af430daac33bd0ce38c"));
var deleteNote = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("4be05b0cf7c70a478b87cc4260ddc5bc7a40a956eb296ed5c8ff708a23d00a83"));
var seedDesk = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("87acb6855a2af2022c979228be3a601f4f8c21e90e70075c944738aab1f916a5"));
function useWorkspaceQuery(userId) {
	return useQuery({
		queryKey: ["workspace", userId],
		enabled: Boolean(userId),
		queryFn: () => getWorkspace()
	});
}
var DeskContext = (0, import_react.createContext)(null);
function useDesk() {
	const value = (0, import_react.useContext)(DeskContext);
	if (!value) throw new Error("Desk is not ready.");
	return value;
}
function useRefreshDesk() {
	const client = useQueryClient();
	return () => client.invalidateQueries({ queryKey: ["workspace"] });
}
function errText(error) {
	if (error instanceof Error && error.message) return error.message.replace(/^Error:\s*/, "");
	if (typeof error === "string") return error;
	return "Something went wrong.";
}
var FOCUS = 1500;
var BREAK = 300;
var INITIAL = {
	mode: "focus",
	remaining: FOCUS,
	total: FOCUS,
	running: false,
	subjectId: null
};
var state = INITIAL;
var listeners = /* @__PURE__ */ new Set();
var timer = null;
var logger = null;
function emit() {
	for (const listener of listeners) listener();
}
function startTimer() {
	if (timer != null || typeof window === "undefined") return;
	timer = setInterval(() => {
		if (!state.running) return;
		if (state.remaining <= 1) {
			const finished = state;
			if (finished.mode === "focus") {
				logger?.({
					minutes: Math.max(1, Math.round(finished.total / 60)),
					subjectId: finished.subjectId
				});
				state = {
					mode: "break",
					remaining: BREAK,
					total: BREAK,
					running: true,
					subjectId: finished.subjectId
				};
			} else state = {
				mode: "focus",
				remaining: FOCUS,
				total: FOCUS,
				running: false,
				subjectId: finished.subjectId
			};
			emit();
			return;
		}
		state = {
			...state,
			remaining: state.remaining - 1
		};
		emit();
	}, 1e3);
}
function setPomoLogger(next) {
	logger = next;
}
function pomoToggle() {
	state = {
		...state,
		running: !state.running
	};
	if (state.running) startTimer();
	emit();
}
function pomoReset() {
	const total = state.mode === "focus" ? FOCUS : BREAK;
	state = {
		...state,
		remaining: total,
		total,
		running: false
	};
	emit();
}
function pomoEndEarly() {
	const subjectId = state.subjectId;
	const minutes = state.mode === "focus" ? Math.round((state.total - state.remaining) / 60) : 0;
	state = {
		mode: "focus",
		remaining: FOCUS,
		total: FOCUS,
		running: false,
		subjectId
	};
	emit();
	if (minutes >= 1) logger?.({
		minutes,
		subjectId
	});
}
function pomoSetSubject(subjectId) {
	state = {
		...state,
		subjectId
	};
	emit();
}
function subscribe(listener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}
function usePomo() {
	return (0, import_react.useSyncExternalStore)(subscribe, () => state, () => INITIAL);
}
function formatClock(seconds) {
	const safe = Math.max(0, seconds);
	const minutes = Math.floor(safe / 60);
	const rest = safe % 60;
	return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}
var NAV = [
	{
		to: "/",
		label: "Desk",
		icon: BookOpen
	},
	{
		to: "/subjects",
		label: "Subjects",
		icon: Library
	},
	{
		to: "/tutor",
		label: "Tutor",
		icon: MessageSquare
	},
	{
		to: "/cards",
		label: "Cards",
		icon: Layers
	},
	{
		to: "/plan",
		label: "Plan",
		icon: CalendarDays
	}
];
function Mark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		className,
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "currentColor",
				d: "M16 2.5c.7 2.8 2.6 4.6 5.4 5.3-2.8.7-4.7 2.5-5.4 5.3-.7-2.8-2.6-4.6-5.4-5.3C13.4 7.1 15.3 5.3 16 2.5z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "14.2",
				y: "14",
				width: "3.6",
				height: "5.2",
				rx: "0.4",
				fill: "currentColor"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "currentColor",
				d: "M7.5 20.2h17l-1.4 3.2H8.9l-1.4-3.2z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "currentColor",
				d: "M6 25.2h20v2.1H6z"
			})
		]
	});
}
function BootScreen() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-dvh place-items-center bg-ink px-6 text-parchment",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { className: "size-10 text-brass" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-4xl",
					children: "Lumen"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-mute",
					children: "Loading…"
				})
			]
		})
	});
}
function PomoPanel({ subjects, compact = false }) {
	const pomo = usePomo();
	const progress = pomo.total ? Math.round((pomo.total - pomo.remaining) / pomo.total * 100) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rounded-lg border border-line bg-ink", compact ? "p-3" : "p-5"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-wide text-mute uppercase",
					children: pomo.mode === "focus" ? "Focus 25" : "Break 5"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-4xl tabular-nums text-parchment",
					children: formatClock(pomo.remaining)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 h-1.5 overflow-hidden rounded-full bg-panel",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("h-full", pomo.mode === "focus" ? "bg-brass" : "bg-sage"),
					style: { width: `${progress}%` }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-3 flex flex-col gap-1 text-xs text-mute",
				children: ["Subject", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "min-h-11 w-full rounded-md border border-line bg-panel px-3 pr-10 text-sm text-parchment outline-none focus:border-brass",
					value: pomo.subjectId ?? "",
					onChange: (event) => pomoSetSubject(event.target.value || null),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "No subject"
					}), subjects.map((subject) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: subject.id,
						children: subject.title
					}, subject.id))]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: pomoToggle,
					className: "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-brass px-3 text-sm font-semibold text-on-brass",
					children: [pomo.running ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), pomo.running ? "Pause" : "Start"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: pomoReset,
					"aria-label": "Reset timer",
					className: "grid h-11 w-11 place-items-center rounded-md border border-line text-mute",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" })
				})]
			}),
			pomo.mode === "focus" && (pomo.running || pomo.remaining < pomo.total) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: pomoEndEarly,
				className: "mt-2 min-h-11 w-full text-sm text-mute hover:text-parchment",
				children: "End focus and log it"
			})
		]
	});
}
function AppShell({ children }) {
	const { user, isPending } = useCurrentUserState();
	const query = useWorkspaceQuery(user?.id);
	const qc = useQueryClient();
	const path = useRouterState({ select: (state) => state.location.pathname });
	const pomo = usePomo();
	(0, import_react.useEffect)(() => {
		setPomoLogger(async ({ minutes, subjectId }) => {
			try {
				await logSession({ data: {
					subjectId,
					durationMinutes: minutes,
					type: "pomodoro"
				} });
				await qc.invalidateQueries({ queryKey: ["workspace"] });
				toast.success(`Logged ${minutes} min of focus`);
			} catch (error) {
				toast.error(errText(error));
			}
		});
		return () => setPomoLogger(null);
	}, [qc]);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BootScreen, {});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	const due = query.data ? getDueCards(query.data.flashcards).length : 0;
	const subjects = query.data?.subjects ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskContext.Provider, {
		value: query,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-h-dvh bg-ink text-parchment",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-line bg-ink px-3 py-5 md:flex",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "flex items-center gap-2 px-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { className: "size-7 text-brass" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display text-3xl leading-none",
								children: "Lumen"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 px-2 text-xs text-mute",
							children: "Study workspace"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "mt-6 flex flex-col gap-1",
							children: NAV.map((item) => {
								const active = item.to === "/" ? path === "/" : path === item.to;
								const Icon = item.icon;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: item.to,
									className: cn("flex min-h-11 items-center gap-3 rounded-md px-3 text-sm", active ? "bg-panel text-parchment" : "text-mute hover:bg-panel hover:text-parchment"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "flex-1",
											children: item.label
										}),
										item.to === "/cards" && due > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-full bg-brass px-2 py-0.5 text-xs font-semibold text-on-brass",
											children: due
										})
									]
								}, item.to);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-auto flex flex-col gap-3",
							children: [path !== "/plan" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PomoPanel, {
								subjects,
								compact: true
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "px-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "md:pl-60",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: "sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-ink/95 px-4 py-3 backdrop-blur md:hidden",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, { className: "size-6 text-brass" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display text-2xl leading-none",
								children: "Lumen"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: pomoToggle,
								className: "inline-flex min-h-11 items-center rounded-md border border-line px-3 text-sm tabular-nums",
								children: formatClock(pomo.remaining)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
						className: "mx-auto w-full max-w-6xl px-4 py-6 pb-28 md:px-8 md:py-8 md:pb-10",
						children
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "dock fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-ink md:hidden",
					children: NAV.map((item) => {
						const active = item.to === "/" ? path === "/" : path === item.to;
						const Icon = item.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							className: cn("flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs", active ? "text-brass" : "text-mute"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" }), item.label]
						}, item.to);
					})
				})
			]
		})
	});
}
var variants = {
	primary: "bg-brass text-on-brass hover:bg-brass-deep",
	line: "border border-line bg-ink text-parchment hover:border-brass",
	ghost: "text-parchment hover:bg-panel",
	danger: "border border-line text-coral hover:border-coral"
};
function Button({ variant = "primary", className, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50", variants[variant], className),
		...props
	});
}
var fieldClass = "min-h-11 w-full rounded-md border border-line bg-ink px-3 text-base text-parchment outline-none placeholder:text-mute focus:border-brass";
/** Same as fieldClass with extra right padding so the custom select chevron does not overlap text. */
var selectClass = "min-h-11 w-full rounded-md border border-line bg-ink px-3 pr-10 text-base text-parchment outline-none focus:border-brass";
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex flex-col gap-1.5 text-sm text-mute",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }), children]
	});
}
function Panel({ className, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: cn("rounded-lg border border-line bg-panel", className),
		children
	});
}
function Meter({ value, label }) {
	const safe = Math.max(0, Math.min(100, value));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-1.5 w-full overflow-hidden rounded-full bg-ink",
		role: "progressbar",
		"aria-valuenow": safe,
		"aria-valuemin": 0,
		"aria-valuemax": 100,
		"aria-label": label,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-full rounded-full bg-brass",
			style: { width: `${safe}%` }
		})
	});
}
function Modal({ open, title, onClose, children }) {
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-end justify-center bg-ink/80 p-3 sm:items-center",
		onMouseDown: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "dialog",
			"aria-modal": "true",
			"aria-label": title,
			className: "max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-lg border border-line bg-panel p-5 shadow-2xl",
			onMouseDown: (event) => event.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl leading-none text-parchment",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					"aria-label": "Close",
					className: "grid h-11 w-11 place-items-center rounded-md text-mute hover:bg-ink hover:text-parchment",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
				})]
			}), children]
		})
	});
}
function EmptyLine({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "py-8 text-center text-sm text-mute",
		children
	});
}
//#endregion
export { saveTutorExchange as A, generateFlashcards as C, logSession as D, ingestText as E, updateSubject as F, useCurrentUserState as I, useDesk as L, selectClass as M, toggleTask as N, prepareTutorContext as O, updateFlashcard as P, useRefreshDesk as R, fieldClass as S, ingestNote as T, deleteFlashcard as _, Field as a, deleteTask as b, Panel as c, addSubject as d, addTask as f, cn as g, clearChat as h, EmptyLine as i, seedDesk as j, reviewFlashcard as k, PomoPanel as l, cardFromReply as m, BootScreen as n, Meter as o, authClient as p, Button as r, Modal as s, AppShell as t, addFlashcard as u, deleteNote as v, generatePlan as w, errText as x, deleteSubject as y };
