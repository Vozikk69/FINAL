import { o as __toESM } from "../_runtime.mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { _ as todayKey } from "./middleware-CAVz00Rp.mjs";
import { i as Trash2 } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { L as useDesk, M as selectClass, N as toggleTask, R as useRefreshDesk, S as fieldClass, a as Field, b as deleteTask, c as Panel, f as addTask, i as EmptyLine, l as PomoPanel, r as Button, t as AppShell, w as generatePlan, x as errText } from "./ui-BEnCOF4e.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/plan-Bp7Cp5un.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var WEEKDAYS = [
	"Sun",
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat"
];
var MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec"
];
function dayLabel(value, today) {
	if (value < today) return "Overdue";
	if (value === today) return "Today";
	const [y, m, d] = value.split("-").map(Number);
	const date = new Date(y, (m || 1) - 1, d || 1);
	return `${WEEKDAYS[date.getDay()]} ${d} ${MONTHS[date.getMonth()]}`;
}
function PlanView() {
	const query = useDesk();
	const refresh = useRefreshDesk();
	const [subjectId, setSubjectId] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [note, setNote] = (0, import_react.useState)("");
	if (query.isLoading || !query.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-mute",
		children: "Loading plan…"
	});
	const data = query.data;
	const subjects = data.subjects;
	const activeId = subjectId || subjects[0]?.id || "";
	const subject = subjects.find((item) => item.id === activeId);
	const tasks = data.tasks.filter((task) => task.subjectId === activeId);
	const today = todayKey();
	const groups = /* @__PURE__ */ new Map();
	for (const task of tasks) {
		const list = groups.get(task.dueDate) ?? [];
		list.push(task);
		groups.set(task.dueDate, list);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-mute",
			children: "Plan"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl leading-none",
			children: "Exam plan"
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-[22rem_1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PomoPanel, { subjects }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					className: "p-5",
					children: subjects.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-mute",
						children: "Add a subject before building a plan."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "flex flex-col gap-3",
						onSubmit: async (event) => {
							event.preventDefault();
							const form = new FormData(event.currentTarget);
							setBusy(true);
							setNote("");
							try {
								const result = await generatePlan({ data: {
									subjectId: String(form.get("subjectId") ?? activeId),
									topics: String(form.get("topics") ?? ""),
									examDate: String(form.get("examDate") ?? ""),
									today,
									hoursPerDay: Number(form.get("hours") ?? 2)
								} });
								setNote(result.source === "tutor" ? "The tutor laid out the days. Tick them off as you go." : "Drafted from your topics without the tutor. You can still edit the list.");
								await refresh();
							} catch (error) {
								toast.error(errText(error));
							} finally {
								setBusy(false);
							}
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Subject",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									name: "subjectId",
									className: selectClass,
									value: activeId,
									onChange: (event) => setSubjectId(event.target.value),
									children: subjects.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: item.id,
										children: item.title
									}, item.id))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Exam date",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									name: "examDate",
									type: "date",
									required: true,
									defaultValue: subject?.targetDate ?? "",
									min: today,
									className: fieldClass
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Hours a day",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									name: "hours",
									type: "number",
									min: .5,
									max: 8,
									step: .5,
									defaultValue: 2,
									className: fieldClass
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Topics, one per line",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									name: "topics",
									rows: 5,
									className: `${fieldClass} py-2`,
									placeholder: "Membrane transport\nCellular respiration\nMitosis"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: busy,
								children: busy ? "Building the plan…" : "Build plan"
							}),
							note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-mute",
								children: note
							})
						]
					}, activeId)
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap items-end justify-between gap-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-3xl",
							children: subject ? subject.title : "Tasks"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-mute",
							children: [
								tasks.filter((task) => task.isCompleted).length,
								"/",
								tasks.length,
								" done"
							]
						})] })
					}),
					subjects.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-4 flex flex-col gap-2 sm:flex-row",
						onSubmit: async (event) => {
							event.preventDefault();
							const form = event.currentTarget;
							const data = new FormData(form);
							try {
								await addTask({ data: {
									subjectId: activeId,
									title: String(data.get("title") ?? ""),
									dueDate: String(data.get("dueDate") ?? today)
								} });
								form.reset();
								await refresh();
							} catch (error) {
								toast.error(errText(error));
							}
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "title",
								required: true,
								placeholder: "Add a task",
								className: "min-h-11 w-full rounded-md border border-line bg-ink px-3 text-base text-parchment outline-none placeholder:text-mute focus:border-brass"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								name: "dueDate",
								type: "date",
								required: true,
								defaultValue: today,
								className: `min-h-11 w-full rounded-md border border-line bg-ink px-3 text-base text-parchment outline-none placeholder:text-mute focus:border-brass sm:max-w-44`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								variant: "line",
								children: "Add"
							})
						]
					}),
					tasks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyLine, { children: "No tasks for this subject yet." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex flex-col gap-5",
						children: Array.from(groups.entries()).map(([date, items]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-xs tracking-wide text-mute uppercase",
							children: dayLabel(date, today)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 flex flex-col",
							children: items.map((task) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-3 border-b border-line py-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex min-h-11 min-w-0 flex-1 items-center gap-3 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										className: "size-5 accent-brass",
										checked: task.isCompleted,
										onChange: async () => {
											try {
												await toggleTask({ data: { id: task.id } });
												await refresh();
											} catch (error) {
												toast.error(errText(error));
											}
										}
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: task.isCompleted ? "text-mute line-through" : "",
										children: task.title
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": "Delete task",
									className: "grid h-11 w-11 place-items-center text-mute hover:text-coral",
									onClick: async () => {
										try {
											await deleteTask({ data: { id: task.id } });
											await refresh();
										} catch (error) {
											toast.error(errText(error));
										}
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
								})]
							}, task.id))
						})] }, date))
					})
				]
			})]
		})]
	});
}
function PlanPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanView, {}) });
}
//#endregion
export { PlanPage as component };
