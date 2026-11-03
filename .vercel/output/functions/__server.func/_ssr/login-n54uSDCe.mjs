import { o as __toESM } from "../_runtime.mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { C as useNavigate, S as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { I as useCurrentUserState, S as fieldClass, a as Field, n as BootScreen, p as authClient, r as Button } from "./ui-BEnCOF4e.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-n54uSDCe.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginPage() {
	const { user, isPending } = useCurrentUserState();
	useNavigate();
	const [mode, setMode] = (0, import_react.useState)("in");
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BootScreen, {});
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	async function onSubmit(event) {
		event.preventDefault();
		const form = new FormData(event.currentTarget);
		const email = String(form.get("email") ?? "").trim();
		const password = String(form.get("password") ?? "");
		const name = String(form.get("name") ?? "").trim();
		setBusy(true);
		setError("");
		try {
			const result = mode === "up" ? await authClient.signUp.email({
				email,
				password,
				name,
				callbackURL: "/"
			}) : await authClient.signIn.email({
				email,
				password,
				callbackURL: "/"
			});
			if (result.error) {
				setError(result.error.message || "Could not sign in.");
				return;
			}
			window.location.href = "/";
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not sign in.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "grid min-h-dvh bg-ink text-parchment lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "hidden flex-col justify-between border-r border-line px-12 py-12 lg:flex",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-4xl",
					children: "Lumen"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-md font-display text-5xl leading-tight",
					children: "The exam is a date. The work is a rhythm."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-sm text-sm text-mute",
					children: "A tutor that reads your notes, cards that come back when you are about to forget them, and a plan that ends the day before the exam."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-mute",
					children: "Focus 25 · Break 5"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "flex items-center justify-center px-5 py-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-4xl lg:hidden",
						children: "Lumen"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-3 font-display text-4xl leading-none",
						children: mode === "up" ? "Open a desk" : "Welcome back"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-mute",
						children: "Your notes, cards, and streak stay on this account."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-6 flex flex-col gap-3",
						onSubmit,
						children: [
							mode === "up" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Name",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									name: "name",
									required: true,
									autoComplete: "name",
									className: "min-h-11 w-full rounded-md border border-line bg-ink px-3 text-base text-parchment outline-none placeholder:text-mute focus:border-brass"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Email",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									name: "email",
									type: "email",
									required: true,
									autoComplete: "email",
									className: fieldClass
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Password",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									name: "password",
									type: "password",
									required: true,
									minLength: 8,
									autoComplete: mode === "up" ? "new-password" : "current-password",
									className: fieldClass
								})
							}),
							error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-coral",
								children: error
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: busy,
								children: busy ? "One moment…" : mode === "up" ? "Create account" : "Sign in"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mt-4 min-h-11 text-sm text-mute hover:text-parchment",
						onClick: () => {
							setMode(mode === "up" ? "in" : "up");
							setError("");
						},
						children: mode === "up" ? "Already have a desk? Sign in" : "New here? Create an account"
					})
				]
			})
		})]
	});
}
//#endregion
export { LoginPage as component };
