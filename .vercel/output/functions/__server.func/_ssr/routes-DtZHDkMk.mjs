import { o as __toESM } from "../_runtime.mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as todayKey, a as computeReadiness, c as daysUntil, d as formatRelativeDue, f as getDueCards, o as computeStreak, s as computeWeeklyHours } from "./middleware-CAVz00Rp.mjs";
import { a as Target, b as ArrowRight, g as Clock, m as Flame, p as Layers } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { L as useDesk, R as useRefreshDesk, c as Panel, i as EmptyLine, j as seedDesk, o as Meter, r as Button, t as AppShell, x as errText } from "./ui-BEnCOF4e.mjs";
import { a as ResponsiveContainer, i as Bar, n as YAxis, o as Tooltip, r as XAxis, t as BarChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DtZHDkMk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DeskView() {
	const query = useDesk();
	const refresh = useRefreshDesk();
	const [mounted, setMounted] = (0, import_react.useState)(false);
	const [seeding, setSeeding] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMounted(true), []);
	if (query.isLoading || !query.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-mute",
		children: "Loading…"
	});
	if (query.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		className: "p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Could not load workspace." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "mt-4",
			onClick: () => query.refetch(),
			children: "Try again"
		})]
	});
	const data = query.data;
	const streak = computeStreak(data.sessions);
	const weekly = computeWeeklyHours(data.sessions);
	const readiness = computeReadiness(data.flashcards, data.tasks);
	const due = getDueCards(data.flashcards);
	const today = todayKey();
	const todayTasks = data.tasks.filter((task) => !task.isCompleted && task.dueDate <= today);
	const subjects = new Map(data.subjects.map((subject) => [subject.id, subject]));
	const nextExam = data.subjects.map((subject) => ({
		subject,
		days: daysUntil(subject.targetDate)
	})).filter((item) => item.days !== null && item.days >= 0).sort((a, b) => a.days - b.days)[0];
	async function loadSample() {
		setSeeding(true);
		try {
			await seedDesk();
			await refresh();
			toast.success("Sample data loaded");
		} catch (error) {
			toast.error(errText(error));
		} finally {
			setSeeding(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-mute",
						children: "Dashboard"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl leading-none text-parchment",
						children: "Lumen"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-xl text-sm text-mute",
						children: nextExam ? `${nextExam.subject.title} is ${nextExam.days === 0 ? "today" : `in ${nextExam.days} day${nextExam.days === 1 ? "" : "s"}`}.` : "Streak, hours, and what is due before the exam."
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/plan",
					className: "inline-flex min-h-11 items-center gap-2 rounded-md border border-line bg-panel px-4 text-sm font-semibold",
					children: ["Plan the exam", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
				})]
			}),
			data.subjects.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-3xl",
						children: "No subjects yet"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-xl text-sm text-mute",
						children: "Add a subject to get started, or load sample data to explore the app."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/subjects",
							className: "inline-flex min-h-11 items-center rounded-md bg-brass px-4 text-sm font-semibold text-on-brass",
							children: "Add a subject"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "line",
							disabled: seeding,
							onClick: loadSample,
							children: seeding ? "Loading sample…" : "Load sample data"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "size-4 text-brass" }),
						label: "Streak",
						value: `${streak.streak} ${streak.streak === 1 ? "day" : "days"}`,
						hint: streak.studiedToday ? "You already studied today" : "One session keeps it alive"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-4 text-sage" }),
						label: "This week",
						value: `${weekly.totalHours} h`,
						hint: "Chat, cards, and focus blocks"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "size-4 text-brass" }),
						label: "Readiness",
						value: `${readiness.score}%`,
						hint: readiness.totalCards + readiness.totalTasks === 0 ? "Add cards and a plan to score it" : `${readiness.mastered}/${readiness.totalCards} cards mastered · ${readiness.completed}/${readiness.totalTasks} tasks`,
						meter: readiness.score
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "size-4 text-sage" }),
						label: "Cards due",
						value: String(due.length),
						hint: due.length ? "Due for review" : "Nothing overdue"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "p-5 lg:col-span-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl",
							children: "Hours this week"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-mute",
							children: "Seven days, all session types."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 h-56 w-full min-w-0",
							children: mounted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
								width: "100%",
								height: "100%",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
									data: weekly.data,
									barCategoryGap: "28%",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
											dataKey: "day",
											axisLine: false,
											tickLine: false,
											tick: {
												fill: "var(--color-mute)",
												fontSize: 12
											}
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
											hide: true,
											domain: [0, (max) => Math.max(1, max)]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
											cursor: { fill: "rgba(243,234,220,0.05)" },
											contentStyle: {
												background: "var(--color-ink)",
												border: "1px solid var(--color-line)",
												borderRadius: 12,
												color: "var(--color-parchment)"
											}
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
											dataKey: "hours",
											fill: "var(--color-brass)",
											radius: [
												6,
												6,
												0,
												0
											]
										})
									]
								})
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-full rounded-md bg-ink" })
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "p-5 lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl",
							children: "Due now"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-mute",
							children: "Overdue and due today."
						})] }), due.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/cards",
							search: { review: true },
							className: "inline-flex min-h-11 items-center gap-1 text-sm text-brass",
							children: ["Review ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
						})]
					}), due.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyLine, { children: "No cards due. The interval is doing its job." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 divide-y divide-line",
						children: due.slice(0, 6).map((card) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between gap-3 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm",
									children: card.frontText
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-mute",
									children: subjects.get(card.subjectId)?.title ?? "Subject"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "shrink-0 rounded-full bg-ink px-2 py-1 text-xs text-coral",
								children: formatRelativeDue(card.nextReviewDate)
							})]
						}, card.id))
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl",
						children: "Open work"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-mute",
						children: "Tasks due today or earlier."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/plan",
						className: "text-sm text-brass",
						children: "Open plan"
					})]
				}), todayTasks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyLine, { children: data.tasks.length ? "Nothing overdue. Later days are still on the plan." : "No tasks yet. Build a plan from an exam date." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 grid gap-2",
					children: todayTasks.slice(0, 6).map((task) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-3 rounded-md bg-ink px-3 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 truncate text-sm",
							children: task.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "shrink-0 text-xs text-mute",
							children: subjects.get(task.subjectId)?.title
						})]
					}, task.id))
				})]
			})
		]
	});
}
function Stat({ icon, label, value, hint, meter }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		className: "p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-xs text-mute",
				children: [icon, label]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-display text-2xl leading-none tabular-nums",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-mute",
				children: hint
			}),
			meter !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
					value: meter,
					label: "Readiness"
				})
			})
		]
	});
}
function DeskPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskView, {}) });
}
//#endregion
export { DeskPage as component };
