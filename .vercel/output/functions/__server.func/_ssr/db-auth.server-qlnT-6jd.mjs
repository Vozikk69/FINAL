import { r as getSql } from "./db-BR-zt9mX.mjs";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/db-auth.server-qlnT-6jd.js
/**
* Minimal database auth — no Better Auth.
* Email/password + session tokens stored in Postgres (or PGLite).
*/
var SESSION_DAYS = 30;
var SESSION_COOKIE = "lumen_session";
function hashPassword(password, salt) {
	const s = salt ?? randomBytes(16).toString("hex");
	return {
		hash: scryptSync(password, s, 64).toString("hex"),
		salt: s
	};
}
function verifyPassword(password, stored) {
	const [salt, hash] = stored.split(":");
	if (!salt || !hash) return false;
	const { hash: next } = hashPassword(password, salt);
	try {
		return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(next, "hex"));
	} catch {
		return false;
	}
}
function packPassword(password) {
	const { hash, salt } = hashPassword(password);
	return `${salt}:${hash}`;
}
function newId() {
	return randomBytes(16).toString("hex");
}
async function createUser(input) {
	const sql = await getSql();
	const email = input.email.trim().toLowerCase();
	if ((await sql.query(`select id from "user" where email = $1 limit 1`, [email]))[0]) throw new Error("An account with this email already exists.");
	const id = newId();
	const now = (/* @__PURE__ */ new Date()).toISOString();
	await sql.query(`insert into "user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
     values ($1, $2, $3, false, $4, $4)`, [
		id,
		input.name.trim() || email.split("@")[0],
		email,
		now
	]);
	await sql.query(`insert into "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
     values ($1, $2, 'credential', $3, $4, $5, $5)`, [
		newId(),
		email,
		id,
		packPassword(input.password),
		now
	]);
	return {
		id,
		name: input.name.trim() || email.split("@")[0],
		email
	};
}
async function verifyCredentials(email, password) {
	const sql = await getSql();
	const normalized = email.trim().toLowerCase();
	const row = (await sql.query(`select a."userId" as "userId", u.name, u.email, a.password
     from "account" a
     join "user" u on u.id = a."userId"
     where a."providerId" = 'credential' and u.email = $1
     limit 1`, [normalized]))[0];
	if (!row?.password) return null;
	if (!verifyPassword(password, row.password)) return null;
	return {
		id: row.userId,
		name: row.name,
		email: row.email
	};
}
async function createSession(userId) {
	const sql = await getSql();
	const token = randomBytes(32).toString("hex");
	const id = newId();
	const now = /* @__PURE__ */ new Date();
	const expires = new Date(now.getTime() + 2592e6);
	await sql.query(`insert into "session" (id, "expiresAt", token, "createdAt", "updatedAt", "userId")
     values ($1, $2, $3, $4, $4, $5)`, [
		id,
		expires.toISOString(),
		token,
		now.toISOString(),
		userId
	]);
	return token;
}
async function getUserBySessionToken(token) {
	if (!token) return null;
	const sql = await getSql();
	const row = (await sql.query(`select u.id, u.name, u.email, s."expiresAt" as "expiresAt"
     from "session" s
     join "user" u on u.id = s."userId"
     where s.token = $1
     limit 1`, [token]))[0];
	if (!row) return null;
	if (new Date(row.expiresAt).getTime() < Date.now()) {
		await sql.query(`delete from "session" where token = $1`, [token]);
		return null;
	}
	return {
		id: row.id,
		name: row.name,
		email: row.email
	};
}
async function deleteSession(token) {
	if (!token) return;
	await (await getSql()).query(`delete from "session" where token = $1`, [token]);
}
function sessionCookieHeader(token, maxAgeSeconds = SESSION_DAYS * 86400) {
	return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}; Secure`;
}
function clearSessionCookieHeader() {
	return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`;
}
function readSessionCookie(request) {
	const match = (request.headers.get("cookie") ?? "").match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
	return match?.[1] ? decodeURIComponent(match[1]) : null;
}
//#endregion
export { getUserBySessionToken as a, verifyCredentials as c, deleteSession as i, createSession as n, readSessionCookie as o, createUser as r, sessionCookieHeader as s, clearSessionCookieHeader as t };
