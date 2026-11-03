import { o as __toESM } from "../_runtime.mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { c as daysUntil } from "./middleware-CAVz00Rp.mjs";
import { i as Trash2, l as Pencil, n as Upload } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { E as ingestText, F as updateSubject, L as useDesk, R as useRefreshDesk, S as fieldClass, T as ingestNote, a as Field, c as Panel, d as addSubject, i as EmptyLine, r as Button, s as Modal, t as AppShell, v as deleteNote, x as errText, y as deleteSubject } from "./ui-BEnCOF4e.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/subjects-HNR_xx-l.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function fileToBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const result = String(reader.result ?? "");
			const comma = result.indexOf(",");
			resolve(comma >= 0 ? result.slice(comma + 1) : result);
		};
		reader.onerror = () => reject(reader.error ?? /* @__PURE__ */ new Error("Could not read that file."));
		reader.readAsDataURL(file);
	});
}
function SubjectsView() {
	const query = useDesk();
	const refresh = useRefreshDesk();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [selectedId, setSelectedId] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	if (query.isLoading || !query.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-mute",
		children: "Loading subjects…"
	});
	if (query.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Could not load subjects." });
	const data = query.data;
	const selected = data.subjects.find((subject) => subject.id === selectedId) ?? data.subjects[0] ?? null;
	const notes = selected ? data.notes.filter((note) => note.subjectId === selected.id) : [];
	async function saveSubject(input) {
		setBusy(true);
		try {
			if (editing) await updateSubject({ data: {
				id: editing.id,
				title: input.title,
				description: input.description,
				targetDate: input.targetDate || null
			} });
			else {
				const created = await addSubject({ data: {
					title: input.title,
					description: input.description,
					targetDate: input.targetDate || null
				} });
				setSelectedId(created.id);
			}
			await refresh();
			setOpen(false);
			setEditing(null);
		} catch (error) {
			toast.error(errText(error));
		} finally {
			setBusy(false);
		}
	}
	async function removeSubject(id) {
		setBusy(true);
		try {
			await deleteSubject({ data: { id } });
			if (selectedId === id) setSelectedId(null);
			await refresh();
		} catch (error) {
			toast.error(errText(error));
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-mute",
					children: "Subjects"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl leading-none",
					children: "Subjects"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => {
						setEditing(null);
						setOpen(true);
					},
					children: "Add subject"
				})]
			}),
			data.subjects.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "p-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl",
					children: "No subjects yet"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-mute",
					children: "Each subject has its own notes, cards, plan, and exam date."
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 lg:grid-cols-[16rem_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col gap-2",
					children: data.subjects.map((subject) => {
						const days = daysUntil(subject.targetDate);
						const active = selected?.id === subject.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setSelectedId(subject.id),
							className: `rounded-lg border px-3 py-3 text-left ${active ? "border-brass bg-panel" : "border-line bg-ink"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: subject.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-mute",
								children: days === null ? "No exam date" : days < 0 ? `${Math.abs(days)} days past the exam` : days === 0 ? "Exam today" : `${days} days out`
							})]
						}, subject.id);
					})
				}), selected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					className: "p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl leading-none",
								children: selected.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 max-w-2xl text-sm text-mute",
								children: selected.description || "No description yet."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "line",
									onClick: () => {
										setEditing(selected);
										setOpen(true);
									},
									"aria-label": "Edit subject",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" }), "Edit"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "danger",
									disabled: busy,
									onClick: () => removeSubject(selected.id),
									"aria-label": "Delete subject",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 grid gap-4 md:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoteUpload, { subjectId: selected.id }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotePaste, { subjectId: selected.id })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-6 text-sm text-mute",
							children: "Notes the tutor can search"
						}),
						notes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyLine, { children: "No notes yet. Upload a PDF or paste a lecture." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 divide-y divide-line",
							children: notes.map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center justify-between gap-3 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-sm",
										children: note.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-mute",
										children: [note.chunkCount, " passages"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "grid h-11 w-11 place-items-center text-mute hover:text-coral",
									"aria-label": `Delete ${note.name}`,
									onClick: async () => {
										try {
											await deleteNote({ data: { id: note.id } });
											await refresh();
										} catch (error) {
											toast.error(errText(error));
										}
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
								})]
							}, note.id))
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubjectDialog, {
				open,
				busy,
				initial: editing,
				onClose: () => {
					setOpen(false);
					setEditing(null);
				},
				onSave: saveSubject
			})
		]
	});
}
function SubjectDialog({ open, busy, initial, onClose, onSave }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
		open,
		title: initial ? "Edit subject" : "New subject",
		onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "flex flex-col gap-3",
			onSubmit: (event) => {
				event.preventDefault();
				const form = new FormData(event.currentTarget);
				onSave({
					title: String(form.get("title") ?? ""),
					description: String(form.get("description") ?? ""),
					targetDate: String(form.get("targetDate") ?? "")
				});
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "title",
						required: true,
						defaultValue: initial?.title ?? "",
						className: fieldClass,
						placeholder: "Organic chemistry"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "What it covers",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						name: "description",
						defaultValue: initial?.description ?? "",
						rows: 3,
						className: `${fieldClass} py-2`,
						placeholder: "Mechanisms, spectroscopy, synthesis."
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Exam date",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "targetDate",
						type: "date",
						defaultValue: initial?.targetDate ?? "",
						className: fieldClass
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: busy,
					children: busy ? "Saving…" : "Save subject"
				})
			]
		})
	});
}
function NoteUpload({ subjectId }) {
	const refresh = useRefreshDesk();
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "rounded-md border border-dashed border-line p-4",
		onSubmit: async (event) => {
			event.preventDefault();
			const input = event.currentTarget.elements.namedItem("file");
			const file = input instanceof HTMLInputElement ? input.files?.[0] : void 0;
			if (!file) return;
			if (file.size > 4e6) {
				toast.error("File is larger than 4 MB.");
				return;
			}
			setBusy(true);
			try {
				const base64 = await fileToBase64(file);
				const saved = await ingestNote({ data: {
					subjectId,
					name: file.name,
					mime: file.type,
					base64
				} });
				toast.success(`${saved.name} · ${saved.chunkCount} passages`);
				event.currentTarget.reset();
				await refresh();
			} catch (error) {
				toast.error(errText(error));
			} finally {
				setBusy(false);
			}
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex items-center gap-2 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4 text-brass" }), "Upload notes"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-mute",
				children: "PDF, TXT, or Markdown. Up to 4 MB."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				name: "file",
				type: "file",
				accept: ".pdf,.txt,.md,.markdown,text/plain,application/pdf",
				className: "mt-3 block w-full text-sm text-mute file:mr-3 file:min-h-11 file:rounded-md file:border-0 file:bg-brass file:px-3 file:font-semibold file:text-on-brass"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-3",
				type: "submit",
				disabled: busy,
				children: busy ? "Reading…" : "Add to subject"
			})
		]
	});
}
function NotePaste({ subjectId }) {
	const refresh = useRefreshDesk();
	const [text, setText] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "rounded-md border border-line p-4",
		onSubmit: async (event) => {
			event.preventDefault();
			setBusy(true);
			try {
				const saved = await ingestText({ data: {
					subjectId,
					text,
					name: "Pasted notes"
				} });
				toast.success(`${saved.chunkCount} passages saved`);
				setText("");
				await refresh();
			} catch (error) {
				toast.error(errText(error));
			} finally {
				setBusy(false);
			}
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
			label: "Or paste a lecture",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				value: text,
				onChange: (event) => setText(event.target.value),
				rows: 4,
				className: `${fieldClass} py-2`,
				placeholder: "Drop the passage you want the tutor to know."
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			className: "mt-3",
			type: "submit",
			disabled: busy || text.trim().length < 40,
			children: busy ? "Saving…" : "Save paste"
		})]
	});
}
function SubjectsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubjectsView, {}) });
}
//#endregion
export { SubjectsPage as component };
