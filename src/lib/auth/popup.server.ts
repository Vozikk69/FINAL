/** Popup OAuth removed — email/password DB auth only. */
export async function handleAuthPopupRequest(_req: Request): Promise<Response> {
  return new Response("Sign-in popup is disabled. Use email/password on /login.", {
    status: 404,
    headers: { "content-type": "text/plain" },
  });
}
