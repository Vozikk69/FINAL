import { createMiddleware } from "@tanstack/react-start";

/**
 * Auth middleware for server functions.
 * Provides context.userId from the database session cookie.
 */
export const authMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    return next({ sendContext: { bearerToken: undefined as string | undefined } });
  })
  .server(async ({ next }) => {
    const { assertSameSiteRequest } = await import("./isolation.server");
    const { requireUserId } = await import("./verify.server");
    assertSameSiteRequest();
    const userId = await requireUserId();
    return next({ context: { userId } });
  });
