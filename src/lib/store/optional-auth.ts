import { createMiddleware } from "@tanstack/react-start";

/**
 * Forwards the live-preview bearer token and resolves an optional session.
 * Guest checkout must not require a user.
 */
export const optionalAuthMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getBearerToken } = await import("@/lib/auth/client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    const { getSessionUser } = await import("@/lib/auth/verify.server");
    assertSameSiteRequest();
    const user = await getSessionUser(context.bearerToken);
    return next({
      context: {
        userId: user?.id ?? null,
        userEmail: user?.email ?? null,
      },
    });
  });
