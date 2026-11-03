import { a as getRequest } from "./ssr.mjs";
import { a as getUserBySessionToken, o as readSessionCookie } from "./db-auth.server-qlnT-6jd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/verify.server-C9jXY853.js
var DEV_USER_ID = "dev-user";
var databaseConfigured = Boolean(typeof process !== "undefined" && process.env.DATABASE_URL?.trim());
var authConfigured = !(process.env.VITE_AUTH_ENABLED === "false");
var UnauthorizedError = class extends Error {
	status = 401;
	constructor() {
		super("Unauthorized");
		this.name = "UnauthorizedError";
	}
};
async function getSessionUser(_bearerToken) {
	if (!authConfigured) return null;
	const request = getRequest();
	if (!request) return null;
	const token = readSessionCookie(request);
	const user = await getUserBySessionToken(token);
	if (!user) return null;
	return {
		id: user.id,
		email: user.email
	};
}
async function requireUserId(_bearerToken) {
	if (!authConfigured) {
		if (databaseConfigured) throw new Error("Auth is disabled (VITE_AUTH_ENABLED=false) but DATABASE_URL is set — refusing to fall back to the shared dev user against a real database.");
		return DEV_USER_ID;
	}
	const user = await getSessionUser();
	if (!user) throw new UnauthorizedError();
	return user.id;
}
//#endregion
export { requireUserId };
