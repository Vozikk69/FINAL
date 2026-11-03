import { o as __toESM } from "../_runtime.mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { d as formatRelativeDue, f as getDueCards, h as previewInterval, m as isDue, t as REVIEW_BUTTONS } from "./middleware-CAVz00Rp.mjs";
import { _ as Check, i as Trash2, l as Pencil } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Route$5 } from "./router-C_dDBu3V.mjs";
import { C as generateFlashcards, D as logSession, L as useDesk, M as selectClass, P as updateFlashcard, R as useRefreshDesk, S as fieldClass, _ as deleteFlashcard, a as Field, c as Panel, g as cn, k as reviewFlashcard, o as Meter, r as Button, s as Modal, t as AppShell, u as addFlashcard, x as errText } from "./ui-BEnCOF4e.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cards-D4LOdnfX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CardsView({ startReview }) {
	const query = useDesk();
	const refresh = useRefreshDesk();
	const [subjectId, setSubjectId] = (0, import_react.useState)("all");
	const [reviewing, setReviewing] = (0, import_react.useState)(startReview);
	const [composer, setComposer] = (0, import_react.useState)(null);
	const [editing, setEditing] = (0, import_react.useState)(null);
	if (query.isLoading || !query.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-mute",
		children: "Loading cards…"
	});
	const data = query.data;
	const filtered = data.flashcards.filter((card) => subjectId === "all" || card.subjectId === subjectId);
	const due = getDueCards(filtered);
	const subjects = data.subjects;
	const queue = due.length ? due : filtered;
	if (reviewing && queue.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewSession, {
		cards: queue,
		subjects,
		onExit: async (reviewed, minutes, subject) => {
			setReviewing(false);
			if (reviewed > 0) try {
				await logSession({ data: {
					subjectId: subject,
					durationMinutes: Math.max(1, minutes),
					type: "cards"
				} });
			} catch (error) {
				toast.error(errText(error));
			}
			await refresh();
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-mute",
						children: "Cards"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl leading-none",
						children: "Flashcards"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-mute",
						children: [due.length, " due · spaced with SM-2"]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "line",
						onClick: () => setComposer("generate"),
						disabled: !subjects.length,
						children: "Generate"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => setComposer("add"),
						disabled: !subjects.length,
						children: "New card"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: `${selectClass} max-w-xs`,
					value: subjectId,
					onChange: (event) => setSubjectId(event.target.value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "all",
						children: "All subjects"
					}), subjects.map((subject) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: subject.id,
						children: subject.title
					}, subject.id))]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: !due.length && !filtered.length,
					onClick: () => setReviewing(true),
					children: due.length ? `Review ${due.length} due` : filtered.length ? "Practice these" : "Nothing to review"
				})]
			}),
			filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl",
					children: subjects.length ? "No cards yet" : "Add a subject first"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-mute",
					children: "Write a card, generate some from your notes, or save one from the tutor."
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "grid gap-2",
				children: filtered.map((card) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-3 rounded-lg border border-line bg-panel px-4 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm",
								children: card.frontText
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-mute",
								children: [
									subjects.find((subject) => subject.id === card.subjectId)?.title ?? "Subject",
									" · ",
									isDue(card) ? formatRelativeDue(card.nextReviewDate) : `Again in ${card.interval || 0}d`
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Edit card",
							className: "grid h-11 w-11 place-items-center text-mute hover:text-parchment",
							onClick: () => setEditing(card),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Delete card",
							className: "grid h-11 w-11 place-items-center text-mute hover:text-coral",
							onClick: async () => {
								try {
									await deleteFlashcard({ data: { id: card.id } });
									await refresh();
								} catch (error) {
									toast.error(errText(error));
								}
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
						})
					]
				}, card.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDialog, {
				open: composer === "add" || Boolean(editing),
				title: editing ? "Edit card" : "New card",
				subjects,
				initial: editing,
				onClose: () => {
					setComposer(null);
					setEditing(null);
				},
				onSaved: async () => {
					setComposer(null);
					setEditing(null);
					await refresh();
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GenerateDialog, {
				open: composer === "generate",
				subjects,
				defaultSubjectId: subjectId === "all" ? subjects[0]?.id ?? "" : subjectId,
				onClose: () => setComposer(null),
				onSaved: async (count) => {
					setComposer(null);
					toast.success(`${count} cards added`);
					await refresh();
				}
			})
		]
	});
}
function ReviewSession({ cards, subjects, onExit }) {
	const queue = (0, import_react.useMemo)(() => cards.map((card) => card.id), [cards]);
	const snapshot = (0, import_react.useRef)(new Map(cards.map((card) => [card.id, card])));
	const started = (0, import_react.useRef)(Date.now());
	const [index, setIndex] = (0, import_react.useState)(0);
	const [flipped, setFlipped] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const finished = index >= queue.length;
	const card = finished ? null : snapshot.current.get(queue[index]);
	async function grade(quality) {
		if (!card || busy) return;
		setBusy(true);
		try {
			await reviewFlashcard({ data: {
				id: card.id,
				quality
			} });
			setFlipped(false);
			setIndex((value) => value + 1);
		} catch (error) {
			toast.error(errText(error));
		} finally {
			setBusy(false);
		}
	}
	function leave() {
		const minutes = (Date.now() - started.current) / 6e4;
		onExit(index, minutes, card?.subjectId ?? cards[0]?.subjectId ?? null);
	}
	if (finished || !card) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		className: "mx-auto max-w-xl p-8 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mx-auto size-8 text-sage" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-3 font-display text-2xl",
				children: "Session complete"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-sm text-mute",
				children: [
					queue.length,
					" ",
					queue.length === 1 ? "card" : "cards",
					". The next dates are already set."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-5",
				onClick: leave,
				children: "Back to the deck"
			})
		]
	});
	const subject = subjects.find((item) => item.id === card.subjectId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex w-full max-w-2xl flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
							value: index / queue.length * 100,
							label: "Review progress"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-sm tabular-nums text-mute",
						children: [
							index + 1,
							" / ",
							queue.length
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						onClick: leave,
						children: "End"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "card-scene text-left",
				onClick: () => setFlipped((value) => !value),
				"aria-label": flipped ? "Show the question" : "Reveal the answer",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("card-inner", flipped && "is-flipped"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "card-face flex flex-col rounded-lg border border-line bg-panel p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-mute",
								children: subject?.title ?? "Question"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 overflow-auto font-display text-3xl leading-tight",
								children: card.frontText
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-auto pt-6 text-xs text-mute",
								children: "Tap to reveal"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "card-face card-back flex flex-col rounded-lg border border-brass bg-ink p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-brass",
								children: "Answer"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 overflow-auto text-lg leading-snug",
								children: card.backText
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-auto pt-6 text-xs text-mute",
								children: "Tap to flip back"
							})
						]
					})]
				})
			}),
			flipped ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
				children: REVIEW_BUTTONS.map((button) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					disabled: busy,
					onClick: () => grade(button.quality),
					className: cn("flex min-h-14 flex-col items-center justify-center rounded-md border px-2 text-sm font-semibold", button.quality === 1 && "border-line text-coral", button.quality === 3 && "border-line text-mute", button.quality === 4 && "border-brass bg-brass text-on-brass", button.quality === 5 && "border-line text-sage"),
					children: [button.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-normal opacity-80",
						children: previewInterval(card, button.quality)
					})]
				}, button.label))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-center text-sm text-mute",
				children: "Recall first, then grade it."
			})
		]
	});
}
function CardDialog({ open, title, subjects, initial, onClose, onSaved }) {
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
		open,
		title,
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "flex flex-col gap-3",
			onSubmit: async (event) => {
				event.preventDefault();
				const form = new FormData(event.currentTarget);
				setBusy(true);
				try {
					if (initial) await updateFlashcard({ data: {
						id: initial.id,
						frontText: String(form.get("front") ?? ""),
						backText: String(form.get("back") ?? "")
					} });
					else await addFlashcard({ data: {
						subjectId: String(form.get("subjectId") ?? ""),
						frontText: String(form.get("front") ?? ""),
						backText: String(form.get("back") ?? "")
					} });
					onSaved();
				} catch (error) {
					toast.error(errText(error));
				} finally {
					setBusy(false);
				}
			},
			children: [
				!initial && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Subject",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						name: "subjectId",
						className: "min-h-11 w-full rounded-md border border-line bg-ink px-3 pr-10 text-base text-parchment outline-none focus:border-brass",
						defaultValue: subjects[0]?.id,
						children: subjects.map((subject) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: subject.id,
							children: subject.title
						}, subject.id))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Front",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						name: "front",
						required: true,
						rows: 3,
						defaultValue: initial?.frontText ?? "",
						className: `${fieldClass} py-2`
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Back",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						name: "back",
						required: true,
						rows: 3,
						defaultValue: initial?.backText ?? "",
						className: `${fieldClass} py-2`
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: busy,
					children: busy ? "Saving…" : "Save card"
				})
			]
		})
	});
}
function GenerateDialog({ open, subjects, defaultSubjectId, onClose, onSaved }) {
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
		open,
		title: "Generate cards",
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "flex flex-col gap-3",
			onSubmit: async (event) => {
				event.preventDefault();
				const form = new FormData(event.currentTarget);
				setBusy(true);
				try {
					onSaved((await generateFlashcards({ data: {
						subjectId: String(form.get("subjectId") ?? ""),
						count: Number(form.get("count") ?? 8),
						extra: String(form.get("extra") ?? "")
					} })).cards.length);
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
						defaultValue: defaultSubjectId,
						children: subjects.map((subject) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: subject.id,
							children: subject.title
						}, subject.id))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "How many",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "count",
						type: "number",
						min: 1,
						max: 12,
						defaultValue: 8,
						className: fieldClass
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Extra material, optional",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						name: "extra",
						rows: 4,
						className: `${fieldClass} py-2`,
						placeholder: "Paste a passage if the subject has thin notes."
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: busy,
					children: busy ? "Writing cards…" : "Generate"
				})
			]
		})
	});
}
function CardsPage() {
	const { review } = Route$5.useSearch();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardsView, { startReview: review }) });
}
//#endregion
export { CardsPage as component };
